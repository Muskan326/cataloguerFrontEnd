import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
import { HttpFunctionsService } from 'src/app/services/http-functions.service';
import Swal from 'sweetalert2';
import {SocketServiceService} from 'src/app/services/socket-service.service'
import { Cookie } from 'ng2-cookies/ng2-cookies';
import {BsModalService, BsModalRef} from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-all-task',
  templateUrl: './all-task.component.html',
  styleUrls: ['./all-task.component.css'],
  providers:[SocketServiceService]

})
export class AllTaskComponent implements OnInit {
  public allHeadTasks;
  public p = 1;
  public searchText;
  allrelatedTasks: any;
  mySubscription: any;
  modalRef: BsModalRef;
  constructor(private serv:HttpFunctionsService,private router:Router,private modalService: BsModalService,private location:Location,private socketserv:SocketServiceService) { 
    if(Cookie.get("userId")==null || Cookie.get("userId")==undefined){
      this.router.navigate(['/login'])
    }
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

    this.serv.getAllTasks().subscribe(
      data=>{
        if(data["status"]==200){
          this.allHeadTasks=data["data"]
        }
        else if(data["status"]==500){
          Swal.fire({position:"center",title:"Some Error Occured",html:data["message"],showConfirmButton: false,timer: 2000})
          this.router.navigate(['/error500'])
        }
      },
      error=>{
        Swal.fire({position:"center",title:"Some Error Occured",html:error,showConfirmButton: false,timer: 2000})
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

  public goBack(){
    this.location.back()
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
