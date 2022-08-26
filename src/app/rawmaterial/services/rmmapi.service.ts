import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EnvService } from 'src/app/shared/services/env.service';


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
      'Authorization':'Bearer '+this.getToken()
    }
    return headersList;
  }
  setStorage(k, d) {
    window.sessionStorage.setItem(k, d);
  }
  getStorage(k) {
    try {
      if (window.sessionStorage.getItem(k)) {
        return window.sessionStorage.getItem(k);
      }
    } catch (e) { }
  }
  removeStorage(k) {
    try {
      if (window.sessionStorage.getItem(k)) {
        return window.sessionStorage.removeItem(k);
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
      const body = new HttpParams()
      .set(`username`, data.UserName )
      .set(`password`, data.Password)
      .set('grant_type', 'password');
     const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded', 'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'Content-Type',
     'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT'});
     return this.http.post(this.getTokenUrl(curl), body.toString(), { headers:headers});
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
      return JSON.parse(this.getSession('oauth')).access_token;
    } catch (e) {
      return 'NA';
    }
  }

  postFormData(curl, data) {
    try {
      let headersList: any = this.setHeaders();
      return this.http.post(this.getUrl(curl), data);
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
        window.sessionStorage.removeItem(k);
      }
      else {
        window.sessionStorage.setItem(k, btoa(JSON.stringify(d)));
      }

    } catch (error) {

    }
  }
  getSession(k) {
    try {
      if (window.sessionStorage.getItem(k)) {
        return atob(window.sessionStorage.getItem(k));
      }
    } catch (e) { }
  }
  removeSession() {
    try {
      return window.sessionStorage.clear();
    } catch (error) { }
  }
}
