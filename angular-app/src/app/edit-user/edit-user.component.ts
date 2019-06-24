import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/models/user';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ProfileService } from '../services/profile.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {

  @Input() id: string;
  myForm: FormGroup;
  passwordForm: FormGroup;
  fileForm: FormGroup;

  selectedValue: string;
  user: User;
  message: string = '';
  messageIsError: boolean = false;
  message_password: string = '';
  message_passwordIsError: boolean = false;
  message_file: string = '';
  message_fileIsError: boolean = false;
  selectedFile: File;
  imgURL: any;

  constructor(private _service: ProfileService,private _auth: AuthService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    if(this.id != '')
    this._service.getUser(this.id)
      .subscribe(
        data => {
          this.user = data;
          var date = new Date(data.DateOfBirth);
          this.myForm = this.formBuilder.group({
            name: [this.user.Name, Validators.compose([Validators.required, Validators.minLength(2)])],
            address: [this.user.Address, Validators.compose([Validators.required, Validators.minLength(2)])],
            surname: [this.user.Surname, Validators.compose([Validators.required, Validators.minLength(2)])],
            birthday: [date, Validators.required],
          });

          this.passwordForm = this.formBuilder.group({
            old_password: ['', Validators.required],
            new_password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            repeat_password: ['', Validators.required],
          });

          this.fileForm = this.formBuilder.group({
            file: ['', Validators.required],
          });

        },
        err => {
          console.log(err);
        }
      )
  }

  public click(){
    this.message = '';
    this.message_password = '';
    this.message_file = '';
  }

  getUserPhotos(): Array<string>{
    if(this.user.Files == '' || this.user.Files == null)
      return;

    let photos = new Array<string>();
    let photoNames = this.user.Files.split(',');
    photoNames.forEach(item => {
      photos.push(`http://localhost:52295/imgs/users/${this.user.Id}/${item}`);
    });

    return photos;
  }

  get f() { return this.myForm.controls; }
  get passf() { return this.passwordForm.controls; }
  get filef() { return this.fileForm.controls; }

  isSameAsPassword(){
    if (this.passf.new_password.value != this.passf.repeat_password.value)
      this.passf.repeat_password.setErrors({'notsame': true});
  }

  changePassword(){
    this.message_password = '';
    if (this.passwordForm.invalid) {
      return;
    }
    var old_pass = this.passf.old_password.value;
    var new_pass = this.passf.new_password.value;
    var rep_pass = this.passf.repeat_password.value;

    this._service.changePassword(old_pass, new_pass, rep_pass)
      .subscribe(
        data => {
          this.DisplayPasswordMessage("Uspesno promenjena lozinka", false);
        },
        err => {
          if(err.error.ModelState[""] == "Incorrect password.")
            this.DisplayPasswordMessage("Stara lozinka nije dobra", true);
          else
            this.DisplayPasswordMessage("Desila se greska", true);
        }
      )
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];

    var reader = new FileReader();
    reader.readAsDataURL(this.selectedFile); 
    reader.onload = (_event) => { 
      this.imgURL = reader.result; 
    }
  }

  dodajSliku(){
    if(!this.selectedFile)
      return;

    this._service.uploadPhoto(this.selectedFile)
      .subscribe(
        data => {
          this.user.Files = data;
          this.DisplayFileMessage("Uspesno dodata slika", false);
          this.selectedFile = null;
          this.imgURL = '';
          this.fileForm.reset();
        },
        err =>{
          console.log(err);
          this.DisplayFileMessage("Desila se greska", true);
        }
      )
  }

  edit(){
    if (this.myForm.invalid) {
      return;
    }

    var user = new User();
    user.Dob = this.f.birthday.value;
    user.Name = this.f.name.value;
    user.Surname = this.f.surname.value;
    user.Address = this.f.address.value;
    user.Id = this.user.Id;

    var arrMonthDayYear = (user.Dob.toLocaleDateString()).split('/');
    var dobString = `${arrMonthDayYear[2]}-${arrMonthDayYear[0]}-${arrMonthDayYear[1]}`;

    this._service.editUser(user, dobString)
    .subscribe(
      data => {
        this.DisplayMessage("Uspesno izvrsene promene", false);
      },
      err => {
        console.log(err);
        this.DisplayMessage("Desila se greska", true);
      }
    )
  }

  DisplayMessage(text:string, error:boolean) {
    this.message = text;
    this.messageIsError = error;
  }

  DisplayPasswordMessage(text:string, error:boolean) {
    this.message_password = text;
    this.message_passwordIsError = error;
  }

  DisplayFileMessage(text:string, error:boolean) {
    this.message_file = text;
    this.message_fileIsError = error;
  }
}
