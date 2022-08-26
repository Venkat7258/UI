import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { NotificationService } from 'src/app/notification.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordModel: any = {};
  constructor(private rmmapi: RMMApiService,public _notificationService:NotificationService, public _appService: AppService, private router: Router, public env: EnvService) { }
  ngOnInit(): void {

  }
  ForgotPassword()
  {
    
    let params = new HttpParams().set("UserName", this.forgotPasswordModel.UserName);
    this.rmmapi.getData("UserPassword/ForgotPassword", params).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        this._notificationService.showSuccess("", resp.Message);
        
        this.router.navigate(['/Login']);
      } else {
        this._notificationService.showError("", resp.Message);
      }
    });
  }

  Login()
  {
    this.router.navigate(['/Login']);
  }
}
