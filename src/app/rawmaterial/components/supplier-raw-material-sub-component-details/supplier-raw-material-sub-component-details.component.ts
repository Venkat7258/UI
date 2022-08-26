import { Component, EventEmitter, Input, OnInit, Output, SimpleChange, ViewChild } from '@angular/core';
import { AppService } from '../../../app.service';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SupplierRawMaterialSubComponentDetails } from '../../models/supplierRawMaterialSubComponentDetails';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { BlockInvalidChar, EnvService } from 'src/app/shared/services/env.service';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { PaginationDefalts,PrivilegCodes, SearchFilter } from 'src/app/shared/constants/global.constants';
import { PageChangeEvent } from '@progress/kendo-angular-dropdowns/dist/es2015/common/models/page-change-event';
import { SortDescriptor } from '@progress/kendo-data-query/dist/npm/sort-descriptor';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';

@Component({
  selector: 'app-supplier-raw-material-sub-component-details',
  templateUrl: './supplier-raw-material-sub-component-details.component.html',
  styleUrls: ['./supplier-raw-material-sub-component-details.component.css']
})
export class SupplierRawMaterialSubComponentDetailsComponent implements OnInit {
  searchFilter: SearchFilter = new SearchFilter();
  sort: SortDescriptor[] = [{ field: 'SubComponentName', dir: 'asc' }];
  supplierRawMaterialList: GridDataResult;
  supplierDocumentList: any;
  subComponentList: any;
  subComponentFunctionList: any[] = [];
  Model: any;
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  suppliersform: any
  formTitle: string = "Add Sub-component";
  buttonName: string = "Save";
  AccessToMRM = true;
  AccessToIRM=true;
  submitted = false;
  
  public data: Array<{ Name: string; Id: number }>;
  public defaultItem: { Name: string; Id: number } = { Name: "-- Select --", Id: null };
  public defaultItemSearch: { Name: string; Id: number } = { Name: "-- Search --", Id: null };
  impurities: any[] = [{ Name: "Yes", Id: 1 }, { Name: "No", Id: 0 }];
  isRawMaterialComplete: boolean = false;
  @Input("supplierRawMaterialDetail") supplierRawMaterialDetail: any;
  @Output() informToParent = new EventEmitter();
  constructor(public _appService: AppService,
    public _rmmapi: RMMApiService,
    private _modalService: NgbModal,
    private _notifyService: NotificationService, public env: EnvService) {
    this.suppliersform = new FormGroup({
      SubComponentId: new FormControl(null, Validators.required),
      CASNumber: new FormControl("", Validators.required),
      ECNumberOrKENumber: new FormControl(""),
      ImpuritiesPPM: new FormControl("", Validators.required),
      REAChNumberOrStatus: new FormControl(""),
      RawMaterialSubComponentConcentration: new FormControl("", Validators.required),
      SubComponentFunction: new FormControl("", Validators.required),
      SourceDocumentId: new FormControl(""),
      USINCIName: new FormControl(""),
      EUINCIName: new FormControl(""),
      GivenSubComponentName: new FormControl(null, Validators.required)
    });
  }
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  ngOnInit(): void {
    
    this._appService.setHeaderShow(true);
    this.setDefaults();
    this.searchFilter.sortAscending = 0;
    this.searchFilter.sortExpression = 'GivenSubComponentName';
    this.AccessToMRM = this._rmmapi.getRolePrivilege(PrivilegCodes.MRM).toString() === 'true' ? true : false;
    this.AccessToIRM = this._rmmapi.getRolePrivilege(PrivilegCodes.IRM).toString() === 'true' ? true : false;
  }

  ngOnChanges(changes: SimpleChange) {
    if (this.supplierRawMaterialDetail) {
      this.supplierRawMaterialDetail = changes['supplierRawMaterialDetail'].currentValue;
      this.setDefaults();
      this.GetSuppliersRawMaterial();
    }
  }

  GetSuppliersRawMaterial() {
    
    let params = new HttpParams()
    .set("SortExpression", this.searchFilter.sortExpression)
    .set("SortAscending", this.searchFilter.sortAscending.toString())
    .set("PageIndex", this.searchFilter.pageNumber.toString())
    .set("PageSize", this.searchFilter.pageSize.toString())
    .set("Id", this.supplierRawMaterialDetail.Id.toString());
    this._rmmapi.getData("SupplierRawMaterialSubComponentDetails/GetSupplierRawMaterialSubComponentDetails", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.supplierRawMaterialList = {
          data: res.Data.Data,
          total: res.Data.TotalRecords
        };
        this.isRawMaterialComplete = this.supplierRawMaterialList.data.length > 0 && this.supplierRawMaterialList.data[0].StatusName == "New" ? true : false;
        this.supplierRawMaterialList.data.forEach(element => {
          element.ImpuritiesPPM = element.ImpuritiesPPM ? "Yes" : "No";
        });
      }
    });
  }

  GetSupplierRawMaterialDocumentDetails() {
    
    let params = new HttpParams().set("Id", this.supplierRawMaterialDetail.Id.toString());
    this._rmmapi.getData("SupplierRawMaterialDataChecks/GetSupplierRawMaterialDocumentDetailsById", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.supplierDocumentList = res.Data;

      }
    });
  }

  GetSubComponent(subComponentId?: number) {
    this._rmmapi.getData("SubComponent/GetSubComponents").toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.subComponentList = res.Data;
        this.data = this.subComponentList.slice();
        if (subComponentId) {
          let item = this.subComponentList.filter(x => x.Id == subComponentId);
          this.Model.SubComponent = item.length > 0 ? item[0] : null;
        }
      }
    });
  }

  GetSubComponentFunctions(functionName?: any) {
    this._rmmapi.getData("SupplierRawMaterialSubComponentDetails/GetSubComponentFunctions").toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.subComponentFunctionList = res.Data;
        if (functionName) {
          this.GetFunctionName(this.subComponentFunctionList, functionName);
          this.Model.SubComponentFunction = this.functionName;
          this.suppliersform.controls['SubComponentFunction'].setValue(this.functionName);
        }
      }
    });
  }

  OpenSuppliersPopUp(content) {
    this.suppliersform.reset();
    this.suppliersform.markAsUntouched();
    this.supplierExists = '';
    this.isDuplicateSupplier = false;
    this.GetSubComponentFunctions();
    this.GetSubComponent();
    this.GetSupplierRawMaterialDocumentDetails();
    this.formTitle = "Add Sub-component";
    this.buttonName = "Save";
    this.functionName = [];
    this.Model = new SupplierRawMaterialSubComponentDetails();
    this.modalReference = this._modalService.open(content, { size: 'xl' });
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


  SaveSuppliersRawMaterials() {
    
    this.submitted = true;
    this.CheckDuplicate('full');
  }


  SaveSuppliersRawMaterials_2(){  
    if (this.suppliersform.valid) {
      if(this.isDuplicateSupplier){
        return;
      }
      this.Model.SupplierRawMaterialDetailId = this.supplierRawMaterialDetail.Id;
      this.Model.StatusCode = this.supplierRawMaterialDetail.StatusCode;
      //this.Model.RawMaterialSubComponentConcentration = parseFloat(this.Model.RawMaterialSubComponentConcentration).toFixed(7);
      if (this.Model.Id > 0) {
        this.Model.UpdatedBy = this._rmmapi.getUserName();
        this.Model.UpdatedDate = new Date();
        this._rmmapi.postData("SupplierRawMaterialSubComponentDetails/UpdateSupplierRawMaterialSubComponentDetails", this.Model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            // this._notifyService.showSuccess("", this.Model.SubComponentName + resp.Message);
            this._notifyService.showSuccess("", "Sub-component Details updated successfully");
            this.GetSuppliersRawMaterial();
            this.modalReference.close();
          } else {
            //this._notifyService.showError("", resp.Message);
            this._notifyService.showError("", "Sorry, Sub-component details could not be updated");
          }

          this.submitted = false;
        });
      }
      else {
        this.Model.CreatedBy = this._rmmapi.getUserName();
        this.Model.UpdatedBy = this._rmmapi.getUserName();
        this.Model.CreatedDate = new Date();
        this._rmmapi.postData("SupplierRawMaterialSubComponentDetails/AddSupplierRawMaterialSubComponentDetails", this.Model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            //this._notifyService.showSuccess("", this.Model.SubComponentName + resp.Message);
            this._notifyService.showSuccess("", "Sub-component Details added successfully");
            this.GetSuppliersRawMaterial();
            this.modalReference.close();
          } else {
            //this._notifyService.showError("", resp.Message);
            this._notifyService.showError("", "Sorry, Sub-component could not be added");
          }
          this.submitted = false;
        });
      }
    } else {
      this.suppliersform.markAllAsTouched();
    }
  }

  EditSuppliersRawMaterials(value1: any, value2: any) {

    this.supplierExists = '';
    this.isDuplicateSupplier = false;
    this.functionName = [];
    this.Model = new SupplierRawMaterialSubComponentDetails();
    this.formTitle = "Edit Sub-component";
    this.buttonName = "Update";
    this.GetSubComponentFunctions(value2.SubComponentFunctionName);
    this.GetSubComponent(value2.SubComponentId);
    this.GetSupplierRawMaterialDocumentDetails();
    this.Model.Id = value2.Id;
    this.Model.GivenSubComponentName = value2.GivenSubComponentName;
    this.Model.SubComponentName = value2.SubComponentName;
    this.Model.CASNumber = value2.CASNumber;
    this.Model.ECNumberOrKENumber = value2.ECNumberOrKENumber;
    this.Model.ImpuritiesPPM = value2.ImpuritiesPPM == "Yes" ? 1 : 0;
    this.Model.TDSNumber = value2.TDSNumber;
    this.Model.REAChNumberOrStatus = value2.REAChNumberOrStatus;
    this.Model.RawMaterialSubComponentConcentration = parseFloat(value2.RawMaterialSubComponentConcentration).toFixed(7);
    this.Model.EUINCIName = value2.EUINCIName;
    this.Model.USINCIName = value2.USINCIName;
    this.Model.EINECSNumber = value2.EINECSNumber;
    this.Model.SupplierRawMaterialDetailId = value2.SupplierRawMaterialDetailId;
    this.Model.SourceDocumentId = value2.SourceDocumentId;
    this.Model.SubComponentId = value2.SubComponentId;
    this.Model.CreatedBy = value2.CreatedBy;
    this.Model.CreatedDate = value2.CreatedDate;
    this.modalReference = this._modalService.open(value1, { size: 'xl' });
  }

  functionName: any[] = [];
  GetFunctionName(list: any, name: string) {
    let names = name.split(',');
    names.forEach(element => {
      let item = list.find(x => x.Name == element);
      this.functionName.push(item);
    });
  }
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  DeleteSuppliersRawMaterials() {
    this.Model.UpdatedBy = this._rmmapi.getUserName();
    this.Model.UpdatedDate = new Date();
    this.Model.SupplierRawMaterialDetailId = this.supplierRawMaterialDetail.Id;
    this._rmmapi.postData("SupplierRawMaterialSubComponentDetails/DeleteSupplierRawMaterialSubComponentDetails", this.Model).toPromise().then((resp: any) => {
      this.modalReference.close();
      if (resp && resp.Status) {
        if (resp.Data == -1) {
         // this._notifyService.showSuccess("", this.Model.SubComponentName + resp.Message);
         this._notifyService.showSuccess("", "Sub-component deleted successfully");
          this.GetSuppliersRawMaterial();
        } else {
          this._notifyService.showWarning("", this.Model.SubComponentName + resp.Message);
        }
      } else {

        
        this._notifyService.showError("", resp.Message);
      }
    });
  }

  InActiveModalInfo(value1: any, value2: any) {
    this.Model = new SupplierRawMaterialSubComponentDetails();
    this.Model.Id = value2.Id
    this.Model.SubComponentName = value2.SubComponentName;
    this.modalReference = this._modalService.open(value1, { size: 'sm' });
  }

  isDuplicateSupplier: boolean = false;
  supplierExists: string = "";
  CheckDuplicate(actionType:string) {
    
    this.Model.SupplierRawMaterialDetailId = this.supplierRawMaterialDetail.Id;
    
    this._rmmapi.postData("SupplierRawMaterialSubComponentDetails/CheckDuplicateSupplierRawMaterialSubComponentDetails", this.Model).toPromise().then((res: any) => {
      if (res && res.Status && res.Data > 0) {
        this.isDuplicateSupplier = true;
        this.supplierExists = this.env.ValidationMessages.Thisvaluealreadyexists;
        this.suppliersform.controls["GivenSubComponentName"].setErrors({ 'incorrect': true });
      } else {
        this.isDuplicateSupplier = false;
        this.supplierExists = "";
        this.suppliersform.controls["GivenSubComponentName"].setErrors(null);

        if(actionType === 'full'){ // if there is no duplicate the performe Add/Update operation. 
          this.submitted = true;
          this.SaveSuppliersRawMaterials_2();
        }
      }
    });
  }

  handleFilter(value) {
    this.subComponentList = this.data.filter(
      (s) => s.Name.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  OnSubComponentChange(event: any) {
    
    if (event.Id != null) {
      this.supplierExists = '';
      this.isDuplicateSupplier = false;
      this.Model.GivenSubComponentName = this.Model.SubComponentName = event.Name;
      this.Model.CASNumber = event.CASNumber;
      this.Model.EINECSNumber = event.EINECSNumber;
      this.Model.EUINCIName = event.EUINCIName;
      this.Model.USINCIName = event.USINCIName;
      this.Model.ECNumberOrKENumber = event.ECNumberOrKENumber;
      this.Model.SubComponentId = event.Id;
      this.CheckDuplicate('only');
    }
    else{
      this.Model= new SupplierRawMaterialSubComponentDetails();
    }

  }


  RawMaterialCompleted() {
    this.Model = new SupplierRawMaterialSubComponentDetails();
    this.Model.Id = this.supplierRawMaterialDetail.Id;
    this._rmmapi.postData("SupplierRawMaterialDetails/UpdateSupplierRawMaterialDetailsStatus", this.Model).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        this._notifyService.showSuccess("", this.supplierRawMaterialDetail.RawMaterialName + " Status " + resp.Message);
        this.GetSuppliersRawMaterial();
      } else {
        this._notifyService.showError("", resp.Message);
      }
    });
  }

  GotoDocumentDetails() {
    this.informToParent.emit();
  }
  showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;
    if ((element.nodeName === 'TD' || element.nodeName === 'TH' || element.nodeName === 'SPAN')
      && element.offsetWidth < element.scrollWidth) {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }
  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber = event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetSuppliersRawMaterial();
  }
  sortChange(sort): void {
    
    this.sort = sort;
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Id asc";
    this.searchFilter.sortExpression = sort[0].dir!= undefined ? sort[0].field : "GivenSubComponentName";
    this.searchFilter.sortAscending = sort[0].dir != undefined ? (sort[0].dir === 'desc' ? 0 : 1) : 0;
    this.GetSuppliersRawMaterial();
  }
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sortAscending = PaginationDefalts.sortAscending;
    this.searchFilter.sort = "";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }
  NumberTypeValidation(event:any){
    BlockInvalidChar(event);
    // dataItem.Concentration = event.target.value;
  }
}
