import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskViewComponent } from './task-view/task-view.component';
import { BrowserModule } from '@angular/platform-browser';
import {RouterModule} from '@angular/router'
import { AngularEditorModule } from '@kolkov/angular-editor';
import {FormsModule} from '@angular/forms';
import { AllTaskComponent } from './all-task/all-task.component'
import {NgxPaginationModule} from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';



@NgModule({
  declarations: [TaskViewComponent, AllTaskComponent],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    AngularEditorModule,
    RouterModule.forChild([
      {path:'view/:taskId',component:TaskViewComponent, pathMatch:'full'},
      {path:'allTasks',component:AllTaskComponent,pathMatch:'full'}
    ])
  ]
})
export class TaskModule {
}
