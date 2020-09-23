import { Component, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { HttpFunctionsService } from './services/http-functions.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cataloguer-front';
  userId: string;
  modalRef: BsModalRef;

  constructor(public router:Router,private serv:HttpFunctionsService,private modalService: BsModalService){}
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }

  decline(): void {
    this.modalRef.hide();
  }

  logout = () => {
     this.serv.logout(Cookie.get('userId')).subscribe(
       data => {
         if (data["status"] == 200) {
          Cookie.deleteAll('/','cataloguer.mywebapp.tech')
          Cookie.deleteAll('/')
          this.modalRef.hide();
           Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Logout Successful',
            html:'Thank You for visiting Cataloguer &#128522',
            showConfirmButton: false,
            timer: 2000
          })
          console.log(window.location.origin)
           this.router.navigate(['/login'])      
            }
         else if (data["status"] == 404) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Logout Unsuccessful',
            html:'User Does Not Exist or already logged out',
            showConfirmButton: false,
            timer: 2000
          })
          this.modalRef.hide();
         }
         else {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Internal Server Error',
            html:'Please try after some time',
            showConfirmButton: false,
            timer: 2000
          })
          this.modalRef.hide();
         }
       },
       error => {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Some Error Occured',
          html:'Please try after some time',
          showConfirmButton: false,
          timer: 2000
        })
        this.modalRef.hide();
       }
     )

   }

  

  public GoToProfile(){
    this.userId=Cookie.get("userId")
    this.router.navigate(['/profile',this.userId])  }

    
}

