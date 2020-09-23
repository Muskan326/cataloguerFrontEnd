import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import * as $ from "jquery"
import { HttpFunctionsService } from 'src/app/services/http-functions.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  public firstName;lastName;mobile;email;password;code;country;gender;
  public Allcountry=new Array();
  public Allgender=["Male", "Female","Other"]
  public Allcode=new Array();
  mySubscription: any;
  verified: boolean=false;

  constructor(public router:Router,private http:HttpClient,private serv:HttpFunctionsService) {
    if(Cookie.get("userId")!=null){
      this.router.navigate(['/dashboard'])
    }
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
    // if(Cookie.get("verified")!="true"){
    //   this.router.navigate(['/login'])
    // }
    if(Cookie.get("userId")!=null){
      this.router.navigate(['/dashboard'])
    }
    this.http.get('assets/docs/countryList.json', {responseType: 'json'})
        .subscribe(data => {
          for (let key in  data){
            let each={
              code:key,
              country:data[key]
            }
            this.Allcountry.push(each)
          }
           })

           this.http.get('assets/docs/phonecode.json', {responseType: 'json'})
           .subscribe(data => {
             for (let key in  data){
               let each={
                 code:key,
                 phone:data[key]
               }
               this.Allcode.push(each)
             }
              })
              
    $(".signImg").one("mouseenter",()=>this.fireInstruction())
    $(".signImg").one("tap",()=>this.fireInstruction())
    console.log("Doing")
  }

checkVerify(){
  if(this.verified==true){
    this.register()
  }
  else{
    Swal.fire('Enter Valid Email Address','Email could not be verified','error')
  }
}

  public register(){
  if(this.firstName==null){
    Swal.fire('First Name Not Entered','Please Enter','warning')
  }
  else if(this.lastName==null){
    Swal.fire('Last Name Not Entered','Please Enter','warning')
  }
  else if(this.mobile==null){
    Swal.fire('Mobile Number Not Entered','Please Enter','warning')
  }
  else if(this.gender==null){
    Swal.fire('Gender Not Entered','Please Enter','warning')
  }
  else if(this.country==null){
    Swal.fire('Country Not Entered','Please Enter','warning')
  }
  else if(this.email==null){
    Swal.fire('Email Not Entered','Please Enter','warning')
  }
  else if(this.password==null || this.password.length<8){
    Swal.fire('Password Too Short','Minimum length for password is 8','warning')
  }
  else{
    let data={
      firstName:this.firstName,
      lastName:this.lastName,
      code:this.code,
      mobile:this.mobile,
      gender:this.gender,
      country:this.country,
      email:this.email,
      password:this.password
    }
    this.serv.signup(data).subscribe(
      data=>{
        if(data["status"]==200){
          Swal.fire({position: 'center',icon: 'success',title: 'SignUp Successful',text:'Login with the registered credentials',showConfirmButton: false,timer: 2000})
          this.router.navigate(['/login'])
        }
        else if(data["status"]==500){
          Swal.fire('Internal Server error',data["message"],'error')
        } 
        else if(data["status"]==404){
          Swal.fire('Duplicate Entry',data["message"],'error')
        } 
      }
    )
  }
  
      }

      public fireInstruction(){
        Swal.fire({
          text: 'Enter your Details to register to the portal',
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        })
      }

public changeCountry(){
  for(let each of this.Allcode){
    if(each.phone==this.code){
      for(let every of this.Allcountry){
        if(every.code==each.code){
          this.country=every.country
  }}}}}

  public changeCode(){
    for(let each of this.Allcountry){
      if(each.country==this.country){
        for(let every of this.Allcode){          
          if(every.code==each.code){
            this.code=every.phone
    }}}}}

    mailVerify(){
      this.serv.verifymail(this.email).subscribe(
        data=>{
          if(data["status"]!=200){
            Swal.fire('Some Error Occured','Please enter valid email address','error')
            this.verified=true
          }
        },
        error=>{}
      )
    }

}
