import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
import { Cookie } from 'ng2-cookies';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HttpFunctionsService } from 'src/app/services/http-functions.service';
import { SocketServiceService } from 'src/app/services/socket-service.service';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers:[SocketServiceService]
})
export class UsersComponent implements OnInit {
  public userDetail;
  public allUsers;
  public sendRequests=new Array;
  public allFriends=new Array;
  public allRequests=new Array;
  public p=1;
  public searchText;
  allrelatedTasks: any;
  mySubscription: any;
  modalRef: BsModalRef;
  constructor(private serv:HttpFunctionsService,private router:Router,private modalService: BsModalService,private location:Location,private socketserv:SocketServiceService,) { 

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
    if(Cookie.get('userId')==null||Cookie.get('userId')==undefined){
        this.router.navigate(['/login'])
    }

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
        console.log(error)
      // this.router.navigate(['/dashboard'])
    }
    )

    this.serv.getAllUsers().subscribe(      
      data=>{
        if(data["status"]==200){
          this.allUsers=data["data"]
          this.allUsers=this.remove(this.allUsers,Cookie.get('userId'))
          for(let each of this.allUsers){
            for(let every of this.userDetail.friends){
              if(each.userId==every.userId){
                this.allFriends.push(each)
                this.allUsers=this.remove(this.allUsers,every.userId)
              }
            }
          }
          for(let each of this.allUsers){
            for(let every of this.userDetail.requests){
              this.allRequests.push(each)
              if(each.userId==every.userId){
                this.allUsers=this.remove(this.allUsers,every.userId)
              }
            }
          }
          console.log(this.allUsers)
        }
        else if(data["status"]==500){
          Swal.fire({position:"center",title:"Server Error",html:data["message"],showConfirmButton: false,timer: 2000})
          this.router.navigate(['/error500'])
        }
      },
      error=>{
        Swal.fire({position:"center",title:"Some Error Occured",html:error,showConfirmButton: false,timer: 2000})
        this.router.navigate(['/error500'])

      }
    )

    this.serv.getMySendRequests(Cookie.get('userId')).subscribe(
      data=>{
        if(data["status"]==200){
          this.sendRequests=data["data"]
          for(let each of this.sendRequests){
            this.allUsers=this.remove(this.allUsers,each.userId)
          }
        }
        else if(data["status"]==500){
          Swal.fire({position:"center",title:"Server Error",html:data["message"],showConfirmButton: false,timer: 2000})
          this.router.navigate(['/error500'])
        }
        else if(data["status"]==403){
          Swal.fire({position:"center",title:"Pass the required parameters",html:data["message"],showConfirmButton: false,timer: 2000})
        }
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
      } )
    this.fetchUpdate()
  }


  pageChanged(event) {
    this.p = event
  }
  public goBack(){
    this.location.back()
  }

  public remove(arr,val){
    let newArr=new Array
    for(let i in arr){
      if(arr[i].userId==val){
        continue;
      }
      else{
        newArr.push(arr[i])
      }
    }
    return newArr
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
          Swal.fire({position: 'center',icon: 'success',title:'Friend request send successfully ',html:"Send Successfully",timer: 3000})  
          setTimeout(() => {
            window.location.reload()
          }, 2000);       
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
          this.router.navigate(['/error500'])
     
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
          Swal.fire({position: 'center',icon: 'success',title:'Request removed successfully ',html:"removed Successfully",timer: 3000})  
          this.ngOnInit()     
          setTimeout(() => {
            window.location.reload()
          }, 2000);           }
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
        this.router.navigate(['/error500'])
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

  public createUpdate(actionString,receiver){
    let data={
      receiver:receiver,
      actionString:actionString,
      path:`/profile/${Cookie.get('userId')}`
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
