import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import{FormsModule} from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { RouterModule } from '@angular/router';
import { TaskViewComponent } from '../task/task-view/task-view.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { UsersComponent } from './users/users.component';
import {NgxPaginationModule} from 'ngx-pagination';





@NgModule({
  declarations: [ProfileComponent, DashboardComponent, UsersComponent],
  imports: [
    CommonModule,
    CarouselModule,
    FormsModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    AngularEditorModule,
    RouterModule.forRoot([
      {path:'view/:taskId',component:TaskViewComponent, pathMatch:'full'},
      {path:'allUsers',component:UsersComponent,pathMatch:'full'},
      {path:'profile/:profileId',component:ProfileComponent,pathMatch:'full'}
    ])
  ]
})
export class PersonalModule { }
