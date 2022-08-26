import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  constructor(private rmmapi: RMMApiService, public _appService: AppService, private router: Router, public env: EnvService) { }
  Model: any = {};
  iserrorMessage: boolean = false;

  ngOnInit(): void {
    this._appService.setHeaderShow(false);
    this._appService.setMasterDataShow(false);
    this._appService.setRawMaterialShow(false);
  }

  Login() {
    debugger;
alert("vghgf");

    // this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
    // this.rmmapi.removeStorage(this.env.CurrentTabState.Id);
    // this.rmmapi.removeSession();
    this.iserrorMessage = false;
  //  this.Model.grant_type = "password";
    this.rmmapi.LoginData("Auth/Authentication/authenticate", this.Model).toPromise().then((res: any) => {
      debugger;
      this.rmmapi.setSession('oauth', res);
      this.router.navigate(['/administration']);
    });

    //   this._appService.setHeaderUserName(res.userName);
    //   this.rmmapi.setSession('oauth', res);
    //   let params = new HttpParams().set("RoleId", res.RoleId);
    //   this.rmmapi.getData("UserAccount/GetRolePrivileges", params).toPromise().then((resp: any) => {
    //     this.rmmapi.setSession('RolePrivileges', resp.Data);
    //     this.rmmapi.setStorage('IsThisAfterLogin_LoadingDashboard', "1");

    //     this.router.navigate(['/Dashboard']);
    //   }).catch((err: any) => {
    //     this.rmmapi.removeSession();
    //     this.iserrorMessage = true;
    //     this.env.ValidationMessages.requiredLoginMsg = err.error.error_description;
    //   });
    // }).catch((err: any) => {
    //   this.rmmapi.removeSession();
    //   this.iserrorMessage = true;
    //   this.env.ValidationMessages.requiredLoginMsg = err.error.error_description;
    //   if (err.error.error_description == undefined) {
    //     err.error.error_description = "The user name or password is incorrect.";
    //     this.env.ValidationMessages.requiredLoginMsg = err.error.error_description;
    //   }
    // })
  //  this.router.navigate(['/Dashboard']);
  }
  ForgotPassword() {

    this.router.navigate(['/ForgotPassword']);
  }
}
