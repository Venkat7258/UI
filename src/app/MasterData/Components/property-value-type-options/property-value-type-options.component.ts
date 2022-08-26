import { HttpParams } from '@angular/common/http';
import { Component, OnInit,ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { PropertyValueTypeOptions } from '../../Models/property-value-type-options';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
@Component({
  selector: 'app-property-value-type-options',
  templateUrl: './property-value-type-options.component.html',
  styleUrls: ['./property-value-type-options.component.css']
})
export class PropertyValueTypeOptionsComponent implements OnInit {
  public propertyValueTypeOptionsinfo: any[] = [];
  public propertyValueTypeOptionsList:GridDataResult;
  searchFilter : SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [ { field: 'PropertyValueTypeOption', dir: 'asc'}];
  public type = "numeric";
  public position = "bottom";
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  propertyValueTypeOptionsModel: any = new PropertyValueTypeOptions();
  isCheckPropertyValueTypeOptions: boolean = false;
  userName: any = "";
  actionType:boolean=true;
  constructor(public _notificationService: NotificationService, public env: EnvService, public _appService: AppService, public rmmapi: RMMApiService, private modalService: NgbModal) { }
  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetPropertyValueTypeOptions();
    

  }
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "PropertyValueTypeOption asc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }
  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber =   event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetPropertyValueTypeOptions();
 }
 sortChange(sort: SortDescriptor[]): void {
  this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "PropertyValueTypeOption asc";
  this.sort = sort;  
  this.GetPropertyValueTypeOptions();
}
  GetPropertyValueTypeOptions() {
    let params = new HttpParams().set("PageSize",this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
    .set("Sort",this.searchFilter.sort);
    this.rmmapi.getData("PropertyValueTypeOptions/GetAllPropertyValueTypeOptions",params).toPromise().then((resp: any) => {
      this.propertyValueTypeOptionsinfo = resp.Data;
      this.propertyValueTypeOptionsList = {
        data: resp.Data.PropertyvalueTypesOptionsDetailsList,
        total: resp.Data.PropertyvalueTypesOptionsDetailsList && resp.Data.PropertyvalueTypesOptionsDetailsList.length > 0 ? resp.Data.PropertyvalueTypesOptionsDetailsList[0].TotalRecords : 0
    };
    })
  }
  PropertyValueTypeOptionsModal(content) {
    this.actionType=true;
    this.isCheckPropertyValueTypeOptions=false;
    this.propertyValueTypeOptionsModel = new PropertyValueTypeOptions();
    this.modalReference = this.modalService.open(content,{size:'lg'});
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
  AddPropertyValueTypeOptionsInfo() {
    if(this.propertyValueTypeOptionsModel.PropertyValueTypeOption.trim()!='')
    {
    this.propertyValueTypeOptionsModel.PropertyValueTypeOption=this.propertyValueTypeOptionsModel.PropertyValueTypeOption.trim();
    let params = new HttpParams().set("Name",this.propertyValueTypeOptionsModel.PropertyValueTypeOption).set("Id", (this.propertyValueTypeOptionsModel.Id ? this.propertyValueTypeOptionsModel.Id : 0));
    this.rmmapi.getData("PropertyValueTypeOptions/CheckDuplicatePropertyValueTypeOption",params).toPromise().then((resp: any) => {
      this.isCheckPropertyValueTypeOptions = resp.Data;
      if (!this.isCheckPropertyValueTypeOptions) {
        if (this.propertyValueTypeOptionsModel.Id == undefined ) {
          this.rmmapi.postData("PropertyValueTypeOptions/AddPropertyValueTypeOption", { PropertyValueTypeOption: this.propertyValueTypeOptionsModel.PropertyValueTypeOption, CreatedBy: this.userName }).toPromise().then((resp: any) => {
            if (resp && resp.Status) {
              this._notificationService.showSuccess("", "Property Value Type Option added successfully");
              this.GetPropertyValueTypeOptions();
              this.modalReference.close();
              this.modalReference.close();
            } else {
              this._notificationService.showError("", "Sorry, Property Value Type Option could not be added");
            }
          })
        } else {
          this.rmmapi.postData("PropertyValueTypeOptions/UpdatePropertyValueTypeOption", { Id: this.propertyValueTypeOptionsModel.Id, PropertyValueTypeOption: this.propertyValueTypeOptionsModel.PropertyValueTypeOption, UpdatedBy: this.userName }).toPromise().then((resp: any) => {
            if (resp && resp.Status) {
              this._notificationService.showSuccess("", "Property Value Type Option updated successfully");
              this.GetPropertyValueTypeOptions();
              this.modalReference.close();
              this.modalReference.close();
            } else {
              this._notificationService.showError("", "Sorry, Property Value Type Option could not be updated");
            }
          })
        }
      }
    })
  }
  }
  EditPropertyValueTypeOptionsInfo(value1: any, value2: any) {
    if(this.rmmapi.getRolePrivilege('VPVTO') && this.rmmapi.getRolePrivilege('MPVTO'))
    {
    this.actionType=false;
    this.isCheckPropertyValueTypeOptions=false;
    this.propertyValueTypeOptionsModel.Id = value2.Id
    this.propertyValueTypeOptionsModel.PropertyValueTypeOption = value2.PropertyValueTypeOption;
    this.modalReference = this.modalService.open(value1,{size:'lg'});
    }
    else{
      this.actionType=false;
    this.isCheckPropertyValueTypeOptions=false;
    this.propertyValueTypeOptionsModel.Id = value2.Id
    this.propertyValueTypeOptionsModel.PropertyValueTypeOption = value2.PropertyValueTypeOption;
    this.modalReference = this.modalService.open(value1,{size:'lg'});
    }
  }
  DeletePropertyValueTypeOptionsInfo() {
    this.rmmapi.postData("PropertyValueTypeOptions/DeletePropertyValueTypeOption", { Id: this.propertyValueTypeOptionsModel.Id, UpdatedBy: this.userName }).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetPropertyValueTypeOptions();
          this.modalReference.close();
          this._notificationService.showSuccess("", "Property Value Type Option inactivated successfully");
        } else {
          this.modalReference.close();
          this._notificationService.showWarning("", "Sorry, this Property Value Type Option could not be inactivated because it is referred by another active item");
        }
      } else {
        this._notificationService.showError("", "Error: unable to inactivate the Property Value Type Option");
      }
    })
  }
  CheckDuplicatePropertyValueTypeOptionsInfo() {
   
    let params = new HttpParams().set("Name",this.propertyValueTypeOptionsModel.PropertyValueTypeOption.trim()).set("Id", (this.propertyValueTypeOptionsModel.Id ? this.propertyValueTypeOptionsModel.Id : 0));
    this.rmmapi.getData("PropertyValueTypeOptions/CheckDuplicatePropertyValueTypeOption",params).toPromise().then((resp: any) => {
      this.isCheckPropertyValueTypeOptions = resp.Data;
    })
  }
  InActiveModalInfo(value1: any, value2: any) {
    
    this.propertyValueTypeOptionsModel.Id = value2.Id
    this.propertyValueTypeOptionsModel.PropertyValueTypeOption = value2.PropertyValueTypeOption
    this.modalReference = this.modalService.open(value1,{size:'sm'});
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
