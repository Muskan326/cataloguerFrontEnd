import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { HttpFunctionsService } from 'src/app/services/http-functions.service';
import Swal from 'sweetalert2';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import {Location} from '@angular/common'
import { SocketServiceService } from 'src/app/services/socket-service.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.css'],
  providers:[SocketServiceService]
})
export class TaskViewComponent implements OnInit {
  public taskId;taskDetail;subtasks=new Array;just;description
  public isViewer=false;
  public parent;
  mySubscription: any;
  modalRef: BsModalRef;
  public status=['Open','Done'];
  public prev;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '10rem',
    minHeight: '5rem',
    showToolbar:true
  };
  title: any;
  allrelatedTasks: any;
  constructor(private router:Router, 
              private _route:ActivatedRoute,
              private serv:HttpFunctionsService,
              private modalService: BsModalService,
              private location:Location,
              private socketserv:SocketServiceService) 
    {
      
    this.socketserv.setUser(Cookie.get('userId')) 
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    
    this.mySubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.router.navigated = false;
      }
    });
   }

  ngOnInit(): void {
    if(Cookie.get("userId")==null || Cookie.get("userId")==undefined){
      this.router.navigate(['/login'])
    }


    this.taskId=this._route.snapshot.paramMap.get('taskId');
    this.serv.taskDetails(this.taskId).subscribe(
      data=>{
        if(data["status"]==200){
          this.taskDetail=data["data"]
          this.prev=this.taskDetail.title
          document.getElementById("description").innerHTML=this.taskDetail.description
          for(let each of this.taskDetail.viewers){
            if(Cookie.get("userId")==each){
              this.isViewer=true
            }
          }
          if(this.taskDetail.subTask.length>0){
            for(let each of this.taskDetail.subTask){
              this.serv.taskDetails(each).subscribe(
                succ=>{
                  console.log(succ)
                  if(succ["status"]==200){
                    this.subtasks.push(succ["data"])
                  }
                }
              )
            }
          }
        }
        else if(data["status"]==500){
          Swal.fire({position: 'center',icon: 'error',title: 'Server Error',html:data["message"],showConfirmButton: false,timer: 2000})
          this.router.navigate(['/error500'])
        }
        else if(data["status"]==404){
          Swal.fire({position: 'center',icon: 'error',title: 'TaskId Not Found',html:data["message"],showConfirmButton: false,timer: 2000})
          this.router.navigate(['/error404'])
        }
      }
    )

    this.serv.getRelatedTasks(Cookie.get("userId")).subscribe(
      data=>{
        if(data["status"]==200){
          this.allrelatedTasks=data["data"]
        }
        else if(data["status"]==500){
          Swal.fire({position: 'center',icon: 'error',title: 'Server Error',html:data["message"],showConfirmButton: false,timer: 2000})
          this.router.navigate(['/error500'])
        }
      }
    )
    this.fetchUpdate()
    document.onkeydown = this.KeyPress;
    
  }
  public KeyPress(e) {
    e = e || window.event;
    if ((e.keyCode == 122 || e.keyCode==90) && (e.ctrlKey|| e.metaKey)) {
        document.getElementById("undoButton").click()
    }
}

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template,{animated: true});
  }


  decline(): void {
    this.modalRef.hide();
  }

  public createSubTask(){
    if(this.title==null){
      Swal.fire({position: 'center',icon: 'warning',title: 'Please Enter the title',timer: 2000})
    }
    else{
      let val={
        taskId:this.taskDetail.taskId
      }
      this.serv.getAllParents(val).subscribe(
        data=>{
          if(data["status"]==200){
            this.parent=data["data"]
          }
          else if(data["status"]==404){
            Swal.fire({position: 'center',icon: 'error',title: 'Task Not Found',html:data["data"],timer: 2000})
            this.router.navigate(['/error404'])
          }
          else if(data["status"]==500){
            Swal.fire({position: 'center',icon: 'error',title: 'Server error',html:data["data"],timer: 2000})
            this.router.navigate(['/error500'])
          }

      let Taskdata={
        title:this.title,
        description:this.description,
        userId:Cookie.get("userId"),
        parentTask:this.taskDetail.taskId,
        ancestors:this.parent,
        headTask:this.taskDetail.headTask,
        taskId:this.taskDetail.headTask
      }
      this.serv.SubTask(Taskdata).subscribe(
        data=>{
          if(data["status"]==200){
            this.modalRef.hide();
            let actionString=`A sub task has been created by ${Cookie.get('username')} for task "${this.taskDetail.title}"`
            this.sendUpdate(actionString,`/view/${data["data"]["taskId"]}`)
            Swal.fire({position: 'center',icon: 'success',title: 'Sub Task Created Successfully',timer: 2000})
            this.router.navigate([`/view/${data["data"]["taskId"]}`])            
          }
          else if(data["status"]==404){
            Swal.fire({position: 'center',icon: 'error',title: 'User Not Found',html:data["data"],timer: 2000})
            this.router.navigate(['/error404'])
          }
          else if(data["status"]==500){
            Swal.fire({position: 'center',icon: 'error',title: 'Server error',html:data["data"],timer: 2000})
            this.router.navigate(['/error500'])
          }
          else if(data["status"]==403){
            Swal.fire({position: 'center',icon: 'error',title: 'Parameters not entered',html:data["data"],timer: 2000})
          }
        }
      )
    }
    )
    }
  }

  public goBack(){
    this.location.back()
  }

  public deleteTask(){
    let data={
      taskId:this.taskDetail.taskId,
      userId:Cookie.get('userId')
    }
    this.serv.deleteTask(data).subscribe(
      data=>{
        this.modalRef.hide();
        if(data["status"]==200){
          let actionString=`The task "${this.taskDetail.title}" has been deleted by ${Cookie.get('username')}`
          this.sendUpdate(actionString,`/view/${this.taskDetail.headTask}`)
          Swal.fire({position: 'center',icon: 'success',title: 'Task Deleted Successfully',timer: 2000})
          if(this.taskDetail.taskId==this.taskDetail.headTask){
            this.router.navigate(['/dashboard'])
          }
          else{
          this.router.navigate(['/view',this.taskDetail.headTask])
          }
        }
        else if(data["status"]==404){
          Swal.fire({position: 'center',icon: 'error',title: 'User Not Found',html:data["data"],timer: 2000})
          this.router.navigate(['/error404'])
        }
        else if(data["status"]==500){
          Swal.fire({position: 'center',icon: 'error',title: 'Server error',html:data["data"],timer: 2000})
          this.router.navigate(['/error500'])
        }
        else if(data["status"]==403){
          Swal.fire({position: 'center',icon: 'error',title: 'Parameters not entered',html:data["data"],timer: 2000})
        }
      }
    )
  }
  public editTask(){
    this.taskDetail.userId=(Cookie.get('userId'))
    this.serv.editTask(this.taskDetail).subscribe(
      data=>{
        this.modalRef.hide();
        if(data["status"]==200){
          let actionString=`The Task "${this.prev}" has been edited by ${Cookie.get('username')}`
          this.sendUpdate(actionString,`/view/${this.taskDetail.taskId}`)
          this.taskDetail=data["data"]
          
          Swal.fire({position: 'center',icon: 'success',title: 'Task Edited Successfully',timer: 2000})
          window.location.reload()
        }
        else if(data["status"]==404){
          Swal.fire({position: 'center',icon: 'error',title: 'User Not Found',html:data["data"],timer: 2000})
          this.router.navigate(['/error404'])
        }
        else if(data["status"]==500){
          Swal.fire({position: 'center',icon: 'error',title: 'Server error',html:data["data"],timer: 2000})
          this.router.navigate(['/error500'])
        }
        else if(data["status"]==403){
          Swal.fire({position: 'center',icon: 'error',title: 'Parameters not entered',html:data["data"],timer: 2000})
        }
      }
    )

  }


  public undo(){
    let detail={
      taskId:this.taskDetail.headTask,
      userId:Cookie.get('userId'),
      userName:Cookie.get('username'),
    }
    this.serv.undo(detail).subscribe(
      data=>{
        this.modalRef.hide();
        if(data["status"]==200){
          
          let actionString=`The last step on task ${this.taskDetail.title} has been undone by ${Cookie.get('username')}`
          this.sendUpdate(actionString,`/view/${this.taskDetail.headTask}`)
          if(data["data"]==="Edit"){
            Swal.fire({position: 'center',icon: 'success',title: 'Last Action Undone Successfully',html:'Action Undone',timer: 2000})
            window.location.reload()
          }
          else{
            Swal.fire({position: 'center',icon: 'success',title: 'Last Action Undone Successfully',html:'Action Undone',timer: 2000})
            this.router.navigate(['/view',this.taskDetail.headTask])
          }
        }
        else if(data["status"]==400){
          Swal.fire({position: 'center',icon: 'error',title: 'No More Actions To Be Undone',html:'You have reached rock bottom',timer: 2000}
          )
        }
        else if(data["status"]==404){
          Swal.fire({position: 'center',icon: 'error',title: 'User Not Found',html:'You have reached rock bottom',timer: 2000})
          this.router.navigate(['/error404'])
        }
      }
    )
  }

public sendUpdate(actionString,path){
  let a=this.remove(this.taskDetail.viewers,Cookie.get('userId'))
  let data={
    viewers:a,
    actionString:actionString,
    path:path
  }
  this.socketserv.sendUpdate(data)
}


public remove(data,userId){
  let b=new Array
  for(let each of data){
    if(each!=userId){
      b.push(each)
    }
  }
  return b
}



public fetchUpdate(){
  this.socketserv.fetchUpdate().subscribe(
    data=>{
      Swal.fire({position: 'center',title:'Here is an update for you',html:data["actionString"],timer: 5000})
      setTimeout(() => {
        window.location.reload()  
      }, 3000);  
      }
  )
}

ngOnDestroy() {
  if (this.mySubscription) {
    this.mySubscription.unsubscribe();
  }
  this.socketserv.disconnect()

}
}
