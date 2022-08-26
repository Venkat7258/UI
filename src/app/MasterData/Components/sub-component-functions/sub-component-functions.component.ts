import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { NotificationService } from './../../../shared/services/notification.service';
import { SubComponentFunctions } from '../../Models/sub-component-functions';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { HttpParams } from '@angular/common/http';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
@Component({
  selector: 'app-sub-component-functions',
  templateUrl: './sub-component-functions.component.html',
  styleUrls: ['./sub-component-functions.component.css']
})
export class SubComponentFunctionsComponent implements OnInit {
  public subcomponentfunctionsInfo: any = [];
  public subcomponentfunctionsList: GridDataResult;
  searchFilter: SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [{ field: 'Name', dir: 'asc' }];
  public type = "numeric";
  public position = "bottom";

  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  SubComponentFunctionform: any;
  Model: any = new SubComponentFunctions();
  actionType: boolean = true;
  isDuplicateSubComponentFunction: boolean = false;
  subcomponentfunctionExists: string;
  constructor(public _appService: AppService,
    public rmmapi: RMMApiService,
    private notifyService: NotificationService,
    private modalService: NgbModal,
    public env : EnvService) {
    this.SubComponentFunctionform = new FormGroup({
      SubComponentFunctionName: new FormControl("", Validators.required),
    });
  }

  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetSubComponentFunctions();
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
    this.GetSubComponentFunctions();
  }
  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
    this.sort = sort;
    this.GetSubComponentFunctions();
  }
  GetSubComponentFunctions() {
    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort);
    this.rmmapi.getData("SubComponentFunctions/GetAllSubComponentFunctions", params).toPromise().then((resp: any) => {
      this.subcomponentfunctionsInfo = resp.Data;
      this.subcomponentfunctionsList = {
        data: resp.Data.SubComponentFunctionsDetailsList,
        total: resp.Data.SubComponentFunctionsDetailsList && resp.Data.SubComponentFunctionsDetailsList.length > 0 ? resp.Data.SubComponentFunctionsDetailsList[0].TotalRecords : 0
      };
    })
  }
  AddSubComponentFunctionsModal(content) {
    this.resetControls();
    this.SubComponentFunctionform.markAsUntouched();
    this.Model = new SubComponentFunctions();
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
    } 
    else {
      return `with: ${reason}`;
    }
    
  }
  AddsubcomponentFunctionInfo() {
    this.SubComponentFunctionform.submitted = true;
    this.actionType = true;
    this.isDuplicateSubComponentFunction = false;
    if (this.SubComponentFunctionform.valid && this.Model.Name.trim() != '') {
      
      this.rmmapi.getData("SubComponentFunctions/CheckDuplicateSubComponentFunction?subComponentFunctions=" + this.Model.Name.trim() + "&Id=" + (this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
        this.isDuplicateSubComponentFunction = res.Data;
          if(!this.isDuplicateSubComponentFunction){
      if (this.Model.Id == undefined) {
        this.rmmapi.postData("SubComponentFunctions/AddSubComponentFunction", { Name: this.Model.Name, CreatedBy: "" }).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this.notifyService.showSuccess("", "Sub-component Function added successfully");
            this.GetSubComponentFunctions();
            this.modalReference.close();
          } else {
            this.notifyService.showError("", "Sorry, Sub-component Function could not be added");
          }
          this.SubComponentFunctionform.submitted = false;
        });
      }
      else {
        this.rmmapi.postData("SubComponentFunctions/UpdateSubComponentFunction", { Id: this.Model.Id, Name: this.Model.Name, UpdatedBy: "" }).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this.notifyService.showSuccess("", "Sub-component Function updated successfully");
            this.GetSubComponentFunctions();
            this.modalReference.close();
          } else {
            this.notifyService.showError("", "Sorry, Sub-component Function could not be updated");
          }
          this.SubComponentFunctionform.submitted = false;
        });
      }
    }
    this.subcomponentfunctionExists = "";
    this.SubComponentFunctionform.controls["SubComponentFunctionName"].setErrors(null);
  })
}
    else {
      this.SubComponentFunctionform.markAllAsTouched();
    }
  }
  EditSubComponentFunctionsInfo(value1: any, value2: any) {
    if (this.rmmapi.getRolePrivilege('VSF') && this.rmmapi.getRolePrivilege('MSF')) {
      this.actionType = false;
      this.resetControls();
      this.SubComponentFunctionform.reset();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.modalReference = this.modalService.open(value1, { size: 'lg' });
    }
    else {
      this.SubComponentFunctionform.controls["SubComponentFunctionName"].disable();
      this.actionType = false;
      this.resetControls();
      this.SubComponentFunctionform.reset();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.modalReference = this.modalService.open(value1, { size: 'lg' });
    }
  }
  DeleteSubComponentFunctionsInfo(Data) {
    this.Model.UpdatedBy = this.rmmapi.getUserName();
    this.rmmapi.postData("SubComponentFunctions/DeleteSubComponentFunction", this.Model).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetSubComponentFunctions();
          this.notifyService.showSuccess("", "Sub-component Function inactivated successfully");
        } else {
          this.notifyService.showWarning("", "Sorry, this Sub-component Function could not be inactivated because it is referred by another active item");
        }
      } else {
        this.notifyService.showError("", "Error: unable to inactivate the Sub-component Function");
      }
      this.modalReference.close();
    })
  }
  InActiveModalInfo(value1: any, value2: any) {
    this.Model.Id = value2.Id
    this.Model.Name = value2.Name;
    this.modalReference = this.modalService.open(value1, { size: 'sm' });
  }

  checkDuplicate() {
    this.isDuplicateSubComponentFunction = false;
    if(this.Model.Name.trim().length==0)
    {
      this.Model.Name='';
      return;
    }

    
    this.rmmapi.getData("SubComponentFunctions/CheckDuplicateSubComponentFunction?subComponentFunctions=" + this.Model.Name.trim() + "&Id=" + (this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
      if (res && res.Status && res.Data > 0) {
        this.isDuplicateSubComponentFunction = true;
        this.subcomponentfunctionExists = this.env.ValidationMessages.Thisvaluealreadyexists;
        this.SubComponentFunctionform.controls["SubComponentFunctionName"].setErrors({ 'incorrect': true });
      } else {
        this.isDuplicateSubComponentFunction = false;
        this.subcomponentfunctionExists = "";
        this.SubComponentFunctionform.controls["SubComponentFunctionName"].setErrors(null);
      }
    });
  }
  resetControls() {
    this.subcomponentfunctionExists = "";
    this.isDuplicateSubComponentFunction = false;
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
