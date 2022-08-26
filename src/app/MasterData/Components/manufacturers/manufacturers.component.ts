import { Component, OnInit,ViewChild } from '@angular/core';
import { AppService } from '../../../app.service';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Manufacturers } from '../../Models/manufacturers';
import { NotificationService } from '../../../shared/services/notification.service';
import { HttpParams } from '@angular/common/http';
import { PaginationDefalts, SearchFilter } from 'src/app/shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { EnvService } from '../../../shared/services/env.service';
@Component({
  selector: 'app-manufacturers',
  templateUrl: './manufacturers.component.html',
  styleUrls: ['./manufacturers.component.css']
})
export class ManufacturersComponent implements OnInit {
  manufacturersinfo : any[]=[];
  public manufacturersList:GridDataResult;
  searchFilter : SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [ { field: 'Name', dir: 'asc'}];
  public type = "numeric";
  public position = "bottom";
  allCountries: any;
  Model: any = new Manufacturers();
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  manufacturersform: any;
  formTitle : string = "Add Manufacturer";
  buttonName : string = "Save";
  public defaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  constructor(public _appService: AppService,
    public rmmapi: RMMApiService,
    private _modalService: NgbModal,
    private _notifyService: NotificationService,
    public env : EnvService) {
    this.manufacturersform = new FormGroup({
      name: new FormControl("", Validators.required),
      locationId: new FormControl("", Validators.required),
      address:new FormControl(),
    });
  }

  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetManufacturers();
    
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
    this.GetManufacturers();
 }
 sortChange(sort: SortDescriptor[]): void {
  this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
  this.sort = sort;  
  this.GetManufacturers();
}
  GetManufacturers() {
    let params = new HttpParams().set("PageSize",this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
    .set("Sort",this.searchFilter.sort);
    this.rmmapi.getData("Manufacturers/GetAllManufacturers",params).toPromise().then((res: any) => {
      if (res && res.Status) {
        this.manufacturersinfo = res.Data;
        this.manufacturersList = {
          data: res.Data.ManufacturesDetailsList,
          total: res.Data.ManufacturesDetailsList && res.Data.ManufacturesDetailsList.length > 0 ? res.Data.ManufacturesDetailsList[0].TotalRecords : 0
      };
      }
    });
  }

  GetAllCountries() {
    this.rmmapi.getData("Countries/GetCountries").toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.allCountries = res.Data;
      }
    });
  }


  OpenManufacturersPopUp(content) {
    this.manufacturersform.reset();
    this.manufacturersform.markAsUntouched();
    this.formTitle = "Add Manufacturer";
    this.buttonName = "Save";
    this.isDuplicate = false;
    this.manufacturerNameExists = "";
    this.Model = new Manufacturers();
    this.GetAllCountries();
    this.modalReference = this._modalService.open(content,{size:'lg'});
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.GetDismissReason(reason)}`;
    });
  }

  private GetDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  SaveManufacturers() {

    this.manufacturersform.submitted = true;
    if (this.manufacturersform.valid && this.Model.Name!='') {
      this.Model.Name = this.Model.Name != undefined ? this.Model.Name.trim() : '' ;
       if (this.Model.Id > 0) {
        this.Model.UpdatedBy = "";
        this.Model.UpdatedDate = new Date();
        this.Model.Address=this.manufacturersform.controls["address"].value;
        this.rmmapi.postData("Manufacturers/UpdateManufacturer", this.Model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this._notifyService.showSuccess("", "Manufacturer updated successfully");
            this.GetManufacturers();
            this.modalReference.close();
          } else {
            this._notifyService.showError("", "Sorry, Manufacturer could not be updated");
          }
          this.manufacturersform.submitted = false;
        });
      }
      else {
        this.Model.CreatedBy = "";
        this.Model.CreatedDate = new Date();
        if(this.Model.Address==undefined)
      {
        this.Model.Address="";
      }
        this.rmmapi.postData("Manufacturers/AddManufacturer", this.Model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this._notifyService.showSuccess("", "Manufacturer added successfully");
            this.GetManufacturers();
            this.modalReference.close();
          } else {
            this._notifyService.showError("", "Sorry, Manufacturer could not be added");
          }
          this.manufacturersform.submitted = false;
        });
      }
    } else {
      this.manufacturersform.markAllAsTouched();
    }

  }

  EditManufacturers(value1: any, value2: any) {
    if(this.rmmapi.getRolePrivilege('VMF') && this.rmmapi.getRolePrivilege('MMF'))
    {
    this.formTitle =  "Edit Manufacturer";
    this.buttonName  = "Update";
    this.isDuplicate = false;
    this.manufacturerNameExists = "";
    this.GetAllCountries();
    this.Model.Id = value2.Id
    this.Model.Name = value2.Name;
    this.Model.LocationId = value2.LocationId;
    this.Model.Address = value2.Address;
    this.modalReference = this._modalService.open(value1,{size:'lg'});
    }
    else{
      this.manufacturersform.controls["name"].disable();
      this.manufacturersform.controls["locationId"].disable();
      this.manufacturersform.controls["address"].disable();
      this.formTitle =  "Edit Manufacturer";
      this.buttonName  = "Update";
      this.isDuplicate = false;
      this.manufacturerNameExists = "";
      this.GetAllCountries();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.Model.LocationId = value2.LocationId;
      this.Model.Address = value2.Address;
      this.modalReference = this._modalService.open(value1,{size:'lg'});
    }
  }

  InActiveModalInfo(value1: any, value2: any) {
    this.Model.Id = value2.Id
    this.Model.Name = value2.Name;
    this.Model.LocationId = value2.LocationId;
    this.Model.Address = value2.Address;
    this.modalReference = this._modalService.open(value1, {size: 'sm'});
  }

  DeleteManufacturers() {
    this.Model.UpdatedBy = "";
    this.Model.UpdatedDate = new Date();
    this.rmmapi.postData("Manufacturers/DeleteManufacturer", this.Model).toPromise().then((resp: any) => {
      this.modalReference.close();
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this._notifyService.showSuccess("", "Manufacturer inactivated successfully");
          this.GetManufacturers();
        } else {
          this._notifyService.showWarning("", "Sorry, this Manufacturer could not be inactivated because it is referred by another active item");
        }
      } else {
        this._notifyService.showError("", "Error: unable to inactivate the Manufacturer");
      }
    });
  }

  isDuplicate: boolean = false;
  manufacturerNameExists: string;
  CheckDuplicate() {
    if(this.Model.Name.trim().length==0)
    {
      this.Model.Name='';
      this.manufacturersform.markAsUnTouched()
    }
    let params = new HttpParams().set("Name",this.Model.Name.trim()).set("Id", (this.Model.Id ? this.Model.Id : 0));
    this.rmmapi.getData("Manufacturers/CheckDuplicateManufacturer", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data > 0) {
        this.isDuplicate = true;
        this.manufacturerNameExists = this.env.ValidationMessages.Thisvaluealreadyexists;
        this.manufacturersform.controls["name"].setErrors({ 'incorrect': true });
      } else {
        this.isDuplicate = false;
        this.manufacturerNameExists = "";
        this.manufacturersform.controls["name"].setErrors(null);
      }
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
