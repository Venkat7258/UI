import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { NotificationService } from 'src/app/notification.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { ChangePassword } from '../models/change-password';
import { UserDetails } from '../Models/user-details';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  userName: any = "";
  changePasswordModel = new ChangePassword();

  constructor(public activeModal: NgbActiveModal,public router: Router, public _notificationService: NotificationService, public env: EnvService, public _appService: AppService, public rmmapi: RMMApiService, private modalService: NgbModal) { }
  
  ngOnInit(): void {
  }
  ChangePassword(form) {
    let user = this.rmmapi.getCurrentUser();
    this.changePasswordModel.UserId = user["userId"];
    this.changePasswordModel.Email = user["Email"];
    this.changePasswordModel.Name = user["Name"];
    this.rmmapi.postData("UserAccount/ChangePassword", this.changePasswordModel).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        this._notificationService.showSuccess("","Password has been changed");
        this.activeModal.close();
      } else {
        this._notificationService.showError("", resp.Message);
      }
    })
  }
}
