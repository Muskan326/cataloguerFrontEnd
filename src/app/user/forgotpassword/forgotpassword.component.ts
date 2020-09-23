import { Component, OnInit } from '@angular/core';
import { HttpFunctionsService } from 'src/app/services/http-functions.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit {

  public email;
  constructor(public serv:HttpFunctionsService, private router:Router) {
    if(Cookie.get("userId")!=null || Cookie.get("userId")!=undefined){
      this.router.navigate(['/dashboard'])
    }
   }

  ngOnInit(): void {
  }


  public recoverAccount(){
    this.serv.restoreAccount(this.email).subscribe(
      data=>{
        console.log(data)
        if(data["status"]==200){
          Swal.fire({position: 'center',icon: 'success',title:'Recovery Email Send',html: 'Signin With the New Credential.',showConfirmButton: false,timer: 2000})
          this.router.navigate(["/login"])
        }
        else if(data["status"]==404){
          Swal.fire({position: 'center',icon: 'error',title: 'User Not Found',html:'Please Enter a registered Email address',showConfirmButton: false,timer:2000 })
          this.router.navigate(['/error404'])
        }
        else if(data["status"]==500){
          Swal.fire({position: 'center',icon: 'error',title:data["message"],html:'Please Try after sometime',showConfirmButton: false,timer: 2000})
          this.router.navigate(['/error500'])
        }
        
      },
      error=>{
        Swal.fire({position: 'center',icon: 'error',title: 'Some Error Occured',html:error,showConfirmButton: false,timer: 2000})
      }
    )
  }
}
