import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { NotificationService } from './../../../shared/services/notification.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { Market } from '../../Models/market';
import { MarketsService } from '../../Services/markets.service';
import { HttpParams } from '@angular/common/http';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { EnvService } from '../../../shared/services/env.service';

@Component({
  selector: 'app-markets',
  templateUrl: './markets.component.html',
  styleUrls: ['./markets.component.css']
})
export class MarketsComponent implements OnInit {
  public defaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  public marketsinfo: any[] = [];
  public marketsList: GridDataResult;
  public sort: SortDescriptor[] = [{ field: 'Name', dir: 'asc' }];
  public type = "numeric";
  public position = "bottom";
  isDuplicateMarket: boolean = false;
  countries: any = [];
  public CountriesData: any = [];
  Inactive: boolean = false;
  ModuleName: any = "Regions"
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  actionType: boolean = true;
  searchFilter: SearchFilter = new SearchFilter();
  marketExists: string;
  constructor(public rmmapi: RMMApiService, public _appService: AppService, private modalService: NgbModal, private notifyService: NotificationService,
    private env : EnvService) { }
  AllMarkets: any;
  Model: any = new Market();
  AllRegions: any = [];
  Marketform: any;
  submitted = false;
  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.Marketform = new FormGroup({
      MarketName: new FormControl("", Validators.required),
      HealthAuthority: new FormControl("", Validators.required),
      Region: new FormControl("", Validators.required),
      Countries: new FormControl("", Validators.required)
    });
    this.setDefaults();
    this.GetAllMarkets()
  
    const sessionTab = this.rmmapi.getStorage(this.env.CurrentTabState.TabName);
    if (sessionTab !== undefined && sessionTab !== 'undefined' && sessionTab !== null) {
      const tempSubMenuArray = [
        'Regions',
        'Countries',
        'Markets']
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
    this.searchFilter.pageNumber = event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetAllMarkets();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
    this.sort = sort;
    this.GetAllMarkets();
  }

  GetAllMarkets() {
    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort);
    this.rmmapi.getData("Markets/GetAllMarkets", params).toPromise().then((resp: any) => {
      this.marketsinfo = resp.Data;
      this.marketsList = {
        data: resp.Data.MarketsList,
        total: resp.Data.MarketsList && resp.Data.MarketsList.length > 0 ? resp.Data.MarketsList[0].TotalRecords : 0
      };
    })
  }
  AddMarket(content) {
    this.Marketform.reset();
    this.Marketform.submitted = false;
    this.Marketform.controls['Countries'].markAsUntouched()
    this.actionType = true;
    this.Model = new Market();
    this.Model.Id = 0;
    this.isDuplicateMarket = false;
    this.GetMarketRegions();

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
  GetMarketRegions() {

    this.rmmapi.getData("Markets/GetMarketRegions").toPromise().then((res: any) => {
      if (res && res.Data) {
        this.AllRegions = res.Data;
      }
    });
  }
  GetMarketCountries(marketid: any) {

    this.rmmapi.postData("Markets/GetMarketCountries", marketid).toPromise().then((res: any) => {
      if (res && res.Data) {
        this.Model.Countries = res.Data;
      }
    });
  }
  GetMarketCountriesByRegion(event) {
    this.CountriesData = [];
    this.Model.Countries = [];
    this.rmmapi.postData("Markets/GetCountriesByRegion", event).toPromise().then((res: any) => {
      if (res && res.Data) {
        this.CountriesData = res.Data;
      }
    });
  }
  SaveMarket(value) {


    this.Marketform.submitted = true;
    this.Marketform.controls['MarketName'].markAsTouched()
    this.Marketform.controls['Region'].markAsTouched()
    this.Marketform.controls['Countries'].markAsTouched()

    if (value.MarketName == undefined) {
      this.Marketform.controls['MarketName'].setErrors({ require: true });
    } else {
      this.Model.Name = this.Model.Name;
    }
    if (value.HealthAuthority == undefined) {
      this.Marketform.controls['HealthAuthority'].setErrors({ require: true });
    } else {
      this.Model.HealthAuthority = value.HealthAuthority != undefined ? value.HealthAuthority : '';
    }
    if (value.Region == undefined) {
      this.Marketform.controls['Region'].setErrors({ require: true });
    }

    if (this.Marketform.valid && this.Model.Name != '') {
      this.rmmapi.getData("Markets/CheckDuplicateMarket?markets=" + this.Model.Name
      +'&id='+(this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
        this.isDuplicateMarket = res.Data;
        if (!this.isDuplicateMarket) {
          this.Model.CreatedDate = new Date();
          this.Model.LoginId = "";
          if (this.Model.Id > 0) {
            this.rmmapi.postData("Markets/UpdateMarket", this.Model).toPromise().then((resp: any) => {
              this.notifyService.showSuccess("", "Market updated successfully")
          
              this.GetAllMarkets()
              this.modalReference.close();
              this.Marketform.submitted = false;
            });
          }
          else {
    
            this.rmmapi.postData("Markets/AddMarket", this.Model).toPromise().then((resp: any) => {
              this.notifyService.showSuccess("","Market added successfully")
         
              this.GetAllMarkets()
              this.modalReference.close();
              this.Marketform.submitted = false;
            });
          }
          
        }
        else{
          return false;
        }
      });
    } else {
     this.Marketform.markAllAsTouched();
    }
  }
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  MarketEdit(value1: any, value2: any) {
    if (this.rmmapi.getRolePrivilege('VM') && this.rmmapi.getRolePrivilege('MM')) {
      this.actionType = false;
      this.isDuplicateMarket = false;
      this.GetMarketRegions();
      this.GetMarketCountriesByRegion(value2.RegionId)
      this.GetMarketCountries(value2.Id);
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.Model.RegionID = value2.RegionId;
      this.Model.HealthAuthority = value2.HealthAuthority;
      this.modalReference = this.modalService.open(value1, { size: 'lg' });
    }
    else {
      this.Marketform.controls["MarketName"].disable();
      this.Marketform.controls["HealthAuthority"].disable();
      this.Marketform.controls["Region"].disable();
      this.Marketform.controls["Countries"].disable();
      this.actionType = false;
      this.isDuplicateMarket = false;
      this.GetMarketRegions();
      this.GetMarketCountriesByRegion(value2.RegionId)
      this.GetMarketCountries(value2.Id);
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.Model.RegionID = value2.RegionId;
      this.Model.HealthAuthority = value2.HealthAuthority;
      this.modalReference = this.modalService.open(value1, { size: 'lg' });
    }

  }
  DeleteMarket() {

    this.Model.UpdatedBy = this.rmmapi.getUserName();
    this.Model.UpdatedDate = new Date();
    this.rmmapi.postData("Markets/DeleteMarket", this.Model).toPromise().then((resp: any) => {

      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetAllMarkets()
          this.notifyService.showSuccess("", "Market inactivated successfully");

        } else {
          this.notifyService.showWarning("", "Sorry, this Market could not be inactivated because it is referred by another active item");
        }
      } else {
        this.notifyService.showError("", "Error: unable to inactivate the Market");
      }
      this.modalReference.close();
    });
  }
  InActiveModalInfo(value1: any, value2: any) {
    this.Model.Id = value2.Id
    this.Model.Name = value2.Name;
    this.modalReference = this.modalService.open(value1, { size: 'sm' });
  }
  tabchange(tabname) {
    this.ModuleName = tabname;
    this.rmmapi.setStorage(this.env.CurrentTabState.TabName, tabname);
  }
  MarketCountries(Content: any, Data: any) {
    this.countries = Data.split(',');
    this.modalReference = this.modalService.open(Content);
  }
  
  
  
  checkDuplicate() {
    
    var duplicate = this.Model.Name;
    if (this.Model.Name != undefined && this.Model.Name!="") {
      this.rmmapi.getData("Markets/CheckDuplicateMarket?markets=" + this.Model.Name 
      +'&id='+(this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
        this.isDuplicateMarket = res.Data;
        if (this.isDuplicateMarket) {
          this.marketExists = this.env.ValidationMessages.Thisvaluealreadyexists;
          this.Marketform.controls["MarketName"].setErrors({ 'incorrect': true });
        } else {
          this.marketExists = "";
          this.Marketform.controls["MarketName"].setErrors(null);
        }
      });


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
