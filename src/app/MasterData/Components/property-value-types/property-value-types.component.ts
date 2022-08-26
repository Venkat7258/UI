import { HttpParams } from '@angular/common/http';
import { Component, OnInit,ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { PropertyValueTypes } from '../../Models/property-value-types';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-property-value-types',
  templateUrl: './property-value-types.component.html',
  styleUrls: ['./property-value-types.component.css']
})
export class PropertyValueTypesComponent implements OnInit {

  public propertyValueTypesinfo: any[] = [];
  public statusList: any[] = [];
  public propertyValueTypesList:GridDataResult;
  searchFilter : SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [ { field: 'PropertyValueTypeOptionName', dir: 'asc'}];
  public type = "numeric";
  public position = "bottom";
  public allPropertyValueTypeOption: any[] = [];
  public allRegulationProperties: any[] = [];
  public allRegulationPropertieslist: any[] = [];
  public allRegulationGroups: any[] = [];
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  regulationGroup : number;
  regulationProperty:number;
  propertyValueTypeOption : number;
  complianceStatus : number;
  PropertyValueTypesform:any;
  IsCheckPropertyValueTypes:boolean=false;
  propertyValueTypesModel: any = new PropertyValueTypes();
  actionType: boolean = true;
  public defaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  public pvtodefaultItem: { PropertyValueTypeOption: string; Id: number } = {
    PropertyValueTypeOption: "-- Select --",
    Id: null,
  };

  public rpdefaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  userName: any = "";
  constructor(public _notificationService: NotificationService, public env: EnvService, public _appService: AppService, public rmmapi: RMMApiService, private modalService: NgbModal) { }
  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.PropertyValueTypesform = new FormGroup({
      RegulationGroups: new FormControl("", Validators.required),
      RegulationProperties: new FormControl("",Validators.required),
      PropertyValueTypeOption: new FormControl("", Validators.required),
      StatusId: new FormControl("", Validators.required)
    });
    this.setDefaults();
    this.GetPropertyValueTypes();
    this.GetRegulationGroups();
    this.GetPropertyValueTypeOptions();
    this.GetRegulationProperties();
    this.GetStatus();
    
  }
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "PropertyValueTypeOptionName asc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }
  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber =   event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetPropertyValueTypes();
 }
 sortChange(sort: SortDescriptor[]): void {
  this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "PropertyValueTypeOptionName asc";
  this.sort = sort;  
  this.GetPropertyValueTypes();
}
  GetStatus() {
    let params = new HttpParams().set("statusType", 'CS');
    this.rmmapi.getData("Status/GetStatusByType", params).toPromise().then((resp: any) => {
      this.statusList = resp.Data;
    })
  }
  GetPropertyValueTypes() {
    let params = new HttpParams().set("PageSize",this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
    .set("Sort",this.searchFilter.sort);
    this.rmmapi.getData("PropertyValueTypes/GetAllPropertyValueTypes",params).toPromise().then((resp: any) => {
      this.propertyValueTypesinfo = resp.Data;
      this.propertyValueTypesList = {
        data: resp.Data.ProprtyValueTypesDetailList,
        total: resp.Data.ProprtyValueTypesDetailList && resp.Data.ProprtyValueTypesDetailList.length > 0 ? resp.Data.ProprtyValueTypesDetailList[0].TotalRecords : 0
    };
    })
  }
  GetPropertyValueTypeOptions() {
    // let params = new HttpParams().set("PageSize",this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
    // .set("Sort",this.searchFilter.sort);
    this.rmmapi.getData("PropertyValueTypeOptions/GetPropertyValueTypeOptions").toPromise().then((resp: any) => {
      this.allPropertyValueTypeOption = resp.Data;
    //   this.propertyValueTypesList = {
    //     data: resp.Data.ProprtyValueTypesDetailList,
    //     total: resp.Data.ProprtyValueTypesDetailList && resp.Data.ProprtyValueTypesDetailList.length > 0 ? resp.Data.ProprtyValueTypesDetailList[0].TotalRecords : 0
    // };
    })
  }
  GetRegulationGroups() {
   
    this.rmmapi.getData("RegulationGroups/GetCheckListRegulationGroups").toPromise().then((resp: any) => {
      this.allRegulationGroups = resp.Data;
    })
  }
  GetRegulationProperties() {
    this.rmmapi.getData("RegulationProperties/GetCheckListRegulationProperties").toPromise().then((resp: any) => {
      this.allRegulationPropertieslist = resp.Data;
    })
  }
  InActiveModalInfo(value1: any, value2: any) {
    this.propertyValueTypesModel.Id = value2.Id;
    this.propertyValueTypesModel.ChecklistRegulationGroupId = value2.ChecklistRegulationGroupId;
    this.propertyValueTypesModel.Name = value2.Name;
    this.modalReference = this.modalService.open(value1,{ size: 'sm' });
  }
  PropertyValueTypesModal(content) {
    
    this.actionType = true;
    this.IsCheckPropertyValueTypes=false;
    this.propertyValueTypesModel = new PropertyValueTypes();
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
  AddPropertyValueTypesInfo() { 
     this.PropertyValueTypesform.markAsTouched()
    let params = new HttpParams().set("propertyValueTypeOptionId", this.propertyValueTypesModel.PropertyValueTypeOptionId).set("regulationPropertiesId", this.propertyValueTypesModel.ChecklistRegulationPropertiesId).set("regulationGroupId", this.propertyValueTypesModel.ChecklistRegulationGroupId).set("Id", (this.propertyValueTypesModel.Id ? this.propertyValueTypesModel.Id : 0));
    this.rmmapi.getData("PropertyValueTypes/CheckDuplicatePropertyValueType", params).toPromise().then((resp: any) => {
      this.IsCheckPropertyValueTypes = resp.Data;
      if (!this.IsCheckPropertyValueTypes) {
      if (this.propertyValueTypesModel.Id == undefined) {
        this.rmmapi.postData("PropertyValueTypes/AddPropertyValueType", { PropertyValueTypeOptionId: this.propertyValueTypesModel.PropertyValueTypeOptionId, ChecklistRegulationPropertiesId: this.propertyValueTypesModel.ChecklistRegulationPropertiesId, ChecklistRegulationGroupId: this.propertyValueTypesModel.ChecklistRegulationGroupId, CreatedBy: this.userName, StatusId : this.propertyValueTypesModel.StatusId }).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this._notificationService.showSuccess("", "Property Value Type added successfully");
            this.GetPropertyValueTypes();
            this.modalReference.close();
          } else {
            this._notificationService.showError("", "Sorry, Property Value Type could not be added");
          }
        })
      } else {
        this.rmmapi.postData("PropertyValueTypes/UpdatePropertyValueType", { Id: this.propertyValueTypesModel.Id, PropertyValueTypeOptionId: this.propertyValueTypesModel.PropertyValueTypeOptionId, ChecklistRegulationPropertiesId: this.propertyValueTypesModel.ChecklistRegulationPropertiesId, ChecklistRegulationGroupId: this.propertyValueTypesModel.ChecklistRegulationGroupId, UpdatedBy: this.userName, StatusId : this.propertyValueTypesModel.StatusId }).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
           this._notificationService.showSuccess("", "Property Value Type updated successfully");
            this.GetPropertyValueTypes();
            this.modalReference.close();
          } else {
            this._notificationService.showError("", "Sorry, Property Value Type could not be updated");
          }
        })
      }
    }
    });
  }
  EditPropertyValueTypesInfo(value1: any, value2: any) {
    this.actionType = false;
    this.IsCheckPropertyValueTypes=false;
    this.OnRegulationGroupsChange(value2.ChecklistRegulationGroupId);
    this.GetStatus();
    this.propertyValueTypesModel.Id = value2.Id
    this.propertyValueTypesModel.PropertyValueTypeOptionId = value2.PropertyValueTypeOptionId;
    this.propertyValueTypesModel.ChecklistRegulationPropertiesId = value2.ChecklistRegulationPropertiesId;
    this.propertyValueTypesModel.ChecklistRegulationGroupId = value2.ChecklistRegulationGroupId;
    this.propertyValueTypesModel.StatusId=value2.StatusId;
    this.modalReference = this.modalService.open(value1, { size: 'lg' });
  }
  DeletePropertyValueTypesInfo() {
    this.rmmapi.postData("PropertyValueTypes/DeletePropertyValueType", { Id: this.propertyValueTypesModel.Id,ChecklistRegulationGroupId:this.propertyValueTypesModel.ChecklistRegulationGroupId, UpdatedBy: this.userName }).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetPropertyValueTypes();
          this.modalReference.close();
          this._notificationService.showSuccess("", "Property Value Type inactivated successfully");
        } else {
          this.modalReference.close();
          this._notificationService.showWarning("", "Sorry, this Property Value Type could not be inactivated because it is referred by another active item");
        }
      } else {
        this._notificationService.showError("", "Error: unable to inactivate the Property Value Type");
      }
    })
  }
  OnRegulationGroupsChange(event:any) {
    
    if (event) {
        this.allRegulationProperties = this.allRegulationPropertieslist.filter(x => x.ChecklistRegulationGroupId == event);
      if (this.allRegulationProperties.length > 0) 
        this.propertyValueTypesModel.ChecklistRegulationGroupId = this.allRegulationProperties[0].ChecklistRegulationGroupId;
       
    } else {
      this.allRegulationProperties = [];
      this.propertyValueTypesModel.ChecklistRegulationGroupId = null;
    }
  }
  IsCheckPropertyValueTypesInfo() {
    ;
    if (this.propertyValueTypesModel.PropertyValueTypeOptionId != undefined && this.propertyValueTypesModel.ChecklistRegulationPropertiesId!= undefined && this.propertyValueTypesModel.ChecklistRegulationGroupId!= undefined) {
      let params = new HttpParams().set("propertyValueTypeOptionId",this.propertyValueTypesModel.PropertyValueTypeOptionId).set("regulationPropertiesId",this.propertyValueTypesModel.ChecklistRegulationPropertiesId).set("regulationGroupId",this.propertyValueTypesModel.ChecklistRegulationGroupId).set("Id", (this.propertyValueTypesModel.Id ? this.propertyValueTypesModel.Id : 0));
      this.rmmapi.getData("PropertyValueTypes/CheckDuplicatePropertyValueType",params).toPromise().then((resp: any) => {
        this.IsCheckPropertyValueTypes = resp.Data;
      })
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
