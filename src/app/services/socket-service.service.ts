import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

import { Observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse, HttpParams } from "@angular/common/http";
import { ConstantPool } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class SocketServiceService {
  
  private url = 'http://cataloguer.api.mywebapp.tech';
  private socket;


  constructor(public http: HttpClient) { 
    this.socket = io(this.url);

  }

  public setUser = (data) => {

    this.socket.emit("set-user",data)
  } // end verifyUser


  public authError=()=>{
    return Observable.create((observer) => {
      this.socket.on('auth-error', (data) => {
        observer.next(data);

      }); // end Socket

    });
  }

  public disconnect=()=>{
    this.socket.emit("disconnect")
  }

  public sendUpdate=(data)=>{
    this.socket.emit('sendUpdate',data)
  }

  public createUpdate(data){
    this.socket.emit("request",data)
  }

  public fetchUpdate(){
    return Observable.create((observer) => {
      this.socket.on(Cookie.get('userId'), (data) => {
        observer.next(data);

      }); // end Socket

    });
  }

}
