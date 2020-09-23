import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FormsModule } from '@angular/forms'; 
import{RouterModule,Route} from '@angular/router';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component'



@NgModule({
  declarations: [LoginComponent, SignupComponent, ForgotpasswordComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {path:'signup',component:SignupComponent},
      {path:'forgot',component:ForgotpasswordComponent}
    ]),
  ]
})
export class UserModule { }
