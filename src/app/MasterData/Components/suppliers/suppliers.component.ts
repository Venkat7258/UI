import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../../../app.service';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Suppliers } from '../../Models/suppliers';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../shared/services/notification.service';
import { HttpParams } from '@angular/common/http';
import { PaginationDefalts, SearchFilter } from 'src/app/shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { EnvService } from 'src/app/shared/services/env.service';
@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent implements OnInit {
  public suppliersList: GridDataResult;
  searchFilter: SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [{ field: 'Name', dir: 'asc' }];
  public type = "numeric";
  public position = "bottom";
  submitted = false;
  allCountries: any;
  Model: any = new Suppliers();
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  suppliersform: any;
  formTitle: string = "Add Supplier";
  buttonName: string = "Save";
  public defaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };

  constructor(public _appService: AppService,
    public rmmapi: RMMApiService,
    private _modalService: NgbModal,
    private _notifyService : NotificationService,
    public env : EnvService) {
    this.suppliersform = new FormGroup({
      name: new FormControl("", Validators.required),
      locationId: new FormControl("", Validators.required),
      address: new FormControl(),
    });
  }

  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetSuppliers();
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
    this.GetSuppliers();
  }
  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
    this.sort = sort;
    this.GetSuppliers();
  }
  GetSuppliers() {
    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort);
    this.rmmapi.getData("Suppliers/GetAllSuppliers", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.suppliersList = res.Data;
        this.suppliersList = {
          data: res.Data.suppliersDetailsList,
          total: res.Data.suppliersDetailsList && res.Data.suppliersDetailsList.length > 0 ? res.Data.suppliersDetailsList[0].TotalRecords : 0
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


  OpenSuppliersPopUp(content) {   
    this.suppliersform.markAsUntouched();
    this.suppliersform.reset();
 
    this.formTitle = "Add Supplier";
    this.buttonName = "Save";
    this.isDuplicateSupplier = false;
    this.supplierExists = "";
    this.Model = new Suppliers();
    this.suppliersform.submitted = false;
    this.GetAllCountries();
    this.modalReference = this._modalService.open(content, { size: 'lg' });
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


  SaveSuppliers() {
    this.suppliersform.submitted = true;
    if (this.suppliersform.valid && this.Model.Name != '') {
      this.Model.Name = this.Model.Name.trim();
       if (this.Model.Id > 0) {
        this.Model.UpdatedBy = "";
        this.Model.UpdatedDate = new Date();
        this.Model.Address = this.suppliersform.controls["address"].value;
        this.rmmapi.postData("Suppliers/UpdateSupplier", this.Model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this._notifyService.showSuccess("", "Supplier updated successfully");
            this.GetSuppliers();
            this.modalReference.close();
          } else {
            this._notifyService.showError("", "Sorry, Supplier could not be updated");
          }
          this.suppliersform.submitted = false;
        });
      }
      else {
        this.Model.CreatedBy = "";
        this.Model.CreatedDate = new Date();
        if (this.Model.Address == undefined) {
          this.Model.Address = "";
        }
        this.rmmapi.postData("Suppliers/AddSupplier", this.Model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this._notifyService.showSuccess("", "Supplier added successfully");
            this.GetSuppliers();
            this.modalReference.close();
          } else {
            this._notifyService.showError("", "Sorry, Supplier could not be added");
          }
          this.suppliersform.submitted = false;
        });
      }
    } else {
      this.suppliersform.markAllAsTouched();
    }

  }

  EditSuppliers(value1: any, value2: any) {
    if (this.rmmapi.getRolePrivilege('VS') && this.rmmapi.getRolePrivilege('MS')) {
      this.formTitle = "Edit Supplier";
      this.buttonName = "Update";
      this.isDuplicateSupplier = false;
      this.supplierExists = "";
      this.GetAllCountries();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.Model.LocationId = value2.LocationId;
      var address = this.suppliersform.controls["address"].value = value2.Address;
      this.Model.Address = address;
      this.modalReference = this._modalService.open(value1, { size: 'lg' });
    }
    else {
      this.suppliersform.controls["name"].disable();
      this.suppliersform.controls["locationId"].disable();
      this.suppliersform.controls["address"].disable();
      this.formTitle = "Edit Supplier";
      this.buttonName = "Update";
      this.isDuplicateSupplier = false;
      this.supplierExists = "";
      this.GetAllCountries();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.Model.LocationId = value2.LocationId;
      var address = this.suppliersform.controls["address"].value = value2.Address;
      this.Model.Address = address;
      this.modalReference = this._modalService.open(value1, { size: 'lg' });
    }
  }

  DeleteSuppliers() {
    this.Model.UpdatedBy = "";
    this.Model.UpdatedDate = new Date();
    this.rmmapi.postData("Suppliers/DeleteSupplier", this.Model).toPromise().then((resp: any) => {
      this.modalReference.close();
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this._notifyService.showSuccess("", "Supplier inactivated successfully");
          this.GetSuppliers();
        } else {
          this._notifyService.showWarning("", "Sorry, this Supplier could not be inactivated because it is referred by another active item");
        }
      } else {
        this._notifyService.showError("", "Error: unable to inactivate supplier");
      }
    });
  }

  InActiveModalInfo(value1: any, value2: any) {
    this.Model.Id = value2.Id
    this.Model.Name = value2.Name;
    this.modalReference = this._modalService.open(value1, { size: 'sm' });
  }

  isDuplicateSupplier: boolean = false;
  supplierExists: string = "";
  checkDuplicate() {
 
    if(this.Model.Name.trim().length==0 )
    {
      this.Model.Name = ''; 
      this.suppliersform.markAsTouched();
      return;
    }
    let params = new HttpParams().set("Name", this.Model.Name.trim()).set("Id", (this.Model.Id ? this.Model.Id : 0));
    this.rmmapi.getData("Suppliers/CheckDuplicateSuplier", params).toPromise().then((res: any) => {
      if(res && res.Status && res.Data > 0) {
        this.isDuplicateSupplier  =true;
        this.supplierExists = this.env.ValidationMessages.Thisvaluealreadyexists;
        this.suppliersform.controls["name"].setErrors({ 'incorrect': true });
      } else {
        this.isDuplicateSupplier = false;
        this.supplierExists = "";
        this.suppliersform.controls["name"].setErrors(null);
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
