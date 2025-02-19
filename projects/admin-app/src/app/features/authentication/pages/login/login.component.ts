import {Component, inject} from '@angular/core';
import {LoginWithFormComponent} from "../../components/login-with-form/login-with-form.component";
import {AuthenticationApplication} from "../../services/authentication.application";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-login',
  imports: [LoginWithFormComponent, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isLoading = inject(AuthenticationApplication).isLoading;

}
