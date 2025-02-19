import { Component } from '@angular/core';
import {LoginWithFormComponent} from "../../components/login-with-form/login-with-form.component";

@Component({
  selector: 'app-login',
  imports: [LoginWithFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

}
