import { Component, OnInit, TemplateRef } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import Swal from 'sweetalert2';
import * as $ from 'jquery';
import { HttpFunctionsService } from 'src/app/services/http-functions.service';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import{SocketServiceService} from 'src/app/services/socket-service.service'



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public email;password;oldPassword;newPassword
  modalRef: BsModalRef;
  info: any;
  verifyEmail: any;
  constructor(private serv:HttpFunctionsService,private router:Router,private modalService: BsModalService, private socketserv:SocketServiceService) { }

  ngOnInit(): void {
    if(Cookie.get("userId")!=null){
      this.router.navigate(['/dashboard'])
    }
    $(".login").one("mouseenter",()=>this.fireInstruction())
    $(".login").one("tap",()=>this.fireInstruction())
    
  }

  public login(){
    if(this.email==null){
      Swal.fire('Email Not Entered','Please Enter','warning')
    }
    else if(this.password==null){
      Swal.fire('Password Not Entered','Please Enter','warning')
    }
    else{
      let data={
        email:this.email,
        password:this.password
      }
      this.serv.login(data).subscribe(
        data=>{
          if(data["status"]==200){
            this.info=data["data"]["userDetails"]
            if(this.password==this.info.userId){
              document.getElementById("openModalButton").click();
            }
            else{
              Swal.fire({title: 'Login Successful',text: 'Welcome to Live todo list portal-Cataloguer',timer: 2000,
                imageUrl: '../assets/images/todo-list.jpg',
                imageWidth: 400,
                imageHeight: 200,
                imageAlt: 'Login Image',
                showConfirmButton: false })   
                Cookie.set("show","false",1,'/')
                Cookie.set("userId",this.info.userId,1,'/')
                Cookie.set("username",`${this.info.firstName} ${this.info.lastName}`,1,'/')
            this.router.navigate(['/dashboard'])
            }
          }
        },
      error=>{
        if(error["status"]==404){
        Swal.fire('Email Does Not exist','Please Enter registered email','error')
        }
        else if(error["status"]==400){
          Swal.fire('Credentials incorrect','Please check the credentials','error')
        }
        else if(error["status"]==500){
          Swal.fire('Internal Server error','Please Try after Some Time','error')
        }
      }
      )
    }
  }

  public fireInstruction()
  {
    Swal.fire({
      text: 'Enter your Registered Credentials Or Login With your Google account',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    })
  }


  resetPassword(){
    let value={
      email:this.info.email,
      oldPassword:this.oldPassword,
      newPassword:this.newPassword
    }
    this.serv.resetpassword(value).subscribe(
      data=>{
        console.log(data)
        if(data["status"]==200){
          Swal.fire({ 
            title: 'Password Changed Successfully',
            text: 'Welcome to Live todo list portal-Cataloguer',
            timer: 2000,
            imageUrl: '../assets/images/todo-list.jpg',
            imageWidth: 400,
            imageHeight: 200,
            imageAlt: 'Login Image',
            showConfirmButton: false 
          })
            Cookie.set("show","false",1,'/')
            Cookie.set("userId",this.info.userId,1,'/')
            Cookie.set("username",`${this.info.firstName} ${this.info.lastName}`,1,'/')
            this.router.navigate(['/dashboard'])
            this.modalRef.hide();
        }
        else if(data["status"]==500){
          Swal.fire('Internal Server error',data["message"],'error')
          this.modalRef.hide();
        }
        else if(data["status"]==403){
          Swal.fire('Error Occured',data["message"],'error')
          this.modalRef.hide();
        }

      },
      error=>{
        Swal.fire('Internal Error',error,'error')
        this.modalRef.hide();
      }
    )
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template,{animated: true});
  }

}
