import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cookie } from 'ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class HttpFunctionsService {
  private url='http://cataloguer.api.mywebapp.tech/v1'
  public id=Cookie.get('userId')
  public name=Cookie.get('username')

  constructor(private http:HttpClient) { }

  public login(data){
     return this.http.post(`${this.url}/login`,data)
  }

  public signup(data){
    return this.http.post(`${this.url}/signup`,data)
 }

 public getuserDetails(userId){

  return this.http.get(`${this.url}/get/${userId}`)
}

public logout(userId){
  return this.http.get(`${this.url}/logout/${userId}`)
}

public getUserByEmail(email){
  return this.http.get(`${this.url}/details/${email}`)
}

public sendRequest(data){
  return this.http.post(`${this.url}/sendRequest`,data)
}

public acceptRequest(data){
  return this.http.post(`${this.url}/acceptRequest`,data)
}

public removeRequest(data){
  return this.http.post(`${this.url}/removeRequest`,data)
}

public unfriend(data){
  return this.http.post(`${this.url}/unfriend`,data)
}

public getMySendRequests(userId){
  return this.http.get(`${this.url}/getMySendRequests/${userId}`)
}

public restoreAccount(email){
  return this.http.get(`${this.url}/changePassword/${email}`)
}

public verifymail(email){
  return this.http.get(`${this.url}/verifyEmail/${email}`)

}

public getAllParents(data){
  return this.http.post(`${this.url}/getAllParents`,data)
}

public resetpassword(data){
  return this.http.post(`${this.url}/resetPassword`,data)
}

public getAllUsers(){
  return this.http.get(`${this.url}/allUsers`)
}

public createTask(Taskdata){
  return this.http.post(`${this.url}/create`,Taskdata)
}

public taskDetails(taskId){
  return this.http.get(`${this.url}/taskDetails/${taskId}`)
}

public getHeadTasks(){
  return this.http.get(`${this.url}/allHeadTasks`)
}

public getAllTasks(){
  return this.http.get(`${this.url}/allTasks`)
}

public SubTask(taskDetail){
  return this.http.post(`${this.url}/subTask`,taskDetail)
}

public deleteTask(data){
  return this.http.post(`${this.url}/delete`,data)
}

public getRelatedTasks(userId){
  return this.http.get(`${this.url}/getRelated/${userId}`)
}

public editTask(taskDetails){
  return this.http.post(`${this.url}/editTask`,taskDetails)
}

public undo(details){
  return this.http.post(`${this.url}/undo`,details)
}

public fetchNotifications(userId){
  return this.http.get(`${this.url}/getNotification/${userId}`)
}

public markAllRead(userId){
  return this.http.get(`${this.url}/markAsRead/${userId}`)
}

public markOneRead(notifyId){
  return this.http.get(`${this.url}/markOneRead/${notifyId}`)
}

}
