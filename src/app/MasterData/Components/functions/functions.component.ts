import { HttpParams } from '@angular/common/http';
import { Component, OnInit,ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/app.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { RawMaterialFunctions } from '../../models/raw-material-functions';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
@Component({
  selector: 'app-functions',
  templateUrl: './functions.component.html',
  styleUrls: ['./functions.component.css']
})
export class FunctionsComponent implements OnInit {
  public rawmaterialfunctionsinfo: any[] = [];
  public rawmaterialfunctionsList:GridDataResult;
  searchFilter : SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [ { field: 'Name', dir: 'asc'}];
  public type = "numeric";
  public position = "bottom";
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  rawMaterialModel: any = new RawMaterialFunctions();
  isRawMaterialFunctions: boolean = false;
  moduleName: any = "RawMaterialFunctions";
  userName:any="";
  actionType:boolean=true;
  constructor(public _notificationService:NotificationService,private toastr: ToastrService, public env: EnvService, public _appService: AppService, public rmmapi: RMMApiService, private modalService: NgbModal) { }
  ngOnInit(): void {
    
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetRawMaterialFunctions();
    const sessionTab = this.rmmapi.getStorage(this.env.CurrentTabState.TabName);
    if (sessionTab !== undefined && sessionTab !== 'undefined' && sessionTab !== null) {
      const tempSubMenuArray = [
        'RawMaterialFunctions',
        'SubComponentFunctions' ]
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
    this.GetRawMaterialFunctions();
 }
 sortChange(sort: SortDescriptor[]): void {
  this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
  this.sort = sort;  
  this.GetRawMaterialFunctions();
}
  GetRawMaterialFunctions() {
    let params = new HttpParams().set("PageSize",this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
    .set("Sort",this.searchFilter.sort);
    this.rmmapi.getData("RawMaterialFunctions/GetAllRawMaterialFunctions",params).toPromise().then((resp: any) => {
     
      this.rawmaterialfunctionsinfo = resp.Data;
      this.rawmaterialfunctionsList = {
        data: resp.Data.RawMaterialFunctionsDetailsList,
        total: resp.Data.RawMaterialFunctionsDetailsList && resp.Data.RawMaterialFunctionsDetailsList.length > 0 ? resp.Data.RawMaterialFunctionsDetailsList[0].TotalRecords : 0
    };
    })
  }
  tabchange(tabname) {
    if (tabname == "RawMaterialFunctions") {
      this.moduleName = tabname;
      this.GetRawMaterialFunctions();
    }
    else {
      this.moduleName = tabname;
    }
    this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
    this.rmmapi.setStorage(this.env.CurrentTabState.TabName, tabname);
  }
  RawMaterialFunctionModal(content) {
    this.isRawMaterialFunctions=false;
    this.actionType=true;
    this.rawMaterialModel=new RawMaterialFunctions();
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
  AddRawMaterialFunctionInfo() {
    if(this.rawMaterialModel.Name.trim()!='')
    {
    let params = new HttpParams().set("Name",this.rawMaterialModel.Name.trim()).set("Id", (this.rawMaterialModel.Id ? this.rawMaterialModel.Id : 0));
    this.rmmapi.getData("RawMaterialFunctions/CheckDuplicateRawMaterialFunction", params).toPromise().then((resp: any) => {
      this.isRawMaterialFunctions = resp.Data;
      if (!this.isRawMaterialFunctions) {
        if (this.rawMaterialModel.Id == undefined) {
          this.rmmapi.postData("RawMaterialFunctions/AddRawMaterialFunction", { Name: this.rawMaterialModel.Name, CreatedBy: this.userName }).toPromise().then((resp: any) => {

            if (resp && resp.Status) {
              this._notificationService.showSuccess("","Raw Material Function added successfully");
              this.GetRawMaterialFunctions();
              this.modalReference.close();
            } else {
              this._notificationService.showError("", "Sorry, Raw Material Function could not be added");
            }
          })
        } else {
          this.rmmapi.postData("RawMaterialFunctions/UpdateRawMaterialFunction", { Id: this.rawMaterialModel.Id, Name: this.rawMaterialModel.Name, UpdatedBy: this.userName }).toPromise().then((resp: any) => {
            if (resp && resp.Status) {
             this._notificationService.showSuccess("", "Raw Material Function updated successfully");
              this.GetRawMaterialFunctions();
              this.modalReference.close();
            } else {
              this._notificationService.showError("", "Sorry, Raw Material Function could not be updated");
            }
          })
        }
      }
    });
  }
  }
  EditRawMaterialFunctionInfo(value1: any, value2: any) {
    if(this.rmmapi.getRolePrivilege('VRF') && this.rmmapi.getRolePrivilege('MRF'))
    {
    
    this.actionType=false;
    this.isRawMaterialFunctions=false;
    this.rawMaterialModel.Id = value2.Id
    this.rawMaterialModel.Name = value2.Name;
    this.modalReference = this.modalService.open(value1,{size:'lg'});
    }
    else{
      this.actionType=false;
      this.isRawMaterialFunctions=false;
      this.rawMaterialModel.Id = value2.Id
      this.rawMaterialModel.Name = value2.Name;
      this.modalReference = this.modalService.open(value1,{size:'lg'});
    }
  }
  DeleteRawMaterialFunctionInfo() {
    this.rmmapi.postData("RawMaterialFunctions/DeleteRawMaterialFunction", { Id: this.rawMaterialModel.Id, UpdatedBy: this.userName }).toPromise().then((resp: any) => {
      
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetRawMaterialFunctions();
          this.modalReference.close();
          this._notificationService.showSuccess("", "Raw Material Function inactivated successfully");
        } else {
          this.modalReference.close();
          this._notificationService.showWarning("", "Sorry, this Raw Material Function could not be inactivated because it is referred by another active item");
        }
      } else {
        this._notificationService.showError("", "Error: unable to inactivate the Raw Material Function");
      }
    })
  }
  CheckDuplicateRawMaterialFunctionInfo() {   
    
    let params = new HttpParams().set("Name",this.rawMaterialModel.Name.trim()).set("Id", (this.rawMaterialModel.Id ? this.rawMaterialModel.Id : 0));
    this.rmmapi.getData("RawMaterialFunctions/CheckDuplicateRawMaterialFunction", params).toPromise().then((resp: any) => {
      this.isRawMaterialFunctions = resp.Data;
    });    
  }

  InActiveModalInfo(value1: any, value2: any) {
    this.rawMaterialModel.Id = value2.Id
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
