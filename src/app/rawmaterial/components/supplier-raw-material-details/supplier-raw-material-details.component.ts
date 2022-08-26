import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PaginationDefalts, PrivilegCodes, SearchFilter } from 'src/app/shared/constants/global.constants';
import { EnvService } from 'src/app/shared/services/env.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { AppService } from '../../../app.service';
import { SupplierRawMaterialDetails } from '../../models/supplier-raw-material-details';

@Component({
  selector: 'app-supplier-raw-material-details',
  templateUrl: './supplier-raw-material-details.component.html',
  styleUrls: ['./supplier-raw-material-details.component.css']
})
export class SupplierRawMaterialDetailsComponent implements OnInit {
  searchFilter: SearchFilter = new SearchFilter();
  rawMaterialModel: any = new SupplierRawMaterialDetails();
  moduleName: string = "General Details";
  rawMaterialFunctionName: any = "";
  isNanomaterialPresent: boolean = false;
  actionType: boolean = true;
  allIsNanoMaterial: any[] = [{
    Name: "Yes",
    Id: true,
  }, {
    Name: "No",
    Id: false,
  }]
  substanceanSVHC: any[] = [{
    Name: "Yes",
    Id: "Yes",
  }, {
    Name: "No",
    Id: "No",
  }
    , {
    Name: "Not Applicable",
    Id: "Not Applicable",
  }
  ]
  public defaultItem: { Name: string; Id: string } = {
    Name: "-- Select --",
    Id: '',
  };
  public countriesDefaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  public marketsDefaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };

  AllCountries: any[] = [];
  AllMarkets: any[] = [];
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  userName: any = "";
  AccessToMRM = true;
  nonmarketsId: any;

  constructor(public router: Router,public _appService: AppService, private route: ActivatedRoute, public _notificationService: NotificationService, public env: EnvService, public rmmapi: RMMApiService, private modalService: NgbModal) { }
  ngOnInit(): void {
    this.userName = this.rmmapi.getUserName();
    this._appService.setHeaderShow(true);
    this._appService.setHeaderTitle("Raw Material");
    this.rawMaterialModel.RawMaterialFunctions = [];
    this.rawMaterialModel = JSON.parse(this.route.snapshot.params.data);
    
    this.nonmarketsId = this.rawMaterialModel.NanoMaterialMarketId;
    if (this.rawMaterialModel.Id == undefined)
      this.actionType = true;
    else
      this.actionType = false;
    this.GetAllCountries();
    this.GetAllMarkets();
    this.setDefaults();
    if (this._appService.supplierRawMaterialId) {
      this.rawMaterialModel.Id = this._appService.supplierRawMaterialId;
      let tabName = this.rmmapi.getStorage(this.env.CurrentTabState.TabName)
      this.Tabchange(  tabName === undefined ?  'General Details' : tabName);
    }
    this.AccessToMRM = this.rmmapi.getRolePrivilege(PrivilegCodes.MRM).toString() === 'true' ? true : false;


  }
  GetAllCountries() {
    this.rmmapi.getData("Countries/GetCountries").toPromise().then((res: any) => {
      if (res && res.Data) {
        this.AllCountries = res.Data;
      }
    });
  }
  OnNanomaterialPresentChange(event) {

    if (event) {
      this.isNanomaterialPresent = true;
      this.rawMaterialModel.NanoMaterialMarketId = this.nonmarketsId;
    }
    else {
      this.isNanomaterialPresent = false;
      this.rawMaterialModel.CountryId = null;
      this.rawMaterialModel.NanoMaterialMarketId = null;
    }
  }
  GetAllMarkets() {
    this.rmmapi.getData("Markets/GetMarkets").toPromise().then((res: any) => {
      if (res && res.Data) {
        this.AllMarkets = res.Data;
      }
    });
  }
  AddSupplierRawMaterialDetailsInfo() {
    this.rawMaterialModel.TradeName = this.rawMaterialModel.TradeName;
    this.rawMaterialModel.OnlyRepresentativeDetails = this.rawMaterialModel.OnlyRepresentativeDetails;
    this.rawMaterialModel.REAChNumberOrStatus = this.rawMaterialModel.REAChNumberOrStatus;
    if (this.rawMaterialModel.Id == undefined) {   
      this.rawMaterialModel.CreatedBy = this.userName;
      this.rawMaterialModel.UpdatedBy = this.userName;
      this.rmmapi.postData("SupplierRawMaterialDetails/AddSupplierRawMaterialDetails", this.rawMaterialModel).toPromise().then((resp: any) => {
        if (resp && resp.Status) {
          this.actionType = false;
          this._notificationService.showSuccess("", "Raw Material Detail added successfully");
          this.rawMaterialModel.Id = resp.Data;
          this.GetRawMaterialDetailById(resp.Data);
          this.modalReference.close();
        } else {
          // this._notificationService.showError("", resp.Message);
          this._notificationService.showError("", "Sorry, Supplier Raw Material could not be added");
        }
      })
    } else {
      this.rawMaterialModel.UpdatedBy = this.userName;
      this.rawMaterialModel.UpdatedDate = new Date();
      this.rmmapi.postData("SupplierRawMaterialDetails/UpdateSupplierRawMaterialDetails", this.rawMaterialModel).toPromise().then((resp: any) => {
        if (resp && resp.Status) {
          this._notificationService.showSuccess("", "General Details updated successfully");
          //   this.modalReference.close();
        } else {
          //this._notificationService.showError("", resp.Message);
          this._notificationService.showError("","Sorry, General details could not be updated");
        }
      })
    }
  }
  Tabchange(tabname: string) {
    this.moduleName = tabname;
    this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
    this.rmmapi.setStorage(this.env.CurrentTabState.TabName, tabname);

    if (tabname === "General Details" && this.rawMaterialModel.Id > 0) {
      this.GetRawMaterialDetailById(this.rawMaterialModel.Id);
    }
  }

  GetRawMaterialDetailById(id: number) {
    let params = new HttpParams()
      .set("PageSize", "0")
      .set("PageNumber", "0")
      .set("SortExpression", "")
      .set("SortAscending", "1")
      .set("id", id.toString())
      .set("type", "type")
      .set("InActive", (0).toString());
    this.rmmapi.getData("SupplierRawMaterialDetails/GetSupplierRawMaterialDetails", params).toPromise().then((resp: any) => {
      if (resp && resp.Status && resp.Data.Data != undefined && resp.Data.Data.length > 0) {
        this.rawMaterialModel = resp.Data.Data[0];
      }
    })
  }
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "Id Desc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }
  redirectGridPage()
  {
    this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
    this.rmmapi.removeStorage(this.env.CurrentTabState.Id);
    this._appService.supplierRawMaterialId = undefined;
    this.router.navigate(['RawMaterials']);
  }
}


