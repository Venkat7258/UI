import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root'
})
export class RMMApiService {
  public httpCounter: number = 0;
  DeleteData: any;
  constructor(private env: EnvService, private http: HttpClient,public router: Router) { }
  public getUrl(curl): string {
    return this.env.apiUrl + curl;
  }

  public getTokenUrl(curl): string {
    return this.env.tokenApiUrl + curl;
  }

  public getTimerTime(): string {
    return this.env.configTimerTime;
  }
  public setHeaders() {
    var headersList = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization':'Bearer '+this.getToken(),
      // 'ConnectionName':this.getConnectionName()
    }
    return headersList;
  }
  setStorage(k, d) {
    //window.sessionStorage.setItem(k, d);
    localStorage.setItem(k, d);
  }
  getStorage(k) {
    try {
      // if (window.sessionStorage.getItem(k)) {
      //   return window.sessionStorage.getItem(k);
      // }
      if (localStorage.getItem(k)) {
        return localStorage.getItem(k);
      }

    } catch (e) { }
  }
  removeStorage(k) {
    try {
      // if (window.sessionStorage.getItem(k)) {
      //   return window.sessionStorage.removeItem(k);
      // }
      if (localStorage.getItem(k)) {
        return localStorage.removeItem(k);
      }
    } catch (error) {
    }
  }
  postData(curl, data) {
    try {
      let headersList: any = this.setHeaders();
      return this.http.post(this.getUrl(curl), JSON.stringify(data), { headers: headersList });
    } catch (e) {
    }
  }
  LoginData(curl, data){
    try {
      let headersList: any = {};  
      // const body = new HttpParams()
      // .set(`username`, data.UserName )
      // .set(`password`, data.Password)
      // let body={
      //   UserName:'',
      //   Password
      // };
   // .set('grant_type', 'password');
     const headers = new HttpHeaders({ 'Content-Type': 'application/json' ,
     'Accept': 'application/json'});

    //  'Access-Control-Allow-Origin': '*',
    //  'Access-Control-Allow-Headers': 'Content-Type',
    //  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT'
     return this.http.post(this.getUrl(curl), JSON.stringify(data), { headers:headers});
    } catch (e) {
    }
  }
  getUserName(): string {
    try {
      return JSON.parse(this.getSession('oauth')).userName;
    } catch (e) {
      return 'NA';
    }
  }
  getStatusCodes()
  {
    
    try {
      return JSON.parse(this.getSession('ConfigStatusCodes'));
    } catch (e) {
      return 'NA';
    }
  }
  getUserId(): string {
    try {
      return JSON.parse(this.getSession('oauth')).userId;
    } catch (e) {
      return 'NA';
    }
  }
  getCurrentUser(): string {
    try {
      return JSON.parse(this.getSession('oauth'));
    } catch (e) {
      return 'NA';
    }
  }
  getConnectionName(): string {
    try {
      return JSON.parse(this.getSession('oauth')).ConnectionName;
    } catch (e) {
      return 'NA';
    }
  }
  getRolePrivilege(privilegeCode): string {
    try {
      // this.router.navigate(['/Login']);
      if (JSON.parse(this.getSession('RolePrivileges')).length > 0) {
        return JSON.parse(this.getSession('RolePrivileges')).filter(item => item.Code === privilegeCode)[0].HaveAccess;
      } else {
        return 'NA';
      }
    } catch (e) {
      return 'NA';
    }
  }

  getRoleId(): string {
    try {
      return JSON.parse(this.getSession('oauth')).RoleId;
    } catch (e) {
      return 'NA';
    }
  }
  getToken(): string {
    try {
      return JSON.parse(this.getSession('oauth')).token;
    } catch (e) {
      return 'NA';
    }
  }

  postFormData(curl, data) {
    try {
      const headersList = new HttpHeaders({
      'Authorization':'Bearer '+this.getToken(),
      'ConnectionName':this.getConnectionName()
    });
      return this.http.post(this.getUrl(curl), data,{headers:headersList});
    } catch (e) {
    }
  }
  getData(curl, params?: any) {
    try {
      let headersList: any = this.setHeaders();
      return this.http.get(this.getUrl(curl), { headers: headersList, params: params });
    } catch (e) {
    }
  }
  setSession(k, d) {
    try {
      if (d === undefined) {
        //window.sessionStorage.removeItem(k);
        localStorage.removeItem(k);
      }
      else {
        //window.sessionStorage.setItem(k, btoa(JSON.stringify(d)));
        localStorage.setItem(k, btoa(JSON.stringify(d)));
      }
    } catch (error) {

    }
  }
  
  getSession(k) {
    try {
      // if (window.sessionStorage.getItem(k)) {
      //   return atob(window.sessionStorage.getItem(k));
      // }
      if (localStorage.getItem(k)) {
        return atob(localStorage.getItem(k));
      }
    } catch (e) { }
  }
  removeSession() {
    try {
      //return window.sessionStorage.clear();
      return localStorage.clear();
    } catch (error) { }
  }
}
