import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from '../../../app.service';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { RawMaterials } from '../../Models/raw-materials';
import { NotificationService } from '../../../shared/services/notification.service';
import { HttpParams } from '@angular/common/http';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { EnvService } from 'src/app/shared/services/env.service';


@Component({
  selector: 'app-raw-materials',
  templateUrl: './raw-materials.component.html',
  styleUrls: ['./raw-materials.component.css']
})
export class RawMaterialsComponent implements OnInit {
  isDuplicateCode: boolean = false;
  public rawmaterialinfo: any[] = [];
  moduleName: string = "Raw Materials";
  public rawMaterialsList: GridDataResult;
  searchFilter: SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [{ field: 'Name', dir: 'asc' }];
  public type = "numeric";
  public position = "bottom";
  //rawMaterialsList: any;
  allCountries: any;
  Model: any = new RawMaterials();
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  rawMaterialsform: any
  formTitle: string = "Add Raw Material";
  buttonName: string = "Save";
  constructor(public _appService: AppService,
    public rmmapi: RMMApiService,
    private _modalService: NgbModal,
    private _notifyService: NotificationService,
    public env: EnvService) {
    this.rawMaterialsform = new FormGroup({
      name: new FormControl("", Validators.required),
      code: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
    });
  }

  ngOnInit(): void {
    this._appService.setHeaderUserName(this.rmmapi.getUserName());
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetRawMaterials();

    const sessionTab = this.rmmapi.getStorage(this.env.CurrentTabState.TabName);


    
    if (sessionTab !== undefined && sessionTab !== 'undefined' && sessionTab !== null) {
      const tempSubMenuArray = [
        'Raw Materials',
        'Suppliers',
        'Manufacturers',
        'DocumentTypes']
      if (tempSubMenuArray.find(item => item == sessionTab)) {
        this.Tabchange(sessionTab);
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
    this.GetRawMaterials();
  }
  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
    this.sort = sort;
    this.GetRawMaterials();
  }
  GetRawMaterials() {
    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort);
    this.rmmapi.getData("RawMaterials/GetAllRawMaterials", params).toPromise().then((res: any) => {
      if (res && res.Status) {
        this.rawmaterialinfo = res.Data;
        this.rawMaterialsList = {
          data: res.Data.RawMaterialDetailsList,
          total: res.Data.RawMaterialDetailsList && res.Data.RawMaterialDetailsList.length > 0 ? res.Data.RawMaterialDetailsList[0].TotalRecords : 0
        };
      }
    });
  }


  OpenRawMaterialPopUp(content) {
    this.rawMaterialsform.reset();
    this.rawMaterialsform.submitted = false;
    this.formTitle = "Add Raw Material";
    this.buttonName = "Save";
    this.isDuplicate = false;
    this.rawMaterialNameExissts = "";
    this.codeExists = "";
    this.Model = new RawMaterials();
    this.modalReference = this._modalService.open(content, { size: 'lg' });
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


  SaveRawMaterials() {

    this.rawMaterialsform.submitted = true;
    if (this.rawMaterialsform.valid && this.Model.Name.trim() != '' && this.Model.Code.trim() != '' && this.Model.Description.trim() != '' && !this.isDuplicate && !this.isDuplicateCode) {
      if (this.Model.Id > 0) {
        this.Model.UpdatedBy = "";
        this.Model.UpdatedDate = new Date();
        this.rmmapi.postData("RawMaterials/UpdateRawMaterial", this.Model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this._notifyService.showSuccess("", "Raw Material updated successfully");
            this.GetRawMaterials();
            this.modalReference.close();
          } else {
            this._notifyService.showError("", "Sorry, Raw Material could not be updated");
          }
          this.rawMaterialsform.submitted = false;
        });
      }
      else {
        this.Model.CreatedBy = "";
        this.Model.CreatedDate = new Date();
        this.rmmapi.postData("RawMaterials/AddRawMaterial", this.Model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this._notifyService.showSuccess("", "Raw Material added successfully");
            this.GetRawMaterials();
            this.modalReference.close();
          } else {
            this._notifyService.showError("", "Sorry, Raw Material could not be added");
          }
          this.rawMaterialsform.submitted = false;
        });
      }
    } else {
      this.rawMaterialsform.markAllAsTouched();
    }

  }

  EditRawMaterial(value1: any, value2: any) {
    this.isDuplicateCode = false;
    this.isDuplicate = false;
    if (this.rmmapi.getRolePrivilege('MVR') && this.rmmapi.getRolePrivilege('MMR')) {

      this.formTitle = "Edit Raw Material";
      this.buttonName = "Update";
      this.isDuplicate = false;
      this.rawMaterialNameExissts = "";
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.Model.Code = value2.Code;
      this.Model.Description = value2.Description;
      this.modalReference = this._modalService.open(value1, { size: 'lg' });
    }
    else {
      this.rawMaterialsform.controls["name"].disable();
      this.rawMaterialsform.controls["code"].disable();
      this.rawMaterialsform.controls["description"].disable();
      this.formTitle = "Edit Raw Material";
      this.buttonName = "Update";
      this.isDuplicate = false;
      this.rawMaterialNameExissts = "";
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.Model.Code = value2.Code;
      this.Model.Description = value2.Description;
      this.modalReference = this._modalService.open(value1, { size: 'lg' });
    }
  }

  DeleteRawMaterial() {
   
    this.Model.UpdatedBy = "";
    this.Model.UpdatedDate = new Date();
    this.rmmapi.postData("RawMaterials/DeleteRawMaterial", this.Model).toPromise().then((resp: any) => {
      this.modalReference.close();
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this._notifyService.showSuccess("", "Raw Material inactivated successfully");
          this.GetRawMaterials();
        } else {
          this._notifyService.showWarning("", "Sorry, this Raw Material could not be inactivated because it is referred by another active item");
        }
      } else {
        this._notifyService.showError("", "Error: unable to inactivate the Raw Material");
      }
    });
  }

  InActiveModalInfo(value1: any, value2: any) {
    this.Model.Id = value2.Id
    this.Model.Name = value2.Name;
    this.Model.Code = value2.Code;
    this.Model.Description = value2.Description;
    this.modalReference = this._modalService.open(value1, { size: 'sm' });
  }

  isDuplicate: boolean = false;
  rawMaterialNameExissts: string;
  CheckDuplicate() {
    if (this.Model.Name.trim().length == 0) {
      this.Model.Name = '';
      this.rawMaterialsform.controls['name'].submitted = true;
      return;
    }
    let params = new HttpParams().set("Name", this.Model.Name.trim()).set("Id", (this.Model.Id ? this.Model.Id : 0));
    this.rmmapi.getData("RawMaterials/CheckDuplicateRawMaterial", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data > 0) {
        this.isDuplicate = true;
        this.rawMaterialNameExissts = this.Model.Name + ' ' + res.Message;
        this.rawMaterialsform.controls["name"].setErrors({ 'incorrect': true });
      } else {
        this.isDuplicate = false;
        this.rawMaterialNameExissts = "";
        this.rawMaterialsform.controls["name"].setErrors(null);
      }
    });
  }
  codeExists: string;
  checkDuplicateCode() {
    if (this.Model.Code.trim().length == 0) {
      this.Model.Code = '';
      this.rawMaterialsform.controls['code'].submitted = true;
      return;
    }
    this.rmmapi.getData("RawMaterials/CheckDuplicateRawMaterialCode?code=" + this.Model.Code.trim()).toPromise().then((res: any) => {
      this.isDuplicateCode = res.Data;
      if (this.isDuplicateCode) {
        this.isDuplicateCode = true;
        this.codeExists = this.env.ValidationMessages.Thisvaluealreadyexists;
        this.rawMaterialsform.controls["Code"].setErrors({ 'incorrect': true });
      } else {
        this.isDuplicateCode = false;
        this.codeExists = "";
        this.rawMaterialsform.controls["Code"].setErrors(null);
      }

    });
  }
  Tabchange(tabname: string) {
    this.moduleName = tabname;
    this.rmmapi.setStorage(this.env.CurrentTabState.TabName, tabname);
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
