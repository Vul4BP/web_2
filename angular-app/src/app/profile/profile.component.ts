import { Component, OnInit, forwardRef, Inject } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  id: string;
  role: string;

  constructor(@Inject(forwardRef(() => HomeComponent)) private _parent: HomeComponent,
    private _auth: AuthService) { }

  ngOnInit() {
    this._parent.prikaziDesniMeni();
    this.id = this._auth.getId();
    this.role = this._auth.getRole();
  }
}
