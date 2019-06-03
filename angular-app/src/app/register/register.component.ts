import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MainService } from '../services/main.service';
import { Router } from '@angular/router';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(@Inject(forwardRef(() => HomeComponent)) private _parent: HomeComponent,private formBuilder: FormBuilder, private _service: MainService, private router: Router) { }

  ngOnInit() {
    this._parent.prikaziDesniMeni();
  }

}
