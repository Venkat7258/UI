import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { HttpParams } from '@angular/common/http';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import WhiteSpaceValidation from 'src/app/shared/services/whiteSpace.validation';
import { EnvService } from '../../../shared/services/env.service';

@Component({
  selector: 'app-document-types',
  templateUrl: './document-types.component.html',
  styleUrls: ['./document-types.component.css']
})
export class DocumentTypesComponent implements OnInit {
  // documentTypeInfo: any[] = [];
  public documentTypeList: GridDataResult;
  searchFilter: SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [{ field: 'DocumentType', dir: 'asc' }];
  public type = "numeric";
  public position = "bottom";
  // model: any = new DocumentTypes();
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  allMarkets: any;
  isshowMarkets: boolean = false;
  showerrorMarkets: boolean = false;
  formTitle: string = "Add Document Type";
  buttonName: string = "Save";
  defaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  
  mandatoryItem: any[] = [{ Name: "Yes", Id: 1 }, { Name: "No", Id: 0 }];
  form: FormGroup;
  submitted = false;
  userName : string;

  constructor(public _appService: AppService,
    private formBuilder: FormBuilder,
    public rmmapi: RMMApiService,
    private _modalService: NgbModal,
    private _notifyService: NotificationService,
    public env : EnvService) {
  }




  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetDocumentTypes();


    this.userName = this.rmmapi.getUserName()

    this.form = this.formBuilder.group(
      {
        Id: [0],
        documentType: ["", Validators.required],
        mandatory: ["", Validators.required],
        marketSpecific: ["", Validators.required],
        marketId: [""],
        createdBy: [this.userName],
        updatedBy: [this.userName],
      },
      {
        validators: [WhiteSpaceValidation.WhiteSpaceCheck('documentType')]
      }
    );
  }
  OnMarketSpecific(event) {

    if (event == 1) {
      this.showerrorMarkets = true;
      this.isshowMarkets = true;
      this.form.controls.marketId.setValidators(Validators.required);
      this.form.controls.marketId.setErrors({ require: true });
      this.form.controls.marketId.updateValueAndValidity();
    }
    else {
      this.showerrorMarkets = false;
      this.isshowMarkets = false;
      // this.model.MarketId = null;
      this.form.controls.marketId.setValue(null);
      this.form.controls.marketId.clearValidators();
      this.form.controls.marketId.updateValueAndValidity();
    }

  }
  OnMarket(event) {

    if (event != null)
      this.isshowMarkets = true;
    else
      this.isshowMarkets = false;
  }
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "DocumentType asc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }
  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber = event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetDocumentTypes();
  }
  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "DocumentType asc";
    this.sort = sort;
    this.GetDocumentTypes();
  }
  GetDocumentTypes() {
    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort);
    this.rmmapi.getData("DocumentTypes/GetAllDocumentTypes", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        res.Data.DocumentTypesDetailsList.map(element => {
          element.Mandatory = element.Mandatory == true ? 'Yes' : 'No';
          element.MarketSpecific = element.MarketSpecific == true ? 'Yes' : 'No';
        });

        this.documentTypeList = {
          data: res.Data.DocumentTypesDetailsList,
          total: res.Data.DocumentTypesDetailsList && res.Data.DocumentTypesDetailsList.length > 0 ? res.Data.DocumentTypesDetailsList[0].TotalRecords : 0
        };
      }
    });
  }

  OpenDocumentTypePopup(content) {
    this.onReset();
    this.formTitle = "Add Document Type";
    this.buttonName = "Save";
    this.isDuplicateDocumentType = false;
    this.documentTypeExists = "";


    this.GetMarkets();
    this.modalReference = this._modalService.open(content, { size: 'lg' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.GetDismissReason(reason)}`;
    });
  }

  async GetMarkets() {
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
documentTypeName : string;
mandatoryValue: number;
marketSpecificValue : number;
marketIdValue : number;
  async EditDocumentType(value1: any, value2: any) {
   
    await this.GetMarkets();


    this.form.controls.Id.setValue(value2.Id);
    this.form.controls.documentType.setValue(value2.DocumentType);
    this.form.controls.mandatory.setValue(value2.Mandatory == "Yes" ? 1 : 0);
    this.form.controls.marketId.setValue(value2.MarketId);
    this.form.controls.marketSpecific.setValue(value2.MarketSpecific == "Yes" ? 1 : 0);


    //this.model.BatchNumber = value2.BatchNumber;
    this.isshowMarkets = value2.MarketSpecific == "Yes" ? true : false;
    this.modalReference = this._modalService.open(value1, { size: 'lg' });


    if (this.rmmapi.getRolePrivilege('VDT') && this.rmmapi.getRolePrivilege('MDT')) {
      this.formTitle = "Edit Document Type";
      this.buttonName = "Update";
      this.isDuplicateDocumentType = false;
      this.documentTypeExists = "";
    }
    else {
      this.form.controls["documentType"].disable();
      this.form.controls["mandatory"].disable();
      this.form.controls["marketSpecific"].disable();
      this.form.controls["marketId"].disable();
      this.formTitle = "Edit Document Type";
      this.buttonName = "Update";
      this.isDuplicateDocumentType = false;
      this.documentTypeExists = "";
      // this.GetMarkets();
      //this.model.BatchNumber = value2.BatchNumber;
      // this.modalReference = this._modalService.open(value1, { size: 'lg' });
    }
  }

  InActiveModalInfo(value1: any, value2: any) {


    this.form.controls.Id.setValue(value2.Id);
    this.form.controls.documentType.setValue(value2.DocumentType);

    this.modalReference = this._modalService.open(value1, { size: 'sm' });
  }

  DeleteDocumentType() {

    this.form.controls.updatedBy.setValue(this.rmmapi.getUserId());
    this.rmmapi.postData("DocumentTypes/DeleteDocumentType", this.form.value).toPromise().then((resp: any) => {
      this.modalReference.close();
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this._notifyService.showSuccess("", "Document Type inactivated successfully");
          this.GetDocumentTypes();
        } else {
          this._notifyService.showWarning("", "Sorry, this Document Type could not be inactivated because it is referred by another active item ");
        }
      } else {
        this._notifyService.showWarning("", "Error: unable to inactivate the Document Type");
      }
    });
  }

  isDuplicateDocumentType: boolean = false;
  documentTypeExists: string = "";
  CheckDuplicate() {

    if (this.form.controls.documentType.value.trim().length ==0) 
    {
      
       return;
     }

    let params = new HttpParams()
      .set("documentType", this.form.controls.documentType.value.trim())
      .set("id", this.form.controls.Id.value == null ? 0 : this.form.controls.Id.value)

    this.rmmapi.getData("DocumentTypes/CheckDuplicateDocumentType", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data > 0) {
        this.isDuplicateDocumentType = true;
        this.documentTypeExists = this.env.ValidationMessages.Thisvaluealreadyexists;
      } else {
        this.isDuplicateDocumentType = false;
        this.documentTypeExists = "";
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


  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.SaveDocumentType();

    console.log(JSON.stringify(this.form.value, null, 2));
  }

  onReset(): void {
    this.submitted = false;
    this.form.reset();
  }

  SaveDocumentType() {

    if (this.form.controls.marketSpecific.value == true
      && (this.form.controls.marketId.value == null || this.form.controls.marketId.value == "")
      ) {
        this.showerrorMarkets = true;
        this.form.controls.marketId.setErrors({ require: true });
        return;
    }

    
if(this.form.valid)
{
  let params = new HttpParams()
      .set("documentType", this.form.controls.documentType.value.trim())
      .set("id", this.form.controls.Id.value == null ? 0 : this.form.controls.Id.value)

    this.rmmapi.getData("DocumentTypes/CheckDuplicateDocumentType", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data > 0) {
        this.documentTypeExists = this.env.ValidationMessages.Thisvaluealreadyexists;
      }
      else{
    let url = "DocumentTypes/AddDocumentType";
    if (this.form.controls.Id.value > 0) {
      url = "DocumentTypes/UpdateDocumentType"
      this.form.controls.updatedBy.setValue(this.userName);
    }

    this.form.controls.createdBy.setValue(this.rmmapi.getUserId());
    this.form.controls.updatedBy.setValue(this.rmmapi.getUserId());
    this.rmmapi.postData(url, this.form.value).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if(url == "DocumentTypes/AddDocumentType")
        {
        this._notifyService.showSuccess("", "Document Type added successfully");
        }
        else{
          this._notifyService.showSuccess("", "Document Type updated successfully");
        }
        this.GetDocumentTypes();
        this.modalReference.close();
      } else {
        if(url == "DocumentTypes/AddDocumentType")
        {
        this._notifyService.showError("", "Sorry, Document Type could not be added");
        }
        else{
          this._notifyService.showError("", "Sorry, Document Type could not be updated");
        }
      }
      this.onReset();
    });
      }
  });
}
}
}
  