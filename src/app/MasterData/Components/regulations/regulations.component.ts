import { Component, OnInit,ViewChild } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Regulations } from '../../models/regulations';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../shared/services/notification.service';
import { HttpParams } from '@angular/common/http';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { EnvService } from 'src/app/shared/services/env.service';
@Component({
  selector: 'app-regulations',
  templateUrl: './regulations.component.html',
  styleUrls: ['./regulations.component.css']
})
export class RegulationsComponent implements OnInit {

  public regulationList: GridDataResult;
  model: any = new Regulations();
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  RegulationName : string;
  Market : number;
  Region : number;
  allMarkets: any;
  allRegions: any = [];
  regulationsform: any;
  formTitle : string = "Add Regulation";
  buttonName : string = "Save";
  searchFilter : SearchFilter = new SearchFilter();
  public defaultItem: { Name: string; Id: number } = { Name: "-- Select --", Id: null};
  moduleName: any = "Regulations"  
  moduleNameBreadCum = "Regulations" ;
  public sort: SortDescriptor[] = [ { field: 'Name', dir: 'asc'}];
  constructor(public _appService: AppService,
    public rmmapi: RMMApiService,
    private _modalService: NgbModal,
    private _notifyService: NotificationService,
    public env : EnvService) {
    this.regulationsform = new FormGroup({
      name: new FormControl("", Validators.required),
      marketId: new FormControl(""),
      regionId: new FormControl(""),
    });
  }



  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetMarkets();
    this.GetRegulations();
    const sessionTab = this.rmmapi.getStorage(this.env.CurrentTabState.TabName);
    if (sessionTab !== undefined && sessionTab !== 'undefined' && sessionTab !== null) {
      const tempSubMenuArray = [
        'Regulations',
        'ChecklistRegulationGroups','ChecklistRegulationProperties','PropertyValueTypes','PropertyValueTypeOptions']
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
    this.searchFilter.pageNumber =   event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetRegulations();
 }

  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
    this.sort = sort;  
    this.GetRegulations();
  }

  GetRegulations() {
    let params = new HttpParams().set("PageSize",this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
                  .set("Sort",this.searchFilter.sort);
    this.rmmapi.getData("Regulations/GetRegulations", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        //this.regulationList = res.Data.RegulationList;
        this.regulationList = {
          data: res.Data.RegulationList,
          total: res.Data.RegulationList && res.Data.RegulationList.length > 0 ? res.Data.RegulationList[0].TotalRecords : 0
      };
      }
    });
  }

  OpenRegulationPopup(content) {
    this.regulationsform.markAsUntouched();
    this.formTitle = "Add Regulation";
    this.buttonName = "Save";
    this.isDuplicateRegulation = false;
    this.regulationExists = "";
    this.resetControls();
    this.model = new Regulations();
    this.GetRegulations();
    this.GetMarkets();
    this.modalReference = this._modalService.open(content,{size:'lg'});
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.GetDismissReason(reason)}`;
    });
  }

  GetMarkets() {
    this.rmmapi.getData("Markets/GetMarkets").toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.allMarkets = res.Data;

      }
    });
  }


  GetDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  SaveRegulation() {
    
    this.regulationsform.submitted = true;
    this.model.MarketId = (this.model.MarketId === null || this.model.MarketId === "" || this.model.MarketId === undefined) ? 0 : this.model.MarketId;
    this.model.RegionId = (this.model.RegionId === null || this.model.RegionId === "" || this.model.RegionId === undefined) ? 0 : this.model.RegionId; 
    if (this.regulationsform.valid && this.model.Name!='') {
      this.model.Name=this.model.Name;
      if (this.model.Id > 0) {
        this.model.UpdatedBy = this.rmmapi.getUserName();
        this.model.UpdatedDate = new Date();
        this.rmmapi.postData("Regulations/UpdateRegulation", this.model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this._notifyService.showSuccess("", "Regulation updated successfully");
            this.GetRegulations();
            this.modalReference.close();
          } else {
            this._notifyService.showError("", "Sorry, Regulation could not be updated");
          }
          this.regulationsform.submitted = false;
        });
      }
      else {
        this.model.CreatedBy = this.rmmapi.getUserName();;
        this.model.CreatedDate = new Date();
        this.rmmapi.postData("Regulations/AddRegulation", this.model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this._notifyService.showSuccess("", "Regulation added successfully");
            this.GetRegulations();
            this.modalReference.close();
          } else {
            this._notifyService.showError("", "Sorry, Regulation could not be added");
          }
          this.regulationsform.submitted = false;
        });
      }
    } else {
      this.regulationsform.markAllAsTouched();
    }
  }

  EditRegulation(value1: any, value2: any) {
    if(this.rmmapi.getRolePrivilege('VRE') && this.rmmapi.getRolePrivilege('MRE'))
    {
    this.formTitle = "Edit Regulation";
    this.buttonName = "Update";
    this.isDuplicateRegulation = false;
    this.regulationExists = "";
    this.model.MarketId=0;
    this.model.Id = value2.Id
    this.model.Name = value2.Name;
    this.model.RegionId = value2.RegionId;
    this.model.MarketId = value2.MarketId;
    this.OnMarketChange(value2.MarketId);
    this.modalReference = this._modalService.open(value1,{size:'lg'});
    }
    else{
      this.regulationsform.controls["name"].disable();
      this.regulationsform.controls["regionId"].disable();
      this.regulationsform.controls["marketId"].disable();
      this.formTitle = "Edit Regulation";
    this.buttonName = "Update";
    this.isDuplicateRegulation = false;
    this.regulationExists = "";
    this.GetMarkets();
    this.model.Id = value2.Id
    this.model.Name = value2.Name;
    this.model.RegionId = value2.RegionId;
    this.model.MarketId = value2.MarketId;
    this.OnMarketChange(value2.MarketId);
    this.modalReference = this._modalService.open(value1,{size:'lg'});
    }
  }

  InActiveModalInfo(value1 : any, value2 : any) {
    this.model.Id = value2.Id
    this.model.Name = value2.Name;
    this.model.RegionId = value2.RegionId;
    this.model.MarketId = value2.MarketId;
    this.modalReference = this._modalService.open(value1, {size:'sm'});
  }

  DeleteRegulation() {
    this.model.UpdatedBy = "";
    this.model.UpdatedDate = new Date();
    this.rmmapi.postData("Regulations/DeleteRegulation", this.model).toPromise().then((resp: any) => {
      this.modalReference.close();
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetRegulations();
          this._notifyService.showSuccess("", "Regulation inactivated successfully");
        } else {
          this._notifyService.showWarning("","Sorry, this Regulation could not be inactivated because it is referred by another active item");
        }
      } else {
        this._notifyService.showError("", "Error: unable to inactivate the Regulation");
      }
    });
  }

  isDuplicateRegulation: boolean = false;
  regulationExists: string = "";
  CheckDuplicate() {
    if(this.model.Name.trim().length==0)
    {
      this.model.Name='';
      return;
    }
    let params = new HttpParams().set("Name",this.model.Name.trim()).set("Id", (this.model.Id ? this.model.Id : 0));
    this.rmmapi.getData("Regulations/CheckDuplicateRegulation", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data == false) {
        this.isDuplicateRegulation = true;
        this.regulationExists = this.env.ValidationMessages.Thisvaluealreadyexists;
        this.regulationsform.controls["name"].setErrors({ 'incorrect': true });
      } else {
        this.isDuplicateRegulation = false;
        this.regulationExists = "";
        this.regulationsform.controls["name"].setErrors(null);
      }
    });
  }

  OnMarketChange(event: any) {
    if (event) {
      this.allRegions = this.allMarkets.filter(x => x.Id == event);
      this.model.RegionId = this.allRegions[0].RegionId;
    } else {
      this.allRegions = [];
      this.model.RegionId = null;
    }
  }

  tabchange(tabname) {
    this.moduleName = tabname;
    this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
    this.rmmapi.setStorage(this.env.CurrentTabState.TabName, tabname);

    if ('Regulations' === tabname) { this.moduleNameBreadCum = tabname;}
    else if ('ChecklistRegulationGroups' === tabname) { this.moduleNameBreadCum = 'Checklist Regulation Groups'; }
    else if ('ChecklistRegulationProperties' === tabname) { this.moduleNameBreadCum = 'Checklist Regulation Properties'; }
    else if ('PropertyValueTypes' === tabname) { this.moduleNameBreadCum = 'Property Value Types'; }
    else if ('PropertyValueTypeOptions' === tabname) { this.moduleNameBreadCum = 'Property Value Type Options'; }

  }

  resetControls() {
    this.regulationExists = "";
    this.isDuplicateRegulation = false;
   
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
