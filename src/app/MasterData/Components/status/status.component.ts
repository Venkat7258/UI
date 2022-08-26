import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../shared/services/notification.service';
import { Status } from '../../Models/status';
import { PaginationDefalts, SearchFilter } from 'src/app/shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { HttpParams } from '@angular/common/http';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { EnvService } from 'src/app/shared/services/env.service';
@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {
  public statusinfo: any = [];
  public statusList: GridDataResult;
  searchFilter: SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [{ field: 'Name', dir: 'asc' }];
  public type = "numeric";
  public position = "bottom";
  allStatusType: any;
  Model: any = new Status();
  ModuleName: any = "Status"
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  statusform: any;
  actionType: boolean = true;
  public defaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  constructor(public _appService: AppService,
    public rmmapi: RMMApiService,
    private notifyService: NotificationService,
    private modalService: NgbModal,
    public env : EnvService) {
    this.statusform = new FormGroup({
      StatusName: new FormControl("", Validators.required),
      statustypeid: new FormControl("", Validators.required),
      Code: new FormControl("", Validators.required),
    });
  }

  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.getStatus();
    const sessionTab = this.rmmapi.getStorage(this.env.CurrentTabState.TabName);

    if (sessionTab !== undefined && sessionTab !== 'undefined' && sessionTab !== null) {
      const tempSubMenuArray = [
        'Status',
        'StatusTypes']
      if (tempSubMenuArray.find(item => item == sessionTab)) {
        this.tabchange(sessionTab);
      }  else {
        this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
      }
    }
  }
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "Name asc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }
  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber = event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.getStatus();
  }
  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
    this.sort = sort;
    this.getStatus();
  }
  getStatus() {
    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort);
    this.rmmapi.getData("Status/GetAllStatus", params).toPromise().then((res: any) => {
      this.statusinfo = res.Data;
      this.statusList = {
        data: res.Data.StatusList,
        total: res.Data.StatusList && res.Data.StatusList.length > 0 ? res.Data.StatusList[0].TotalRecords : 0
      };
    });
  }
  getAllStatusTypes() {

    this.rmmapi.getData("Status/GetStatusStatusTypes").toPromise().then((res: any) => {
      this.allStatusType = res.Data;
    });
  }
  openStatusPopUp(content) {
   
    this.actionType = true;
    this.statusform.markAsUntouched();
    this.statusform.reset();
    this.statusform.submitted = false;
    this.statusform.controls["Code"].enable();
    this.isDuplicateStatus = false;
    this.isDuplicateStatusCode = false;
    this.Model.Id = 0;
    this.Model = new Status();
    this.getAllStatusTypes();
    this.modalReference = this.modalService.open(content, { size: 'lg' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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
  saveStatus() {

    this.statusform.submitted = true;
    this.statusform.controls["StatusName"].markAsTouched()
    this.statusform.controls["Code"].markAsTouched()

    if (this.statusform.valid && this.Model.Name != '' && this.Model.Code != '') {
     // this.Model.Code = this.Model.Code;
    
     this.isDuplicateStatus = false;
     this.isDuplicateStatusCode = false;
    
     this.rmmapi.getData("Status/CheckDuplicateStatus?status=" + this.Model.Name.trim() + "&Id=" + (this.Model.Id === undefined ? 0 : this.Model.Id)  ).toPromise().then((res: any) => {
      this.isDuplicateStatus = res.Data;

      if (!this.isDuplicateStatus) {

        this.rmmapi.getData("Status/CheckDuplicateStatusCode?statusCode=" + this.Model.Code.trim() + "&Id=" + (this.Model.Id === undefined ? 0 : this.Model.Id)  ).toPromise().then((resp: any) => {
          this.isDuplicateStatusCode = resp.Data;
    
          if (!this.isDuplicateStatusCode) {
    
            if (this.Model.Id > 0) {

              this.Model.UpdatedBy = "";
              this.Model.UpdatedDate = new Date();
              this.rmmapi.postData("Status/UpdateStatus", this.Model).toPromise().then((resp: any) => {
                if (resp && resp.Status) {
                 this.notifyService.showSuccess("","Status updated successfully");
                  this.getStatus();
                  this.modalReference.close();
                } else {
                  this.notifyService.showError("", "Sorry, Status could not be updated");
                }
                this.statusform.submitted = false;
              });
            }
            else {
      
              this.Model.CreatedBy = "";
              this.Model.CreatedDate = new Date();
              this.rmmapi.postData("Status/AddStatus", this.Model).toPromise().then((resp: any) => {
                if (resp && resp.Status) {
                  this.notifyService.showSuccess("", "Status added successfully");
                  this.getStatus();
                  this.modalReference.close();
                } else {
                  this.notifyService.showError("", "Sorry, Status could not be added");
                }
                this.statusform.submitted = false;
              });
            }
          }

        });

      }
      
    });
    } 
    else{
      this.statusform.markAllAsTouched();
    }
  }


  editStatus(value1: any, value2: any) {
    this.isDuplicateStatus = false;
    if (this.rmmapi.getRolePrivilege('VSTATUS') && this.rmmapi.getRolePrivilege('MSTATUS')) {
      this.actionType = false;
      this.getAllStatusTypes();
      this.statusform.controls["Code"].disable();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.Model.Code = value2.Code;
      this.Model.StatusTypeId = value2.StatusTypeId;
      this.modalReference = this.modalService.open(value1, { size: 'lg' });
    }
    else {
      this.actionType = false;
      this.getAllStatusTypes();
      this.statusform.controls["Code"].disable();
      this.statusform.controls["StatusName"].disable();
      this.statusform.controls["statustypeid"].disable();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.Model.Code = value2.Code;
      this.Model.StatusTypeId = value2.StatusTypeId;
      this.modalReference = this.modalService.open(value1, { size: 'lg' });
    }
  }
  deleteStatus(value) {
    this.Model.UpdatedBy = "";
    this.Model.UpdatedDate = new Date();
    this.rmmapi.postData("Status/DeleteStatus", { Id: this.Model.Id, Name: this.Model.Name, StatusTypeId: this.Model.StatusTypeId, UpdatedBy: "" }).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.getStatus();
          this.notifyService.showSuccess("", "Status inactivated successfully");
        } else {
          this.notifyService.showWarning("", "Sorry, this Status could not be inactivated because it is referred by another active item");
        }
      } else {
        this.notifyService.showError("", "Error: unable to inactivate the Status");
      }
      this.modalReference.close();
    });
  }

  InActiveModalInfo(value1: any, value2: any) {
    this.Model.Id = value2.Id
    this.Model.Name = value2.Name;
    this.modalReference = this.modalService.open(value1, { size: 'sm' });
  }
  checkEmpty()
  {
    if(this.Model.Code.trim().length==0){
      this.Model.Code='';
      return;
    }
  }
  isDuplicateStatus: boolean = false;
  statusExists: string;
 
  isDuplicateStatusCode: boolean = false;
  statusCodeExists: string;
 
  checkDuplicateStatusCode() {

    this.isDuplicateStatusCode = false;

    if(this.Model.Code != undefined &&  this.Model.Code.trim().length >0){
      this.Model.Code =this.Model.Code.trim();
      this.rmmapi.getData("Status/CheckDuplicateStatusCode?statusCode=" + this.Model.Code.trim() + "&Id=" + (this.Model.Id === undefined ? 0 : this.Model.Id)  ).toPromise().then((res: any) => {
        var response = res.Data;
  
        if (response) {
  
          this.isDuplicateStatusCode = true;
          this.statusExists = this.env.ValidationMessages.Thisvaluealreadyexists;
          this.statusform.controls["Code"].setErrors({ 'incorrect': true });
        } else {
          this.isDuplicateStatusCode = false;
          this.statusCodeExists = res.Message;
          this.statusform.controls["Code"].setErrors(null);
        }
      });
    }
    else{
      this.Model.Code='';
      return;
    }

    
  }

  checkDuplicateStatusName() {

    this.isDuplicateStatus = false;

    if(this.Model.Name != undefined && this.Model.Name.trim().length >0){
    this.rmmapi.getData("Status/CheckDuplicateStatus?status=" + this.Model.Name.trim() + "&Id=" + (this.Model.Id === undefined ? 0 : this.Model.Id)  ).toPromise().then((res: any) => {
      this.isDuplicateStatus = res.Data;

      if (this.isDuplicateStatus) {

        this.isDuplicateStatus = true;
        this.statusExists = this.env.ValidationMessages.Thisvaluealreadyexists;
        this.statusform.controls["StatusName"].setErrors({ 'incorrect': true });
      } else {
        this.isDuplicateStatus = false;
        this.statusExists = res.Message;
        this.statusform.controls["StatusName"].setErrors(null);
      }
    });
    }
    else{
      this.Model.Name='';
      return;
    }
  }
  tabchange(tabname) {
    this.ModuleName = tabname;
    this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
    this.rmmapi.setStorage(this.env.CurrentTabState.TabName, tabname);
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