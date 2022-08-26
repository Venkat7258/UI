import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from './../../../shared/services/notification.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { Countries } from '../../Models/countries';
import { CountriesService } from '../../Services/countries.service';
import { MarketsService } from '../../Services/markets.service';
import { HttpParams } from '@angular/common/http';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { EnvService } from '../../../shared/services/env.service';
import { isUndefined } from 'util';
@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css']
})
export class CountriesComponent implements OnInit {
  public defaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  public countriesinfo: any[] = [];
  public countriesList:GridDataResult;
  public sort: SortDescriptor[] = [ { field: 'Name', dir: 'asc'}];
  public type = "numeric";
  public position = "bottom";
  Inactive:boolean=false;
  submitted = false;
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  Countriesform:any;
  actionType:boolean=true;
 
  constructor(public rmmapi: RMMApiService,public _restApi:CountriesService, public _restMarketApi: MarketsService,private modalService: NgbModal,private notifyService : NotificationService,
    public env : EnvService) { }
  AllCountries:any=[];
  AllRegions:any=[];
  Model=new Countries();
  isDuplicateCountry:boolean=false;
  isDuplicateCode:boolean=false;
   searchFilter : SearchFilter = new SearchFilter();
  ngOnInit(): void {
    this.Countriesform = new FormGroup({
      CountryName: new FormControl("", Validators.required),
      Code: new FormControl("",Validators.required),
      Region: new FormControl("", Validators.required),
      
    });
    this.setDefaults();
    this.GetAllCountries()
   
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
    this.GetAllCountries();
 }

  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
    this.sort = sort;  
    this.GetAllCountries();
  }

  GetAllCountries() {
    let params = new HttpParams().set("PageSize",this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
                  .set("Sort",this.searchFilter.sort);
    this.rmmapi.getData("Countries/GetAllCountries",params).toPromise().then((res: any) => {
      this.countriesinfo = res.Data;
        this.countriesList = {
          data: res.Data.CountriesList,
          total: res.Data.CountriesList && res.Data.CountriesList.length > 0 ? res.Data.CountriesList[0].TotalRecords : 0
      };
       // this.AllCountries = res.Data;
    });
}
AddCountries(content){
  this.Countriesform.markAsUntouched();
  this.actionType=true;
 this.Countriesform.reset();
  this.isDuplicateCountry=false
  this.isDuplicateCode=false
  this.submitted=false;
  this.Model = new  Countries();
  this.Model.Id=0;
  this.GetAllRegions();
  this.modalReference = this.modalService.open(content,{size:'lg'});
  this.modalReference.result.then((result) => {
    this.closeResult = `Closed with: ${result}`;
  }, (reason) => {
    this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  });

}
CountriesEdit(Modelname,Data){
  this.isDuplicateCode=false;
  this.isDuplicateCountry=false;
if(this.rmmapi.getRolePrivilege('VP') && this.rmmapi.getRolePrivilege('MP'))
{
  this.actionType=false;
  this.isDuplicateCountry=false
  this.GetAllRegions();
this.Model.Id=Data.Id;
this.Model.Name=Data.Name;
this.Model.Code=Data.Code;
this.Model.RegionId=Data.RegionId;
this.modalReference = this.modalService.open(Modelname,{size:'lg'});
    }
    else{
      this.Countriesform.controls["CountryName"].disable();
      this.Countriesform.controls["Code"].disable();
      this.Countriesform.controls["Region"].disable();
      this.actionType=false;
  this.isDuplicateCountry=false
  this.GetAllRegions();
this.Model.Id=Data.Id;
this.Model.Name=Data.Name;
this.Model.Code=Data.Code;
this.Model.RegionId=Data.RegionId;
this.modalReference = this.modalService.open(Modelname,{size:'lg'});
    }


}

DeleteCountries(Data) {
  
  this.Model.CreatedBy="";
  this.Model.UpdatedBy="";
  this.rmmapi.postData("Countries/DeleteCountry" ,{ Id: this.Model.Id, UpdatedBy: "" }).toPromise().then((resp: any) => {
    if (resp && resp.Status) {
      if (resp.Data == -1) {
        this.GetAllCountries();
        this.notifyService.showSuccess("", "Country inactivated successfully");
      } else {
        this.notifyService.showWarning("", "Sorry, this Country could not be inactivated because it is referred by another active item");
      }
    } else {
      this.notifyService.showError("","Error: unable to inactivate the Country");
    }
    this.modalReference.close();
  })
}
InActiveModalInfo(value1: any, value2: any) {
  this.Model.Id = value2.Id
  this.Model.Name = value2.Name;
  this.modalReference = this.modalService.open(value1,{size:'sm'});
}

GetAllRegions() {
  this.rmmapi.getData("Markets/GetMarketRegions").toPromise().then((res: any) => {
    if (res && res.Data) {
      this.AllRegions = res.Data;
    }
  });
}
SaveCountry(value) {
  this.submitted=false;
  this.Countriesform.controls['CountryName'].markAsTouched();
  this.Countriesform.controls['Code'].markAsTouched();
  this.Countriesform.controls['Region'].markAsTouched();
  this.Model.CreatedDate = new Date();
  this.Model.CreatedBy = "";
  this.Model.Name=this.Model.Name;
  
  if (this.Countriesform.valid && this.Model.Name != ''&& this.Model.Code!='' && this.Model.Name != undefined && this.Model.Code!=undefined) {
    this.Model.Code=this.Model.Code.trim();
    this.rmmapi.getData("Countries/CheckDuplicateCountry?countries=" + this.Model.Name.trim()
    +'&id='+(this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
      this.isDuplicateCountry = res.Data;
        if (!this.isDuplicateCountry) {

          this.rmmapi.getData("Countries/CheckDuplicateCountryCode?code="+this.Model.Code.trim()
          +'&id='+(this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
            this.isDuplicateCode = res.Data;
            if (!this.isDuplicateCode) {

              if (this.Model.Id > 0) {
       
                this.rmmapi.postData("Countries/UpdateCountry", this.Model).toPromise().then((resp: any) => {
                 
                  this.notifyService.showSuccess("", "Country updated successfully")
                  
                  this.GetAllCountries()
                  this.modalReference.close();
                });
              }
              else {
              
                this.rmmapi.postData("Countries/AddCountry", this.Model).toPromise().then((resp: any) => {
                  this.notifyService.showSuccess("", "Country added successfully")
                
                  this.GetAllCountries()
                  this.modalReference.close();
                });
              }
          
            }
            else{
              return true;
            }

          });

        
        }
        else{
          return true;
        }
    });
   
  }
}
countryExists: string ;
checkDuplicate(){
  if(this.Model.Name.trim().length==0)
    {
      this.Model.Name = ''; 
      this.Countriesform.markAsUnTouched();
      return;
    }
  
   this.rmmapi.getData("Countries/CheckDuplicateCountry?countries=" + this.Model.Name.trim()
   +'&id='+(this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
    this.isDuplicateCountry = res.Data;
      if (this.isDuplicateCountry) {
        this.countryExists = this.Model.Name + ' ' + res.Message;
        this.Countriesform.controls["CountryName"].setErrors({ 'incorrect': true });
      } else {
        this.Countriesform.controls["CountryName"].setErrors(null);
      }
     
    });
}
codeExists: string ;
checkDuplicateCode(){
  if(this.Model.Code != undefined && this.Model.Code !='' && this.Model.Code.trim().length==0)
    {
      this.Model.Code = ''; 
      this.Countriesform.markAsUnTouched();
      return;
    }
    
   this.rmmapi.getData("Countries/CheckDuplicateCountryCode?code="+this.Model.Code.trim()
   +'&id='+(this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
    this.isDuplicateCode = res.Data;
    if (this.isDuplicateCode) {
      this.codeExists = this.Model.Code + ' ' + res.Message;
      this.Countriesform.controls["Code"].setErrors({ 'incorrect': true });
    } else {
      this.Countriesform.controls["Code"].setErrors(null);
    }
     
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
