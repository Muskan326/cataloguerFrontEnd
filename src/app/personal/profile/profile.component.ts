import { Component, OnInit } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import Swal from 'sweetalert2'
import { HttpFunctionsService } from 'src/app/services/http-functions.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import {SocketServiceService} from 'src/app/services/socket-service.service'


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers:[SocketServiceService]
})
export class ProfileComponent implements OnInit {
  public userId=Cookie.get("userId")
  public profileId;
  public profileInfo=null;
  public friend=false;
  public request=false;
  public visible=true;
  public allTasks=new Array;
  mySubscription: any;
  public allrelatedTasks=new Array;
  public userDetail: any;
  accept: boolean;
  constructor(private serv:HttpFunctionsService,private _router:ActivatedRoute, private router:Router,private socketserv:SocketServiceService) {
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
    this.profileId=this._router.snapshot.paramMap.get('profileId');

    this.serv.getuserDetails(Cookie.get('userId')).subscribe(
      data=>{
        if(data["status"]==200){
          this.userDetail=data["data"]
        }
        else if(data["status"]==404){
          Swal.fire({position: 'center',icon: 'error',title:'User Id Not Found',html:data["data"],showConfirmButton: false,timer: 2000})
          this.router.navigate(['/error404'])
        }
        else if(data["status"]==500){
          Swal.fire({position: 'center',icon: 'error',title:'Server Error',html:data["data"],showConfirmButton: false,timer: 2000})
          this.router.navigate(['/error500'])
        }
        else if(data["status"]==403){
          Swal.fire({position: 'center',icon: 'error',title:'User Id Not Set',showConfirmButton: false,timer: 2000})
          this.router.navigate(['/dashboard'])
        }
      },
      error=>{
        Swal.fire({position:"center",title:"Some Error Occured",html:error,showConfirmButton: false,timer: 2000})
      this.router.navigate(['/dashboard'])}
    )
    
    this.serv.getuserDetails(this.profileId).subscribe(
      data=>{
        if(data["status"]==200){
          this.profileInfo=data["data"]
          this.profileInfo.userName=`${this.profileInfo.firstName} ${this.profileInfo.lastName}`
          for(let each of this.profileInfo.tasks){
            this.serv.taskDetails(each).subscribe(
              data=>{
                if(data["status"]==200){
                this.allTasks.push(data["data"])
                }
              }
            )
          }
          for(let a of this.profileInfo.friends){
            if(a.userId==Cookie.get("userId")){
              this.friend=true
            }
          }
          for(let a of this.profileInfo.requests){
            if(a.userId==Cookie.get("userId")){
              this.request=true
            }
          }
          if(Cookie.get('userId')==this.profileInfo.userId){
            this.visible=false
          }

          for(let each of this.userDetail.requests){
            if(each.userId==this.profileId){
              this.friend=false;
              this.visible=false;
              this.request=false;
              this.accept=true;
            }
          }          

        }
        else if(data["status"]==404){
          Swal.fire({position: 'center',icon: 'error',title:'Profile Id Not Found',html:data["data"],showConfirmButton: false,timer: 2000})
          this.router.navigate(['/error404'])
        }
        else if(data["status"]==500){
          Swal.fire({position: 'center',icon: 'error',title:'Server Error',html:data["data"],showConfirmButton: false,timer: 2000})
          this.router.navigate(['/error500'])
        }
        else if(data["status"]==403){
          Swal.fire({position: 'center',icon: 'error',title:'Profile Id not Passed',showConfirmButton: false,timer: 2000})
          this.router.navigate(['/dashboard'])
        }
      },
      error=>{
        Swal.fire('Some Error Occured','Please Try after Some Time','error')
        this.router.navigate(['/dashboard'])
      }
    )
    this.serv.getRelatedTasks(Cookie.get("userId")).subscribe(
      data=>{
        if(data["status"]==200){
          this.allrelatedTasks=data["data"]
        }
        else if(data["status"]==500){
          Swal.fire({position:"center",title:"Server Error",html:data["message"],showConfirmButton: false,timer: 2000})  
          this.router.navigate(['/error500'])
        }
      }
    )

    this.fetchUpdate()
}

sendRequest(userId,){
  let data={
    sender:Cookie.get('userId'),
    senderName:Cookie.get('username'),
    receiver:userId
  }
  this.serv.sendRequest(data).subscribe(
    data=>{
      if(data["status"]==200){
        let actionString=`${Cookie.get('username')} has send you friend request.`
        let a={
          userId:userId
        }
        this.createUpdate(actionString,[a])
        Swal.fire('Send Successfully','Request send','success')
        setTimeout(()=>{},5000)
        window.location.reload()
      }
      else if(data["status"]==404){
        Swal.fire({position: 'center',icon: 'error',title:'Sender Id or Receiver Id Not Found',html:data["data"],showConfirmButton: false,timer: 2000})
        this.router.navigate(['/error404'])
      }
      else if(data["status"]==500){
        Swal.fire({position: 'center',icon: 'error',title:'Sever Error',html:data["data"],showConfirmButton: false,timer: 2000})
        this.router.navigate(['/error500'])
      }
      else if(data["status"]==403){
        Swal.fire({position: 'center',icon: 'error',title:'Required Parameters not found',html:data["data"],showConfirmButton: false,timer: 2000})
      }
    },
    error=>{
      
        Swal.fire('Error Occured',error,'error')
        window.location.reload()
      
    }
  )
}


removeRequest(userId){
  let data={
    sender:Cookie.get('userId'),
    receiver:userId
  }
  this.serv.removeRequest(data).subscribe(
    data=>{
      if(data["status"]==200){
        Swal.fire('Request Removed Sucessfully','Request removed','success')
        setTimeout(()=>{},5000)
        window.location.reload()
      }
      else if(data["status"]==404){
        Swal.fire({position: 'center',icon: 'error',title:'Sender Id or Receiver Id Not Found',html:data["data"],showConfirmButton: false,timer: 2000})
        this.router.navigate(['/error404'])
      }
      else if(data["status"]==500){
        Swal.fire({position: 'center',icon: 'error',title:'Sever Error',html:data["data"],showConfirmButton: false,timer: 2000})
        this.router.navigate(['/error500'])
      }
      else if(data["status"]==403){
        Swal.fire({position: 'center',icon: 'error',title:'Required Parameters not found',html:data["data"],showConfirmButton: false,timer: 2000})
      }
    },
    error=>{
      
        Swal.fire('Error Occured',error,'error')
        window.location.reload()
      
    }
  )
}

public unfriend(userId){
  let data={
    sender:Cookie.get('userId'),
    receiver:userId
  }
  this.serv.unfriend(data).subscribe(
    data=>{
      if(data["status"]==200){
        let actionString=`${Cookie.get('username')} has unfriend you from their friends.`
        let a={
          userId:userId
        }
        this.createUpdate(actionString,[a])
        Swal.fire({position: 'center',icon: 'success',title:'Unfriend Successfull',html:"You both are no longer friends",showConfirmButton: false,timer: 2000})
        window.location.reload()
      }
      else if(data["status"]==404){
        Swal.fire({position: 'center',icon: 'error',title:'Sender Id or Receiver Id Not Found',html:data["data"],showConfirmButton: false,timer: 2000})
        this.router.navigate(['/error404'])
      }
      else if(data["status"]==500){
        Swal.fire({position: 'center',icon: 'error',title:'Sever Error',html:data["data"],showConfirmButton: false,timer: 2000})
        this.router.navigate(['/error500'])
      }
      else if(data["status"]==403){
        Swal.fire({position: 'center',icon: 'error',title:'Required Parameters not found',html:data["data"],showConfirmButton: false,timer: 2000})
      }
    },
    error=>{
      Swal.fire({position: 'center',icon: 'error',title:'Some Error Occured',html:error.name,showConfirmButton: false,timer: 2000})
    }
  )
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
        this.createUpdate(actionString,[a])
        Swal.fire({position: 'center',icon: 'success',title:'Request Accepted',html:"Accepted",showConfirmButton: false,timer: 2000})
        window.location.reload()
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
    }
  )
}

public createUpdate(actionString,receiver){
  let data={
    receiver:receiver,
    actionString:actionString,
    path:`/profile/${Cookie.get('userId')}`
  }
  this.socketserv.createUpdate(data)
  console.log("Send Update called")
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
