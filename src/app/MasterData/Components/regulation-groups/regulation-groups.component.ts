import { HttpParams } from '@angular/common/http';
import { Component, OnInit,ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { RegulationGroups } from '../../Models/regulation-groups';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { NgForm } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
@Component({
  selector: 'app-regulationgroups',
  templateUrl: './regulation-groups.component.html',
  styleUrls: ['./regulation-groups.component.css']
})
export class RegulationGroupsComponent implements OnInit {
  public regulationsinfo: any[] = [];
  public regulationList:GridDataResult;
  searchFilter : SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [ { field: 'Name', dir: 'asc'}];
  public type = "numeric";
  public position = "bottom";
  productsList: any;
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  isCheckRegulationGroup: boolean = false;
 
  regulationGroupsModel: any = new RegulationGroups();
  actionType:boolean=true;
 
  public AllMarkets: any[] = [];
  public defaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  userName: any = "";
  constructor(public _notificationService:NotificationService, public env: EnvService, public _appService: AppService, public rmmapi: RMMApiService, private modalService: NgbModal) { 
    
  }
  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetRegulationGroups();
    this.GetAllMarkets();
    
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
    this.GetRegulationGroups();
 }
 sortChange(sort: SortDescriptor[]): void {
  this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
  this.sort = sort;  
  this.GetRegulationGroups();
}
  GetRegulationGroups() {
    let params = new HttpParams().set("PageSize",this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
    .set("Sort",this.searchFilter.sort);
    this.rmmapi.getData("RegulationGroups/GetAllCheckListRegulationGroups",params).toPromise().then((resp: any) => {
      this.regulationsinfo = resp.Data;
      this.regulationList = {
        data: resp.Data.RegulationGroupDetailList,
        total: resp.Data.RegulationGroupDetailList && resp.Data.RegulationGroupDetailList.length > 0 ? resp.Data.RegulationGroupDetailList[0].TotalRecords : 0
    };
    })
  }
  
  RegulationGroupsModal(content) {
    this.isCheckRegulationGroup=false;
    this.actionType=true;
    this.regulationGroupsModel = new RegulationGroups();
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
  AddRegulationGroupsInfo() {
  if(this.regulationGroupsModel.Name.trim()!=''&& this.isCheckRegulationGroup==false)
  {
    let params = new HttpParams().set("Name",this.regulationGroupsModel.Name).set("Id", (this.regulationGroupsModel.Id ? this.regulationGroupsModel.Id : 0));
    this.rmmapi.getData("RegulationGroups/CheckDuplicateCheckListRegulationGroup", params).toPromise().then((resp: any) => {
      this.isCheckRegulationGroup = resp.Data;
      if (!this.isCheckRegulationGroup) {
        if (this.regulationGroupsModel.Id == undefined) {
          this.rmmapi.postData("RegulationGroups/AddCheckListRegulationGroup", { Name: this.regulationGroupsModel.Name, ApplicableMarketId: this.regulationGroupsModel.ApplicableMarketId, CreatedBy: this.userName }).toPromise().then((resp: any) => {
            if (resp && resp.Status) {
              this._notificationService.showSuccess("", "Checklist Regulation Group added successfully");
              this.GetRegulationGroups();
              this.modalReference.close();
            } else {
              this._notificationService.showError("", "Sorry, Checklist Regulation Group could not be added");
            }
          })
        } else {
          this.rmmapi.postData("RegulationGroups/UpdateCheckListRegulationGroup", { Id: this.regulationGroupsModel.Id, Name: this.regulationGroupsModel.Name, ApplicableMarketId: this.regulationGroupsModel.ApplicableMarketId, UpdatedBy: this.userName }).toPromise().then((resp: any) => {
            if (resp && resp.Status) {
              this._notificationService.showSuccess("", "Checklist Regulation Group updated successfully");
              this.GetRegulationGroups();
              this.modalReference.close();
            } else {
              this._notificationService.showError("", "Sorry, Checklist Regulation Group could not be updated");
            }
          })
        }
      }
    });
  }
  }
  EditRegulationGroupsInfo(value1: any, value2: any) {  
   
   this.actionType=false; 
    this.isCheckRegulationGroup=false;
    this.regulationGroupsModel.Id = value2.Id
    this.regulationGroupsModel.Name = value2.Name;
    this.regulationGroupsModel.ApplicableMarketId = value2.ApplicableMarketId;
    this.modalReference = this.modalService.open(value1,{size:'lg'});
   
  }
  InActiveModalInfo(value1: any, value2: any) {
    this.regulationGroupsModel.Id = value2.Id
    this.regulationGroupsModel.Name = value2.Name;
    this.regulationGroupsModel.ApplicableMarket = value2.ApplicableMarket;
    this.modalReference = this.modalService.open(value1,{size:'sm'});
  }

  DeleteRegulationGroupsInfo() {
    this.rmmapi.postData("RegulationGroups/DeleteCheckListRegulationGroup", { Id: this.regulationGroupsModel.Id, UpdatedBy: this.userName }).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetRegulationGroups();
          this.modalReference.close();
          this._notificationService.showSuccess("", "Checklist Regulation Group inactivated successfully");
        } else {
          this.modalReference.close();
          this._notificationService.showWarning("", "Sorry, this Checklist Regulation Group could not be inactivated because it is referred by another active item");
        }
      } else {
        this._notificationService.showError("","Error: unable to inactivate the Checklist Regulation Group");
      }
    })
  }
  IsCheckRegulationGroupsInfo() {
    let params = new HttpParams().set("Name",this.regulationGroupsModel.Name.trim()).set("Id", (this.regulationGroupsModel.Id ? this.regulationGroupsModel.Id : 0));
    this.rmmapi.getData("RegulationGroups/CheckDuplicateCheckListRegulationGroup", params).toPromise().then((resp: any) => {
      this.isCheckRegulationGroup = resp.Data;
    })
  }
  GetAllMarkets() {
    this.rmmapi.getData("Markets/GetMarkets").toPromise().then((res: any) => {
         this.AllMarkets = res.Data;  
    });
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
