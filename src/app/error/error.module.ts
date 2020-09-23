import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [Error404Component, Error500Component],
  imports: [
    CommonModule,
    RouterModule.forRoot([
      {path:'error500',component:Error500Component, pathMatch:'full'},
      {path:'error404',component:Error404Component,pathMatch:'full'},
    ])]
})


export class ErrorModule { }
