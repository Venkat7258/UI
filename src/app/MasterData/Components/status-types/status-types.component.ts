import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { NotificationService } from './../../../shared/services/notification.service';
import { StatusTypes } from '../../Models/status-types';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { HttpParams } from '@angular/common/http';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
@Component({
  selector: 'app-status-types',
  templateUrl: './status-types.component.html',
  styleUrls: ['./status-types.component.css']
})
export class StatusTypesComponent implements OnInit {
  public statustypesinfo: any = [];
  public statustypeList: GridDataResult;
  searchFilter: SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [{ field: 'Name', dir: 'asc' }];
  public type = "numeric";
  public position = "bottom";
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  StatusTypeform: any;
  Model: any = new StatusTypes();
  actionType: boolean = true;
  constructor(public _appService: AppService,
    public rmmapi: RMMApiService,
    private notifyService: NotificationService,
    private modalService: NgbModal,
    public env: EnvService) {
    this.StatusTypeform = new FormGroup({
      StatusTypeName: new FormControl("", Validators.required),
      Code: new FormControl("", Validators.required),
    });
  }

  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetStatusTypes();
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
    this.GetStatusTypes();
  }
  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
    this.sort = sort;
    this.GetStatusTypes();
  }
  GetStatusTypes() {
    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort);
    this.rmmapi.getData("StatusTypes/GetAllStatusTypes", params).toPromise().then((resp: any) => {
      this.statustypesinfo = resp.Data;
      this.statustypeList = {
        data: resp.Data.StatusTypeList,
        total: resp.Data.StatusTypeList && resp.Data.StatusTypeList.length > 0 ? resp.Data.StatusTypeList[0].TotalRecords : 0
      };
    })
  }
  AddStatusTypesModal(content) {
    this.StatusTypeform.markAsUntouched();
    this.actionType = true;
    this.resetControls();
    this.isDuplicateStatusTypeCode= false;
    this.statuscodeExists= "";
    this.StatusTypeform.controls["Code"].enable();
    this.Model = new StatusTypes();
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
  AddstatusTypesInfo() {
    
    this.StatusTypeform.controls["StatusTypeName"].markAsTouched()
    this.StatusTypeform.controls["Code"].markAsTouched()

    if (this.StatusTypeform.valid && this.Model.Name != '' && this.Model.Code != '') {

      this.rmmapi.getData("StatusTypes/CheckDuplicateStatusType?statusTypes=" + this.Model.Name.trim() + "&Id=" + (this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
        this.isDuplicateStatusType = res.Data;
        if (!this.isDuplicateStatusType) {

          this.rmmapi.getData("StatusTypes/CheckDuplicateStatusTypeCode?code=" + this.Model.Code +"&Id=" + (this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((resp: any) => {
            this.isDuplicateStatusTypeCode = resp.Data;
            if (!this.isDuplicateStatusTypeCode) {

              if (this.Model.Id == undefined) {
                this.rmmapi.postData("StatusTypes/AddStatusType", { Name: this.Model.Name, Code: this.Model.Code, CreatedBy: "" }).toPromise().then((resp: any) => {
                  if (resp && resp.Status) {
                    this.notifyService.showSuccess("", "Status Type added successfully");
                    this.GetStatusTypes();
                    this.modalReference.close();
                  } else {
                    this.notifyService.showError("", "Sorry, Status Type could not be added");
                  }
                });
              }
              else {
                this.rmmapi.postData("StatusTypes/UpdateStatusType", { Id: this.Model.Id, Name: this.Model.Name, UpdatedBy: "" }).toPromise().then((resp: any) => {
                  if (resp && resp.Status) {
                    this.notifyService.showSuccess("", "Status Type updated successfully");
                    this.GetStatusTypes();
                    this.modalReference.close();
                  } else {
                    this.notifyService.showError("", "Sorry, Status Type could not be updated");
                  }
                });
              }
                
              }
          });
      
        }
      })
    }
    else {
      this.StatusTypeform.markAllAsTouched();
    }
  }

  EditStatustypesInfo(value1: any, value2: any) {
    this.isDuplicateStatusType = false;
    if (this.rmmapi.getRolePrivilege('VST') && this.rmmapi.getRolePrivilege('MST')) {
      this.actionType = false;
      this.resetControls();
      this.StatusTypeform.controls["Code"].disable();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.Model.Code = value2.Code;
      this.modalReference = this.modalService.open(value1, { size: 'lg' });
    }
    else {
      this.actionType = false;
      this.resetControls();
      this.StatusTypeform.controls["Code"].disable();
      this.StatusTypeform.controls["StatusTypeName"].disable();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.Model.Code = value2.Code;
      this.modalReference = this.modalService.open(value1, { size: 'lg' });
    }
  }
  DeleteStatustypesInfo(Data) {
    this.Model.UpdatedBy = "";
    this.rmmapi.postData("StatusTypes/DeleteStatusType", this.Model).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetStatusTypes();
          this.notifyService.showSuccess("", "Status Type inactivated successfully");
        } else {
          this.notifyService.showWarning("", "Sorry, this Status Type could not be inactivated because it is referred by another active item");
        }
      } else {
        this.notifyService.showError("", "Error: unable to inactivate the Status Type");
      }
      this.modalReference.close();
    })
  }
  InActiveModalInfo(value1: any, value2: any) {
    this.Model.Id = value2.Id
    this.Model.Name = value2.Name;
    this.modalReference = this.modalService.open(value1, { size: 'sm' });
  }
  checkEmpty() {
    if (this.Model.Code.trim().length == 0) {
      this.Model.Code = '';
      return;
    }
    
   
  }

  isDuplicateStatusType: boolean = false;
  isDuplicateStatusTypeCode: boolean = false;
  statustypeExists: string;
  statuscodeExists: string;
 
  checkDuplicateStatusType() {
    this.resetControls();
     if(this.Model.Name != undefined && this.Model.Name.trim().length > 0) {
      this.Model.Name=this.Model.Name.trim();
      this.rmmapi.getData("StatusTypes/CheckDuplicateStatusType?statusTypes=" + this.Model.Name +"&Id=" + (this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
        this.isDuplicateStatusType = res.Data;
        if (this.isDuplicateStatusType) {
            this.statustypeExists = this.env.ValidationMessages.Thisvaluealreadyexists;
            this.StatusTypeform.controls["StatusTypeName"].setErrors({ 'incorrect': true });
          }else {
          this.StatusTypeform.controls["StatusTypeName"].setErrors(null);
          }
      });
      }
      else{
        this.Model.Name = '';
        return;
      }
  }

  checkDuplicateStatusTypeCode() {
  this.isDuplicateStatusTypeCode= false;
  this.statuscodeExists= "";

      if(this.Model.Code != undefined  && this.Model.Code.trim().length > 0) {
        this.Model.Code=this.Model.Code.trim();
        this.rmmapi.getData("StatusTypes/CheckDuplicateStatusTypeCode?code=" + this.Model.Code +"&Id=" + (this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
          this.isDuplicateStatusTypeCode = res.Data;
          if (this.isDuplicateStatusTypeCode) {
              this.statuscodeExists = this.env.ValidationMessages.Thisvaluealreadyexists;
              this.StatusTypeform.controls["Code"].setErrors({ 'incorrect': true });
            }else {
            this.StatusTypeform.controls["Code"].setErrors(null);
            }
        });
      }
      else{
        this.Model.Code = '';
        return;
      }
  }

  resetControls() {
    this.statustypeExists = "";
    this.isDuplicateStatusType = false;
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
