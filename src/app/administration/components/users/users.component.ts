import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { SortDescriptor } from '@progress/kendo-data-query';
import { AppService } from 'src/app/app.service';
import { NotificationService } from 'src/app/notification.service';
import { ActiveInActiveStatus, PaginationDefalts, SearchFilter } from 'src/app/shared/constants/global.constants';
import { EnvService } from 'src/app/shared/services/env.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';

import { UserDetails } from '../../Models/user-details';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  public userDetailsInfoList: GridDataResult;
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  public isCheckUserName: boolean = false;
  public isCheckEmail: boolean = false;
  actionType = true;
  userName: any = "";
  ShowActiveUserOnly: boolean = true;
  isDisableFileds: boolean = false;
  userModel: any = new UserDetails();
  public cityInfoList: any[] = [];
  public rolesInfoList: any[] = [{Id:"SuperAdmin",Name:"SuperAdmin"},{Id:"Admin",Name:"Admin"},{Id:"User",Name:"User"}];
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
  public pageSize = 10;
  public skip = 0;
  public checkUserIsActive = true;
  searchFilter: SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [{ field: 'UserName', dir: 'asc' }];
  constructor(public router: Router, public _notificationService: NotificationService, public env: EnvService, public _appService: AppService, public rmmapi: RMMApiService, private modalService: NgbModal) { }


  ngOnInit(): void {
    this._appService.setHeaderUserName(this.rmmapi.getUserName());
    this._appService.setHeaderShow(true);
    this._appService.setHeaderTitle("Administration");
    this.setDefaults();
   // this.GetCities();
    this.GetUsers();
    //this.GetRoles();
  //  this.GetStates();
    // this.GetCountries();
    // this.GetTenants();
    // this.GetAffiliates();
  }
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "UserName asc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }
  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber = event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetUsers();
  }
  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "UserName asc";
    this.sort = sort;
    this.GetUsers();
  }
  GetCities() {
    this.rmmapi.getData("UserAccount/GetCities").toPromise().then((resp: any) => {
      this.cityInfoList = resp.Data;
    })
  }
  GetUsers() {
    debugger;
    // if (this.checkUserIsActive != this.ShowActiveUserOnly) {
    //   this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    //   this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
    // }
    // this.checkUserIsActive = this.ShowActiveUserOnly;

    // let params = new HttpParams()
    //   .set("PageSize", this.searchFilter.pageSize.toString())
    //   .set("PageNumber", this.searchFilter.pageNumber.toString())
    //   .set("Sort", this.searchFilter.sort)
    //   .set("id", "0")
    //   .set("RoleId", this.rmmapi.getRoleId())
    //   .set("type", "type")
    //   .set("InActive", (this.ShowActiveUserOnly ? 0 : 1).toString());

    this.rmmapi.getData("mdusers/Users").toPromise().then((resp: any) => {
      debugger;
      this.userDetailsInfoList = {
        data: resp,
        total: resp && resp.length > 0 ? resp.length : 0
      };
    })

  }
  GetRoles() {

    let params = new HttpParams().set("RoleId", this.rmmapi.getRoleId());
    this.rmmapi.getData("UserAccount/GetRoles", params).toPromise().then((resp: any) => {

      this.rolesInfoList = resp.Data;
    })
  }
  GetStates() {
    this.rmmapi.getData("UserAccount/GetStates").toPromise().then((resp: any) => {
      this.statesInfoList = resp.Data;
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
  UsersModal(content) {
    this.isDisableFileds = false;
    this.actionType = true;
    this.userModel = new UserDetails();
    this.modalReference = this.modalService.open(content, { size: 'xl' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  IsCheckUserName() {
    
    let params = new HttpParams().set("username", this.userModel.UserName).set("email", "");
    this.rmmapi.getData("UserAccount/CheckDuplicateUser", params).toPromise().then((resp: any) => {
      this.isCheckUserName = resp.Data;
    })
  }
  IsCheckEmail() {
    let params = new HttpParams().set("username", "").set("email", this.userModel.Email);
    this.rmmapi.getData("UserAccount/CheckDuplicateUser", params).toPromise().then((resp: any) => {
      this.isCheckEmail = resp.Data;
    })
  }
  AddUserDetails() {
    debugger;
    if (this.userModel._id == undefined) {
      // this.userModel.CreatedBy = this.rmmapi.getUserName();
      // let params = new HttpParams().set("username", this.userModel.UserName).set("email", this.userModel.Email);
      // this.rmmapi.getData("UserAccount/CheckDuplicateUser", params).toPromise().then((resp: any) => {
      //   this.isCheckUserName = resp.Data;
      //   this.isCheckEmail = resp.Data;
      //   if (!resp.Data) {
          this.rmmapi.postData("mdusers/Users", this.userModel).toPromise().then((resp: any) => {
            debugger;
            if (resp) {
              this._notificationService.showSuccess("", "User added successfully");
              this.GetUsers();
              this.modalReference.close();
            } else {
              this._notificationService.showWarning("", "Sorry, User could not be added");
            }
          })
      //   }
      // })
    } else {
      this.rmmapi.postData("mdusers/Users/Update", this.userModel).toPromise().then((resp: any) => {
        if (resp) {
          this._notificationService.showSuccess("", "User details updated successfully");
          this.GetUsers();
          this.modalReference.close();
        } else {
          this._notificationService.showError("", "Sorry, User details could not be updated");
        }
      })
    }
  }
  InActiveModalInfo(value1: any, value2: any) {
    this.userModel = value2;
    this.modalReference = this.modalService.open(value1, { size: 'sm' });
  }
  omit_special_char(event) {
    var k;
    k = event.charCode;
    return ((k >= 48 && k <= 57));
  }
  ManageUserStatus(status: string) {
    // if (status === ActiveInActiveStatus.InActive) {
    //   status = ActiveInActiveStatus.InActive.toString()
    // } else {
    //   status = ActiveInActiveStatus.ReActive.toString()
    // }
    // let model: any = {};
    // model.Id = this.userModel.Id;
    // model.UpdatedBy = this.userName;
    // model.ActionType = status;
    // model.Email = this.userModel.Email;
    // model.FirstName = this.userModel.FirstName;
    // model.LastName = this.userModel.LastName;
    //{ Id: this.userModel.Id, UpdatedBy: this.userName , ActionType: status }
    this.rmmapi.postData("mdusers/Users/Delete", this.userModel).toPromise().then((resp: any) => {

      if (resp) {
         this._notificationService.showSuccess("", "User inactivated successfully");
         this.GetUsers();
         this.modalReference.close();
        // if (resp.Data == -1) {
        //   this.GetUsers();
        //   this.modalReference.close();
        //   if(status=="inactive")
        //   {
        //   this._notificationService.showSuccess("", "User inactivated successfully");
        //   }
        //   else{
        //     this._notificationService.showSuccess("", "User reactivated successfully");
        //   }
        // } else {
        //   this.modalReference.close();
        //   if(status=="inactive")
        //   {
        //   this._notificationService.showWarning("", "Sorry, this User could not be inactivated because it is referred by another active item");
        //   }
        //   else{
        //     this._notificationService.showWarning("", "Sorry, this User could not be reactivated");
        //   }
        // }
      } 
      // else {
      //   if(status=="inactive")
      //     {
      //   this._notificationService.showError("", "Sorry, this User could not be inactivated");
      //     }
      //     else{
      //       this._notificationService.showError("", "Sorry, this User could not be reactivated");
      //     }
      //   this.modalReference.close();
      // }
    })
  }
  EditUserInfo(value1: any, value2: any) {
    this.isDisableFileds = true;
    this.actionType = false;
    this.userModel = value2;
    // this.userModel.RoleId = parseInt( value2.RoleId);
    this.modalReference = this.modalService.open(value1, { size: 'xl' });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ShowInactiveUsers(event: any) {
    this.ShowActiveUserOnly = !this.ShowActiveUserOnly;
    this.GetUsers()
  }

  public showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;
    if ((element.nodeName === 'TD' || element.nodeName === 'TH' || element.nodeName === 'SPAN')
      && element.offsetWidth < element.scrollWidth) {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }
}


