import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { NotificationService } from 'src/app/notification.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css']
})
export class SetPasswordComponent implements OnInit {
  setPasswordModel: any = {};
  constructor(private rmmapi: RMMApiService, public _notificationService: NotificationService, private route: ActivatedRoute, public _appService: AppService, private router: Router, public env: EnvService) { }
  ngOnInit(): void {
  }
  SetPassword() {
    
    if (this.route.snapshot.params.id != undefined && this.route.snapshot.params.id != "") {
      this.setPasswordModel.UserId = this.route.snapshot.params.id;
      this.rmmapi.postData("UserPassword/SetPassword", this.setPasswordModel).toPromise().then((resp: any) => {
        if (resp && resp.Status) {
          this._notificationService.showSuccess("", resp.Message);
          this.router.navigate(['/Login']);
        } else {
          this._notificationService.showError("", resp.Message);
        }
      });
    }
    else {
      this.router.navigate(['/Login']);
    }
  }
  
}
