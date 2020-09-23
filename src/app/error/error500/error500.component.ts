import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { SocketServiceService } from 'src/app/services/socket-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-error500',
  templateUrl: './error500.component.html',
  styleUrls: ['./error500.component.css'],
  providers:[SocketServiceService]
})
export class Error500Component implements OnInit {

  constructor(private router:Router,private socketserv:SocketServiceService) {
    this.socketserv.setUser(Cookie.get('userId'))  
   }

  ngOnInit(): void {
    if(Cookie.get("userId")==null || Cookie.get("userId")==undefined){
      this.router.navigate(['/login'])
    }

    this.fetchUpdate()

  }


  public fetchUpdate(){
    this.socketserv.fetchUpdate().subscribe(
      data=>{
        Swal.fire({position: 'center',title:'Here is an update for you',html:data["actionString"],timer: 3000})
        setTimeout(() => {
          window.location.reload()  
        }, 3000);
      }
    )
  }

  ngOnDestroy() {

    this.socketserv.disconnect()
  
  }
}
