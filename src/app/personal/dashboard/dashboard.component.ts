import { Component, OnInit } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router, NavigationEnd } from '@angular/router';
import { CarouselConfig } from 'ngx-bootstrap/carousel';
import{FormsModule} from '@angular/forms'
import { AngularEditorConfig } from '@kolkov/angular-editor';
import Swal from 'sweetalert2';
import { HttpFunctionsService } from 'src/app/services/http-functions.service';
import {SocketServiceService} from 'src/app/services/socket-service.service'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [
    { provide: CarouselConfig, useValue: { interval: 2000, noPause: true, showIndicators: true } },SocketServiceService
  ]
})
export class DashboardComponent implements OnInit {
  public title;assignedTo;allUsers;description;
  public details;
  public showForm=false;showTasks=false;showfriends=false;showrequests=false;showNotify=false;
  public headTask;
  public allNotifications;

  
  //text editor config
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '10rem',
    minHeight: '5rem',
  };
  mySubscription: any;
  public allrelatedTasks=new Array;
  constructor(private router:Router, private serv:HttpFunctionsService,private socketserv:SocketServiceService) { 
    
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
    this.serv.getuserDetails(Cookie.get("userId")).subscribe(
      data=>{
        if(data["status"]==200){
          this.details=data["data"]
        }
        else if(data["status"]==404){
          this.router.navigate(['/error404'])
        }
        else if(data["status"]==500){
          this.router.navigate(['/error500'])
        }
        else if(data["status"]==403){
          Swal.fire({position: 'center',icon: 'error',title:'User Id Not Set',showConfirmButton: false,timer: 2000})
          this.router.navigate(['/dashboard'])
        }
      }
    )


    this.serv.getRelatedTasks(Cookie.get("userId")).subscribe(
      data=>{
        if(data["status"]==200){
          this.allrelatedTasks=data["data"]
          console.log(this.allrelatedTasks)
        }
        else if(data["status"]==500){
          this.router.navigate(['/error500'])
        }
      }
    )


    this.serv.fetchNotifications(Cookie.get('userId')).subscribe(
      data=>{
        if(data["status"]==200){
          this.allNotifications=data["data"]
          console.log(this.allNotifications)
        }
        else if(data["status"]==500){
          this.router.navigate(['/error500'])
        }
      }
    )


    this.fetchUpdate()
  }


 showTaskForm(){
    if(this.showForm==false){
      this.showForm=true;this.showTasks=false;this.showfriends=false;this.showrequests=false;this.showNotify=false;
    }
  }

  showAllTask(){
    if(this.showTasks==false){
      this.showForm=false;this.showTasks=true;this.showfriends=false;this.showrequests=false;this.showNotify=false;
    }
  }
  showFriends(){
    if(this.showfriends==false){
      this.showForm=false;this.showTasks=false;this.showfriends=true;this.showrequests=false;this.showNotify=false;
    }
  }

  showRequests(){
    if(this.showrequests==false){
      this.showForm=false;this.showTasks=false;this.showfriends=false;this.showrequests=true;this.showNotify=false;
    }
}

showNotification(){
  if(this.showNotify==false){
    this.showForm=false;this.showTasks=false;this.showfriends=false;this.showrequests=false;this.showNotify=true;
  }
}



  public createTask(){
    if(this.title==null){
      Swal.fire('Task Title Not Entered ','Please Enter the title','warning')
    }
    else{
      let Taskdata={
        title:this.title,
        description:this.description,
        userId:Cookie.get("userId")
      }
      this.serv.createTask(Taskdata).subscribe(
        data=>{
          if(data["status"]==200){
            this.headTask=data["data"]["taskId"]
            let actionString=`A new task "${this.title}" has been created by ${Cookie.get('username')}`
            this.createUpdate(actionString,this.details.friends,`/view/${this.headTask}`)

            Swal.fire({position: 'center',icon: 'success',title:'Task Created Successfully',showConfirmButton: false,timer: 2000})

            this.router.navigate([`/view/${data["data"]["taskId"]}`])
          }
          else if (data["status"]==500){
            Swal.fire({position: 'center',icon: 'error',title:'Some Error Occured',html:data["data"],showConfirmButton: false,timer: 2000})
            this.router.navigate(['/error500'])

          }
          else if (data["status"]==404){
            Swal.fire({position: 'center',icon: 'error',title:'User not Found',html:data["data"],showConfirmButton: false,timer: 2000})
            this.router.navigate(['/error404'])
          }
          else if (data["status"]==403){
            Swal.fire({position: 'center',icon: 'error',title:'Please Enter data',html:data["data"],showConfirmButton: false,timer: 2000})
          }
        }
      ,
      error=>{
        console.log(error)
        Swal.fire({position: 'center',icon: 'error',title:'Some Error Occured',html:error.name,showConfirmButton: false,timer: 2000})
      }
      )
    }
  }


  acceptRequest(senderId,senderName){
    let val={
      sender:senderId,
      senderName:senderName,
      receiver:Cookie.get('userId'),
      receiverName:Cookie.get('username')
    }
    this.serv.acceptRequest(val).subscribe(
      data=>{
        if(data["status"]==200){
          let actionString=`${Cookie.get('username')} has accepted your friend request.`
          let a={
            userId:senderId
          }
          this.createUpdate(actionString,[a],`/profile/${Cookie.get('userId')}`)
          Swal.fire({ position: 'center',icon: 'success',title:'Request Accepted',html:"Accepted",showConfirmButton: false,timer: 2000})
          this.ngOnInit()
        }
        else if (data["status"]==404){
          Swal.fire({position: 'center',icon: 'error',title:'Users not Found',html:data["data"],showConfirmButton: false,timer: 2000})
          this.router.navigate(['/error404'])
        }
        else if (data["status"]==500){
          Swal.fire({position: 'center',icon: 'error',title:'Server Error',html:data["data"],showConfirmButton: false,timer: 2000})
          this.router.navigate(['/error500'])
        }
        else if (data["status"]==403){
          Swal.fire({position: 'center',icon: 'error',title:'parameters not passed',html:data["data"],showConfirmButton: false,timer: 2000})
        }
      },
      error=>{
        Swal.fire({position: 'center',icon: 'error',title:'Some Error Occured',html:error.name,showConfirmButton: false,timer: 2000})
        this.router.navigate(['/error500'])
      }
    )
  }


  public ReadAll(){
    this.serv.markAllRead(Cookie.get('userId')).subscribe(
      data=>{
        if(data["status"]==200){
          this.ngOnInit()
          Swal.fire({position: 'center',icon: 'success',title:'All Notifications marked as Read',html:"Marked Read Successfully",showConfirmButton: false,timer: 2000})
        }
        if(data["status"]==404){
          this.router.navigate(['/error404'])
        } 
        else if(data["status"]==500){
          this.router.navigate(['/error500'])
        } 
      },
      error=>{
        Swal.fire({position: 'center',icon: 'error',title:'Some Error Occured',html:error.name,showConfirmButton: false,timer: 2000})
        this.router.navigate(['/error500'])
      }
    )
  }

  public deleteNotification(notifyId){
    console.log(notifyId)
    this.serv.markOneRead(notifyId).subscribe(
      data=>{
        this.ngOnInit()
      if(data["status"]==404){
        this.router.navigate(['/error404'])
      } 
      else if(data["status"]==500){
        this.router.navigate(['/error500'])
      }  
    
    },
    error=>{
      Swal.fire({position: 'center',icon: 'error',title:'Some Error Occured',html:error.name,showConfirmButton: false,timer: 2000})
      this.router.navigate(['/error500'])
    }
    )
  }

  public createUpdate(actionString,receiver,path){
    let data={
      receiver:receiver,
      actionString:actionString,
      path:path
    }
    this.socketserv.createUpdate(data)
  }



  public fetchUpdate(){
    this.socketserv.fetchUpdate().subscribe(
      data=>{
        Swal.fire({position: 'center',title:'Here is an update for you',html:data["actionString"],timer: 5000})
        setTimeout(() => {
          window.location.reload()  
        }, 3000);      }
    )
  }


  ngOnDestroy() {
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
    this.socketserv.disconnect()

  }
}
