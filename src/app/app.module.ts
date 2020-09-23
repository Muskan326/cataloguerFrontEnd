import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { RouterModule,Route } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { PersonalModule } from './personal/personal.module';
import { TaskModule } from './task/task.module';
import {ErrorModule} from './error/error.module'
import { LoginComponent } from './user/login/login.component';
import { SignupComponent } from './user/signup/signup.component';
import { FormsModule } from '@angular/forms'; 
import { DashboardComponent } from './personal/dashboard/dashboard.component';
import { ProfileComponent } from './personal/profile/profile.component';
import {Error404Component} from './error/error404/error404.component'
import {TaskViewComponent} from './task/task-view/task-view.component'
import {HttpClientModule } from '@angular/common/http';
import {HttpFunctionsService} from './services/http-functions.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { SocketServiceService } from './services/socket-service.service';
import { Error500Component } from './error/error500/error500.component';




@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    AngularEditorModule,
    TaskModule,
    FormsModule,
    UserModule,
    ErrorModule,
    PersonalModule,
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    RouterModule.forRoot([
      {path:'login', component:LoginComponent, pathMatch:'full'},
      {path:'dashboard', component:DashboardComponent, pathMatch:'full'},
      {path:'profile/:profileId', component:ProfileComponent, pathMatch:'full'},
      {path:'view/:taskId',component:TaskViewComponent, pathMatch:'full'},
      {path:'', component:LoginComponent, pathMatch:'full'},
      {path:'error500', component:Error500Component, pathMatch:'full'},
      {path:'**', component:Error404Component, pathMatch:'full'}
      
    ])

  ],
  providers: [HttpFunctionsService, BsModalService, BsModalRef],
  bootstrap: [AppComponent]
})
export class AppModule { }
