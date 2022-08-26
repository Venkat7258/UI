import { HttpParams } from '@angular/common/http';
import { Component, OnInit,ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { RegulationProperties } from '../../Models/regulation-properties';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';

@Component({
  selector: 'app-regulation-properties',
  templateUrl: './regulation-properties.component.html',
  styleUrls: ['./regulation-properties.component.css']
})
export class RegulationPropertiesComponent implements OnInit {
  public regulationPropertiesinfo: any[] = [];
  public regulationPropertiesList:GridDataResult;
  searchFilter : SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [ { field: 'Name', dir: 'asc'}];
  public type = "numeric";
  public position = "bottom";
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  regulationPropertiesModel: any = new RegulationProperties();
  AllRegulationGroups: any[] = [];
  IsCheckRegulationProperties: boolean = false;
  actionType = true;
  public defaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  userName: any = "";
  constructor(public _notificationService: NotificationService, public env: EnvService, public _appService: AppService, public rmmapi: RMMApiService, private modalService: NgbModal) { }
  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this._appService.setHeaderShow(true);
    this.setDefaults();
    this.GetRegulationProperties();
    this.GetRegulationGroups();
    
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
    this.searchFilter.pageNumber =   event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetRegulationProperties();
 }
 sortChange(sort: SortDescriptor[]): void {
  this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
  this.sort = sort;  
  this.GetRegulationProperties();
}
  GetRegulationProperties() {
    let params = new HttpParams().set("PageSize",this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
    .set("Sort",this.searchFilter.sort);
    this.rmmapi.getData("RegulationProperties/GetAllChecklistRegulationProperties",params).toPromise().then((resp: any) => {
      this.regulationPropertiesinfo = resp.Data;
      this.regulationPropertiesList = {
        data: resp.Data.ChecklistRegulationPropertiesDetailsList,
        total: resp.Data.ChecklistRegulationPropertiesDetailsList && resp.Data.ChecklistRegulationPropertiesDetailsList.length > 0 ? resp.Data.ChecklistRegulationPropertiesDetailsList[0].TotalRecords : 0
    };
    })
  }
  GetRegulationGroups() {
    this.rmmapi.getData("RegulationGroups/GetCheckListRegulationGroups").toPromise().then((resp: any) => {
      this.AllRegulationGroups = resp.Data;
    })
  }
  RegulationPropertiesModal(content) {
    this.actionType = true;
    this.IsCheckRegulationProperties = false;
    this.regulationPropertiesModel.Id=0;
    this.regulationPropertiesModel = new RegulationProperties();
    this.GetRegulationGroups();
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
  AddRegulationPropertiesInfo() {
   if(this.regulationPropertiesModel.Name !== undefined && this.regulationPropertiesModel.Name.trim()!='' && this.IsCheckRegulationProperties==false)
   {
    let params = new HttpParams().set("Name",this.regulationPropertiesModel.Name).set("Id", (this.regulationPropertiesModel.Id ? this.regulationPropertiesModel.Id : 0));
    this.rmmapi.getData("RegulationProperties/CheckDuplicateCheckListRegulationProperty",params).toPromise().then((resp: any) => {
      this.IsCheckRegulationProperties = resp.Data;
      if (!this.IsCheckRegulationProperties) {
        if (this.regulationPropertiesModel.Id == undefined) {
          this.rmmapi.postData("RegulationProperties/AddCheckListRegulationProperty", { Name: this.regulationPropertiesModel.Name, ChecklistRegulationGroupId: this.regulationPropertiesModel.ChecklistRegulationGroupId, CreatedBy: this.userName }).toPromise().then((resp: any) => {
            if (resp && resp.Status) {
              this._notificationService.showSuccess("", "Checklist Regulation Property added successfully");
              this.GetRegulationProperties();
              this.modalReference.close();
            } else {
              this._notificationService.showError("", "Sorry, Checklist Regulation Property could not be added");
            }
          })
        } else {
          this.rmmapi.postData("RegulationProperties/UpdateCheckListRegulationProperty", { Id: this.regulationPropertiesModel.Id, Name: this.regulationPropertiesModel.Name, ChecklistRegulationGroupId: this.regulationPropertiesModel.ChecklistRegulationGroupId, UpdatedBy: this.userName }).toPromise().then((resp: any) => {
            if (resp && resp.Status) {
              this._notificationService.showSuccess("", "Checklist Regulation Property updated successfully");
              this.GetRegulationProperties();
              this.modalReference.close();
            } else {
              this._notificationService.showError("", "Sorry, Checklist Regulation Property could not be updated");
            }
          })
        }
      }
    })
  }
  }
  EditRegulationPropertiesInfo(value1: any, value2: any) {
    this.actionType = false;
    this.GetRegulationGroups();
    this.IsCheckRegulationProperties = false;
    this.regulationPropertiesModel.Id = value2.Id
    this.regulationPropertiesModel.Name = value2.Name;
    this.regulationPropertiesModel.ChecklistRegulationGroupId = value2.ChecklistRegulationGroupId;
    this.regulationPropertiesModel.ChecklistRegulationGroupName=value2.ChecklistRegulationGroupName;
    this.modalReference = this.modalService.open(value1, { size: 'lg' });
    
  }
  InActiveModalInfo(value1: any, value2: any) {
    this.regulationPropertiesModel.Id = value2.Id;
    this.regulationPropertiesModel.Name = value2.Name;
    this.modalReference = this.modalService.open(value1,{size:'sm'});
  }
  DeleteRegulationPropertiesInfo() {
    this.rmmapi.postData("RegulationProperties/DeleteChecklistRegulationProperty", { Id: this.regulationPropertiesModel.Id, UpdatedBy: this.userName }).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetRegulationProperties();
          this.modalReference.close();
          this._notificationService.showSuccess("", "Checklist Regulation Property inactivated successfully");
        } else {
          this.modalReference.close();
          this._notificationService.showWarning("", "Sorry, this Checklist Regulation Property could not be inactivated because it is referred by another active item");
        }
      } else {
        this._notificationService.showError("", "Error: unable to inactivate the Checklist Regulation Property");
      }
    })
  }
  IsCheckRegulationPropertiesInfo() {
    let params = new HttpParams().set("Name",this.regulationPropertiesModel.Name.trim()).set("Id", (this.regulationPropertiesModel.Id ? this.regulationPropertiesModel.Id : 0));
    this.rmmapi.getData("RegulationProperties/CheckDuplicateCheckListRegulationProperty",params).toPromise().then((resp: any) => {
      this.IsCheckRegulationProperties = resp.Data;
    })
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
