import { HttpParams } from '@angular/common/http';
import { Component, OnInit,ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { AppService } from 'src/app/app.service';
import { NotificationService } from 'src/app/notification.service';
import { PaginationDefalts, SearchFilter } from 'src/app/shared/constants/global.constants';
import { EnvService } from 'src/app/shared/services/env.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { UserDetails } from '../Models/user-details';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  public userDetailsInfoList: GridDataResult;
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  IsCheckUser: boolean = false;
  actionType = true;
  userModel: any = new UserDetails();
  public cityInfoList: any[] = [];
  public rolesInfoList: any[] = [];
  public statesInfoList: any[] = [];
  public countriesInfoList: any[] = [];
  public affiliatesInfoList: any[] = [];
  public tenantsInfoList: any[] = [];
  public isCheckUserName:boolean=false;
  public isCheckEmail:boolean=false;
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
  searchFilter: SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [{ field: 'ProductName', dir: 'asc' }];
  constructor(public router: Router, public _notificationService: NotificationService, public env: EnvService, public _appService: AppService, private rmmapi: RMMApiService, private modalService: NgbModal) { }
  ngOnInit(): void {

    this._appService.setHeaderShow(true);
    this._appService.setHeaderTitle("Administration");
    this.setDefaults();
    this.GetCities();
    this.GetUsers();
    this.GetRoles();
    this.GetStates();
    this.GetCountries();
    this.GetTenants();
    this.GetAffiliates();

  }
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "Id asc";
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
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "ProductName asc";
    this.sort = sort;
    this.GetUsers();
  }
  GetCities() {
    this.rmmapi.getData("UserAccount/GetCities").toPromise().then((resp: any) => {
      this.cityInfoList = resp.Data;
    })
  }
  GetUsers() {
    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort).set("id", "0").set("type", "type").set("InActive", "0");
    this.rmmapi.getData("UserAccount/GetUsers", params).toPromise().then((resp: any) => {
      this.userDetailsInfoList = {
        data: resp.Data.UserList,
        total: resp.Data.UserList && resp.Data.UserList.length > 0 ? resp.Data.UserList[0].TotalRecords : 0
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
    if (this.userModel.Id == undefined) {
      this.userModel.CreatedBy = "";
      this.rmmapi.postData("UserAccount/AddUser", this.userModel).toPromise().then((resp: any) => {
        if (resp && resp.Status) {
          // this._notificationService.showSuccess("", this.userModel.UserName + resp.Message);
          this._notificationService.showSuccess("", "User added successfully");
          this.GetUsers();
          this.modalReference.close();
        } else {
          this._notificationService.showWarning("", "Sorry, User could not be added");
        }
      })
    } else {
      this.rmmapi.postData("UserAccount/UpdateUser", this.userModel).toPromise().then((resp: any) => {
        if (resp && resp.Status) {
          this._notificationService.showSuccess("", "User details updated successfully");
          this.GetUsers();
          this.modalReference.close();
        } else {
          this._notificationService.showError("", "Sorry, User details could not be updated");
        }
      })
    }
  }

  EditUserInfo(value1: any, value2: any) {
    
    this.actionType = false;
    this.userModel = value2;
    this.userModel.RoleId = value2.RoleId;
    this.modalReference = this.modalService.open(value1, { size: 'lg' });
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
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
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


