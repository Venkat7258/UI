import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { NotificationService } from 'src/app/notification.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { UserDetails } from '../Models/user-details';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  IsCheckUser: boolean = false;
  actionType = true;
  userName: any = "";
  userModel: any = new UserDetails();
  public cityInfoList: any[] = [];
  public rolesInfoList: any[] = [];
  public statesInfoList: any[] = [];
  public countriesInfoList: any[] = [];
  public affiliatesInfoList: any[] = [];
  public tenantsInfoList: any[] = [];
  public DefaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  public roleDefaultItem: { Name: string; Id: string } = {
    Name: "-- Select --",
    Id: "",
  };

  constructor(public activeModal: NgbActiveModal,public router: Router, public _notificationService: NotificationService, public env: EnvService, public _appService: AppService, public rmmapi: RMMApiService, private modalService: NgbModal) { }
  
  ngOnInit(): void {
    this.GetUsers();
    this.GetCountries();
    this.GetTenants();
    this.GetAffiliates();
  }

  GetUsers() {
    
    let params = new HttpParams().set("PageSize","1").set("PageNumber", "10")
      .set("Sort", "Id asc").set("id", this.rmmapi.getUserId()).set("RoleId",this.rmmapi.getRoleId()).set("type", "ById").set("InActive", "0");
    this.rmmapi.getData("UserAccount/GetUsers", params).toPromise().then((resp: any) => {
     this.userModel= resp.Data.UserList[0];
    
    })
  }
  GetCountries() {
    this.rmmapi.getData("UserAccount/GetCountries").toPromise().then((resp: any) => {
      this.countriesInfoList = resp.Data;
    })
  }
  GetAffiliates() {
    this.rmmapi.getData("UserAccount/GetAffiliates").toPromise().then((resp: any) => {
      this.affiliatesInfoList = resp.Data;
    })
  }
  GetTenants() {
    this.rmmapi.getData("UserAccount/GetTenants").toPromise().then((resp: any) => {
      this.tenantsInfoList = resp.Data;
    })
  }
  AddUserDetails(value)
  {
    this.rmmapi.postData("UserAccount/UpdateUser", this.userModel).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        this._notificationService.showSuccess("", this.userModel.UserName + resp.Message);
        this.GetUsers();
        this.activeModal.close();
      } else {
        this._notificationService.showError("", resp.Message);
      }
    })
  }
}
