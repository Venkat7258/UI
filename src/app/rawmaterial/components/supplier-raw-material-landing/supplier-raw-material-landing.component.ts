import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { PaginationDefalts, PrivilegCodes, SearchFilter } from 'src/app/shared/constants/global.constants';

import { EnvService } from 'src/app/shared/services/env.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { AppService } from '../../../app.service';
import { SupplierRawMaterialDetails } from '../../models/supplier-raw-material-details';

import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';

@Component({
  selector: 'app-supplier-raw-material-landing',
  templateUrl: './supplier-raw-material-landing.component.html',
  styleUrls: ['./supplier-raw-material-landing.component.css']
})
export class SupplierRawMaterialLandingComponent implements OnInit {

  public rawMaterialDetailsInfo: GridDataResult;
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  sort: SortDescriptor[] = [{ field: 'RawMaterialName', dir: 'asc' }];
  searchFilter: SearchFilter = new SearchFilter();
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  rawMaterialModel: any = new SupplierRawMaterialDetails();
  AllSuppliersInfo: any[] = [];
  AllManufacturersInfo: any[] = [];
  AllFunctionsInfo: any[] = [];
  AllRawMaterialsInfo: any[] = [];
  allStatusInfo: any[] = [];
  IsCheckRawMaterial: boolean = false;
  ShowInactiveRawMaterial: boolean = false;
  AccessToVRM = true;
  AccessToIRM = true;
  AccessToMRM = true;
  actionType = true;
  public supplierDefaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  public manufacturerDefaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  public functionsDefaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  public rawMaterialsDefaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  userName: any = "";
  constructor(public router: Router, public _notificationService: NotificationService, public env: EnvService, public _appService: AppService, public rmmapi: RMMApiService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.userName = this.rmmapi.getUserName();
    //this.router.navigate(['../RawMaterialDetails']);
    this.setDefaults();
    this._appService.setHeaderUserName(this.rmmapi.getUserName());
    this._appService.setHeaderShow(true);
    this._appService.setHeaderTitle("Raw Materials");
    let rawMaterialId = parseInt(this.rmmapi.getStorage(this.env.CurrentTabState.Id));
    let sessionTab = this.rmmapi.getStorage(this.env.CurrentTabState.TabName);

    if (rawMaterialId !== undefined && rawMaterialId !== NaN && sessionTab !== undefined) {
      // this.IsFormulation = false;
      this._appService.supplierRawMaterialId = rawMaterialId
    }
    if (this._appService.supplierRawMaterialId) {
      this.EditRawMaterialInfo("", { Id: this._appService.supplierRawMaterialId });
    }
    else {
      this.searchFilter.sortAscending = 1;
      this.searchFilter.sortExpression = 'RawMaterialName';
      this.GetRawMaterialDetails();
      this.GetSuppliers();
      this.GetManufacturers();
      this.GetFunctions();
      this.GetRawMaterials();
      this.GetStatus();
      this.AccessToVRM = this.rmmapi.getRolePrivilege(PrivilegCodes.VRM).toString() === 'true' ? true : false;
      this.AccessToMRM = this.rmmapi.getRolePrivilege(PrivilegCodes.MRM).toString() === 'true' ? true : false;
      this.AccessToIRM = this.rmmapi.getRolePrivilege(PrivilegCodes.IRM).toString() === 'true' ? true : false;
    }
    
  }
  GetRawMaterialDetails() {
    let params = new HttpParams()
      .set("PageSize", this.searchFilter.pageSize.toString())
      .set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("SortExpression", this.searchFilter.sortExpression)
      .set("SortAscending", this.searchFilter.sortAscending.toString())
      .set("id", "0")
      .set("type", "type")
      .set("InActive", (this.ShowInactiveRawMaterial ? 1 : 0).toString());

    this.rmmapi.getData("SupplierRawMaterialDetails/GetSupplierRawMaterialDetails", params).toPromise().then((resp: any) => {
      this.rawMaterialDetailsInfo = {
        data: resp.Data.Data.slice((this.searchFilter.pageNumber * this.searchFilter.pageSize - this.searchFilter.pageSize), this.searchFilter.pageNumber * this.searchFilter.pageSize),
        total: resp.Data.TotalRecords
      };
    });
  }

  public showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;
    if ((element.nodeName === 'TD' || element.nodeName === 'TH' || element.nodeName === 'SPAN')
      && element.offsetWidth < element.scrollWidth) {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }
  GetStatus() {
    this.rmmapi.getData("Status/GetStatus").toPromise().then((res: any) => {
      this.allStatusInfo = res.Data;
    });
  }

  GetRawMaterialFunctionsBySupplierRawMaterialDetailId(id) {
    this.rmmapi.postData("SupplierRawMaterialDetails/GetRawMaterialFunctionsBySupplierRawMaterialDetailId", { Id: id }).toPromise().then((resp: any) => {
      this.rawMaterialModel.RawMaterialFunctions = resp.Data;
    })
  }
  GetSuppliers() {
    this.rmmapi.getData("Suppliers/GetSuppliers").toPromise().then((resp: any) => {
      this.AllSuppliersInfo = resp.Data;
    });
  }
  GetManufacturers() {
    this.rmmapi.getData("Manufacturers/GetManufacturers").toPromise().then((resp: any) => {
      this.AllManufacturersInfo = resp.Data;
    })
  }
  GetFunctions() {
    this.rmmapi.getData("RawMaterialFunctions/GetRawMaterialFunctions").toPromise().then((resp: any) => {
      this.AllFunctionsInfo = resp.Data;
    })
  }
  GetRawMaterials() {
    this.rmmapi.getData("RawMaterials/GetRawMaterials", { sort: 'name' }).toPromise().then((resp: any) => {
      this.AllRawMaterialsInfo = [];
      this.AllRawMaterialsInfo = resp.Data;
      this.AllRawMaterialsInfo.forEach(element => {
        element.Name = element.Name + " (" + element.Code + ")";
      });
    })
  }
  RawMaterialModal(content) {
    this.actionType = true;
    this.IsCheckRawMaterial = false;
    this.rawMaterialModel = new SupplierRawMaterialDetails();
    this.modalReference = this.modalService.open(content, { size: 'xl' });
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
  AddRawMaterialInfo(form) {
    let params = new HttpParams().set("Name", this.rawMaterialModel.TradeName)
      .set("rawMaterialId", this.rawMaterialModel.RawMaterialId)
      .set("supplierId", this.rawMaterialModel.SupplierId)
      .set("manufacturerId", this.rawMaterialModel.ManufacturerId)
      .set("Id", (this.rawMaterialModel.Id ? this.rawMaterialModel.Id : 0))
      .set('Userid', this.rmmapi.getUserId());
    this.rmmapi.getData("SupplierRawMaterialDetails/CheckDuplicateSupplierRawMaterialDetails", params).toPromise().then((resp: any) => {
      this.IsCheckRawMaterial = resp.Data;
      if (!this.IsCheckRawMaterial) {
        if (this.rawMaterialModel.Id == undefined) {
          if (!this.IsCheckRawMaterial) {
            this.rawMaterialModel.CreatedBy = this.userName;
            this.rawMaterialModel.CreatedDate = new Date();
            this.rawMaterialModel.StatusId = this.allStatusInfo.filter(item => item.Code == "RSN")[0].Id;
            this.rawMaterialModel.StatusName = this.allStatusInfo.filter(item => item.Code == "RSN")[0].Name;
            this.rawMaterialModel.SupplierName = this.AllSuppliersInfo.filter(x => x.Id == this.rawMaterialModel.SupplierId)[0].Name;
            this.rawMaterialModel.ManufacturerName = this.AllManufacturersInfo.filter(x => x.Id == this.rawMaterialModel.ManufacturerId)[0].Name;
            this.rawMaterialModel.RawMaterialFunctionName = "";
            this.rawMaterialModel.RawMaterialFunctions.forEach(element => {
              this.rawMaterialModel.RawMaterialFunctionName = this.rawMaterialModel.RawMaterialFunctionName + (this.rawMaterialModel.RawMaterialFunctionName == "" ? "" : ",") + element.Name;
            });
            this.rawMaterialModel.RawMaterialName = this.AllRawMaterialsInfo.filter(x => x.Id == this.rawMaterialModel.RawMaterialId)[0].Name;
            this.router.navigate(['RawMaterialDetails', { data: JSON.stringify(this.rawMaterialModel) }], { skipLocationChange: true });//,{ skipLocationChange: true}
            this.modalReference.close();
          }
        }
        else {
          this.rawMaterialModel.SupplierName = this.AllSuppliersInfo.filter(x => x.Id == this.rawMaterialModel.SupplierId)[0].Name;
          this.rawMaterialModel.ManufacturerName = this.AllManufacturersInfo.filter(x => x.Id == this.rawMaterialModel.ManufacturerId)[0].Name;
          this.rawMaterialModel.RawMaterialName = this.AllRawMaterialsInfo.filter(x => x.Id == this.rawMaterialModel.RawMaterialId)[0].Name;
          this.router.navigate(['RawMaterialDetails', { data: JSON.stringify(this.rawMaterialModel) }], { skipLocationChange: true });//,{ skipLocationChange: true}
          this.modalReference.close();
        }
      }
    });
  }
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  EditRawMaterialInfo(value1: any, value2: any) {
    this.actionType = false;
    this.IsCheckRawMaterial = false;
    this.rawMaterialModel = value2;

    this.rmmapi.postData("SupplierRawMaterialDetails/GetRawMaterialFunctionsBySupplierRawMaterialDetailId", { Id: value2.Id }).toPromise()
      .then((resp: any) => {
        this.rawMaterialModel.RawMaterialFunctions = resp.Data;
        this._appService.supplierRawMaterialId = this.rawMaterialModel.Id;
        this.rmmapi.setStorage(this.env.CurrentTabState.Id, this.rawMaterialModel.Id);

        let tabName = this.rmmapi.getStorage(this.env.CurrentTabState.TabName)


        this.rmmapi.setStorage(this.env.CurrentTabState.TabName, tabName == undefined ? 'General Details' : tabName);
        this.router.navigate(['RawMaterialDetails', { data: JSON.stringify(this.rawMaterialModel) }], { skipLocationChange: true });
      })
  }
  InActiveModalInfo(value1: any, value2: any) {
    this.rawMaterialModel.Id = value2.Id;
    this.rawMaterialModel.TradeName = value2.TradeName;
    this.modalReference = this.modalService.open(value1, { size: 'sm' });
  }
  // DeleteRawMaterialInfo
  ManageSupplierRawMaterialDetailsStatus(actionType: string) {
    this.rmmapi.postData("SupplierRawMaterialDetails/ManageSupplierRawMaterialDetailsStatus", {
      Id: this.rawMaterialModel.Id,
      UpdatedBy: this.userName, actionType: actionType
    }).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetRawMaterialDetails();
          this.modalReference.close();

          // this._notificationService.showSuccess("", this.rawMaterialModel.TradeName + resp.Message);
          if(actionType=="reactive")
          {
            this._notificationService.showSuccess("", "Raw Material reactivated successfully");
          }
          else
          {
          this._notificationService.showSuccess("", "Raw Material inactivated successfully");
          }
        } else {
          this.modalReference.close();
          this._notificationService.showWarning("", this.rawMaterialModel.TradeName + resp.Message);
        }
      } else {
        // this._notificationService.showError("", resp.Message);
        this._notificationService.showError("", "Sorry, this Raw Material could not be inactivated");
        this.modalReference.close();
      }
    })
  }

  IsCheckRawMaterialInfo() {

    if (this.rawMaterialModel.RawMaterialId != undefined && this.rawMaterialModel.SupplierId != undefined && this.rawMaterialModel.ManufacturerId != undefined && this.rawMaterialModel.TradeName != undefined) {
      let params = new HttpParams().set("Name", this.rawMaterialModel.TradeName).set("rawMaterialId", this.rawMaterialModel.RawMaterialId).set("supplierId", this.rawMaterialModel.SupplierId).set("manufacturerId", this.rawMaterialModel.ManufacturerId).set("Id", (this.rawMaterialModel.Id ? this.rawMaterialModel.Id : 0));
      this.rmmapi.getData("SupplierRawMaterialDetails/CheckDuplicateSupplierRawMaterialDetails", params).toPromise().then((resp: any) => {
        this.IsCheckRawMaterial = resp.Data;
      })
    }
  }
  ShowInactiveRawMaterials(event) {
    
    this.searchFilter.pageSize = 10;
    this.searchFilter.pageNumber = 1;
    this.searchFilter.sort = '';

    this.ShowInactiveRawMaterial = !this.ShowInactiveRawMaterial;
    this.GetRawMaterialDetails();
  }
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "RawMaterialName asc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }

  sortChange(sort: SortDescriptor[]): void {
    // console.log(sort);
    this.sort = sort;
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "RawMaterialName asc";
    this.searchFilter.sortExpression = sort[0].dir != undefined ? sort[0].field : "RawMaterialName";
    this.searchFilter.sortAscending = sort[0].dir != undefined ? (sort[0].dir === 'desc' ? 0 : 1) : 0;
    this.GetRawMaterialDetails();
  }
  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber = event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetRawMaterialDetails();
  }
}