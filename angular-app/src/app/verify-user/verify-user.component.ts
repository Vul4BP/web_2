import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { User } from 'src/models/user';
import { Guid } from 'guid-typescript';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-verify-user',
  templateUrl: './verify-user.component.html',
  styleUrls: ['./verify-user.component.css']
})
export class VerifyUserComponent implements OnInit {

  users: Array<User>;

  message: string = '';
  messageIsError: boolean = false;
  
  constructor(private _service: ProfileService, @Inject(forwardRef(() => HomeComponent)) private _parent: HomeComponent) { }

  ngOnInit() {
    this.getProcessingUsers();
    this._parent.prikaziDesniMeni();
  }

  DisplayMessage(text:string, error:boolean) {
    this.message = text;
    this.messageIsError = error;
  }

  getUserPhotos(user: User): Array<string>{
    if(user.Files == '' || user.Files == null)
      return;

    let photos = new Array<string>();
    let photoNames = user.Files.split(',');
    photoNames.forEach(item => {
      photos.push(`http://localhost:52295/imgs/users/${user.Id}/${item}`);
    });

    return photos;
  }

  getProcessingUsers(){
    this._service.getProcessingUsers()
    .subscribe(
      data => {
        this.users = data;
      },
      err => {
        console.log(err);
      }
    )
  }

  deny(userId: Guid){
    this._service.denyUser(userId)
    .subscribe(
      data => {
        this.getProcessingUsers();
        this.DisplayMessage("Uspesno odbijen korisnik", false);
      },
      err => {
        console.log(err);
        this.DisplayMessage("Desila se greska", true);
      }
    )
  }

  verify(userId: Guid){
    this._service.verifyUser(userId)
    .subscribe(
      data => {
        this.getProcessingUsers();
        this.DisplayMessage("Uspesno verifikovan korisnik", false);
      },
      err => {
        console.log(err);
        this.DisplayMessage("Desila se greska", true);
      }
    )
  }

  public click(){
    this.message = '';
  }
}
