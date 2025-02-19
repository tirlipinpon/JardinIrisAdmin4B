import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {AuthenticationApplication} from "../../services/authentication.application";

@Component({
  selector: 'app-login-with-form',
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatIconModule, MatButtonModule],
  templateUrl: './login-with-form.component.html',
  styleUrl: './login-with-form.component.css'
})
export class LoginWithFormComponent {
  private readonly application = inject(AuthenticationApplication);

  loginForm = inject(FormBuilder).group({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  });

  save(): void {
    if(this.loginForm.value.email && this.loginForm.value.password) {
      this.application.login(this.loginForm.value.email, this.loginForm.value.password);
    }
  }
  get email(): FormControl {
    return this.loginForm.controls.email;
  }

  get password(): FormControl {
    return this.loginForm.controls.password;
  }

  get isValid(): boolean {
    return this.loginForm.valid;
  }

}
