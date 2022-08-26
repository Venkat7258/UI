
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { SupplierRawMaterialDocumentDetails } from '../../models/supplier-raw-material-document-details';
import { FileInfo, FileRestrictions } from '@progress/kendo-angular-upload';
import { HttpParams } from '@angular/common/http';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { PaginationDefalts, PrivilegCodes, SearchFilter } from 'src/app/shared/constants/global.constants';
import { CommonService } from 'src/app/Common/Services/common.service';
import { ReferenceModalList } from 'src/app/Common/Models/ReferenceModalList.modal';

@Component({
  selector: 'app-supplier-raw-material-document-details',
  templateUrl: './supplier-raw-material-document-details.component.html',
  styleUrls: ['./supplier-raw-material-document-details.component.css']
})
export class SupplierRawMaterialDocumentDetailsComponent implements OnInit {

  pageSize = 10;
  skip = 0;
  searchFilter: SearchFilter = new SearchFilter();
  sort: SortDescriptor[] = [{ field: 'Id', dir: 'asc' }];
  public checkboxEventData: any;
  @Input() item: any;
  @Output() informToParent = new EventEmitter();
  public supplierRawMaterialDocumentDetailsinfo: GridDataResult;
  modalOptions: NgbModalOptions;
  ReferenceModalList: ReferenceModalList[] = [];
  closeResult: string;
  supplierRawMaterialDocumentDetailsModel: any = new SupplierRawMaterialDocumentDetails();
  AllRegulationGroups: any[] = [];
  documentTypeList: any[] = [];
  IsCheckSupplierRawMaterialDocumentDetails: boolean = false;
  IsEnablerDMSURL: boolean = false;
  IsChangeDMSURLCheck: boolean = true;
  actionType = true;
  uplodaFileData: any;
  DMSURL: string;
  InvalidUrl = false;
  IsNoExpiryEnabled = true;
  AccessToMRM = true;
  public defaultItem: { DocumentType: string; Id: number } = {
    DocumentType: "Select",
    Id: null,
  };
  public defaultItemValidity: { Name: string; Id: number } = {
    Name: "Select",
    Id: 0,
  };
  public documentValidityList: any[] = [
      { Id: 1, Name: '1' }
    , { Id: 2, Name: '2' }
    , { Id: 3, Name: '3' }
    , { Id: 4, Name: '4' }
    , { Id: 5, Name: '5' }
    , { Id: 6, Name: '6' }
    , { Id: 7, Name: '7' }
    , { Id: 8, Name: '8' }
    , { Id: 9, Name: '9' }
    , { Id: 10, Name: '10' }
    , { Id: 11, Name: 'No Expiry' }
  ]
  userName: any = "";

  uploadSaveUrl = 'saveUrl'; // should represent an actual API endpoint
  uploadRemoveUrl = 'removeUrl'; // should represent an actual API 
  myFiles: Array<FileInfo> = [];
  FileName = "";
  public myRestrictions: FileRestrictions = {
    allowedExtensions: ['docx', 'doc', 'pdf', 'xls', 'xlsx']
  };


  //public userName: string;
  public userImages: Array<FileInfo>;
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;

  save(_value: any, valid: boolean) {
    if (valid) {
      console.log('Everything is OK!');
    }
  }
  constructor(public datepipe: DatePipe, public _notificationService: NotificationService,
    public env: EnvService, public _appService: AppService, public rmmapi: RMMApiService, private modalService: NgbModal,
    private commonService: CommonService) { }
  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this._appService.setHeaderShow(true);
    this.setDefaults();
    this.searchFilter.sortAscending = 0;
    this.searchFilter.sortExpression = 'GivenSubComponentName';
    this.GetSupplierRawMaterialDocumentDetails();
    this.GetDocumentTypes();


    this.AccessToMRM = this.rmmapi.getRolePrivilege(PrivilegCodes.MRM).toString() === 'true' ? true : false;
    this.userName = this.rmmapi.getUserName();
  }
  GetSupplierRawMaterialDocumentDetails() {
    let params = new HttpParams()
      .set("SortExpression", this.searchFilter.sortExpression)
      .set("SortAscending", this.searchFilter.sortAscending.toString())
      .set("PageIndex", this.searchFilter.pageNumber.toString())
      .set("PageSize", this.searchFilter.pageSize.toString())
      .set("Id", this.item.Id.toString());
    this.rmmapi.getData("SupplierRawMaterialDocumentDetails/GetSupplierRawMaterialDocumentDetails", params).toPromise().then((resp: any) => {
      if (resp && resp.Status && resp.Data) {
        this.supplierRawMaterialDocumentDetailsinfo = {
          data: resp.Data.Data,
          total: resp.Data.TotalRecords
        };
      }
    });
  }

  GetDocumentTypes() {
    this.rmmapi.getData("DocumentTypes/GetDocumentTypes").toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.documentTypeList = res.Data;
      }
    });
  }

  SupplierRawMaterialDocumentDetailsModal(content, modalName) {
    this.actionType = true;
    this.IsEnablerDMSURL = false;
    this.myFiles = [];
    let currentdate = new Date();
    this.supplierRawMaterialDocumentDetailsModel.EffectiveDate = new Date(this.datepipe.transform(currentdate, "dd/MMM/yyyy"));
    this.IsCheckSupplierRawMaterialDocumentDetails = false;
    this.supplierRawMaterialDocumentDetailsModel = new SupplierRawMaterialDocumentDetails();
    var refe = this.modalService.open(content, { size: 'xl' });
    this.ReferenceModalList.push({
      modalName: modalName,
      modalInstance: refe
    });
    this.ReferenceModalList[0].modalInstance.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

    this.IsNoExpiryEnabled = false;
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

  IsDocumentEffectiveDateMandatory(SupplierRawMaterialDocumentDetailsform : any){
    
    if(SupplierRawMaterialDocumentDetailsform && this.IsNoExpiryEnabled) {
      return false; 
    } else if(this.supplierRawMaterialDocumentDetailsModel.EffectiveDate == undefined && this.supplierRawMaterialDocumentDetailsModel.EffectiveDate == null && !this.IsNoExpiryEnabled  ) { 

      return true;
    } else {
      return false;
    }
  }

  AddSupplierRawMaterialDocumentDetailsInfo(value, ConfirmationOnUrlFileChange, modalName) {
    if (this.supplierRawMaterialDocumentDetailsModel.Id > 0) {
      if (this.IsEnablerDMSURL != this.IsChangeDMSURLCheck) {
        this.ReferenceModalList.push({
          modalName: modalName,
          modalInstance: this.modalService.open(ConfirmationOnUrlFileChange, { size: 'sm' })
        });
      }
      else{
        this.ManageSupplierRawMaterialDocumentDetailsInfo();
      }
    } else { this.ManageSupplierRawMaterialDocumentDetailsInfo(); }
  }

  ManageSupplierRawMaterialDocumentDetailsInfo() {
    
    if (this.IsEnablerDMSURL) {
      var regEx = new RegExp('https?:\/\/'); // fragment locator
      this.InvalidUrl = !regEx.test(this.supplierRawMaterialDocumentDetailsModel.rDMSUrl.toString());

      try {
        let ss = this.supplierRawMaterialDocumentDetailsModel.rDMSUrl.toString().split('://')[1];
        this.InvalidUrl = ss === undefined;
        this.InvalidUrl = ss === null
        this.InvalidUrl = ss.length < 1;

      } catch (error) {
        this.InvalidUrl = true;
      }

      if (this.InvalidUrl) {
        this.ReferenceModalList.forEach(modal => {
          if (modal.modalName === "ConfirmationOnUrlFileChange") {
            modal.modalInstance.close();
          }
        });

        setTimeout(() => {
          this.InvalidUrl = false;
        }, 2500);
        return false;
      }
    }
    let params = new HttpParams().set("Name", this.supplierRawMaterialDocumentDetailsModel.Name)
      .set("Id", (this.supplierRawMaterialDocumentDetailsModel.Id ? this.supplierRawMaterialDocumentDetailsModel.Id : 0))
      .set('SupplierRawMaterialDetailId', this.item.Id);

    this.rmmapi.getData("SupplierRawMaterialDocumentDetails/CheckDuplicateSupplierRawMaterialDocumentDetails", params).toPromise().then((resp: any) => {
      this.IsCheckSupplierRawMaterialDocumentDetails = resp.Data;
      if (!this.IsCheckSupplierRawMaterialDocumentDetails) {

        this.supplierRawMaterialDocumentDetailsModel.EffectiveDate = this.datepipe.transform(this.supplierRawMaterialDocumentDetailsModel.EffectiveDate, "dd/MMM/yyyy");
        this.supplierRawMaterialDocumentDetailsModel.ExpiryDate = this.datepipe.transform(this.supplierRawMaterialDocumentDetailsModel.ExpiryDate, "dd/MMM/yyyy");

        if (this.supplierRawMaterialDocumentDetailsModel.Id == undefined) {
          this.supplierRawMaterialDocumentDetailsModel.SupplierRawMaterialDetailId = this.item.Id;
          this.supplierRawMaterialDocumentDetailsModel.StatusId = "117";
          this.supplierRawMaterialDocumentDetailsModel.CreatedBy = this.userName;
          this.supplierRawMaterialDocumentDetailsModel.UpdatedBy = this.userName;
          this.supplierRawMaterialDocumentDetailsModel.BatchNumber = this.supplierRawMaterialDocumentDetailsModel.BatchNumber;

          this.supplierRawMaterialDocumentDetailsModel.Validity = ( this.supplierRawMaterialDocumentDetailsModel.Validity === undefined)? 0 : this.supplierRawMaterialDocumentDetailsModel.Validity;
         
          const formData: FormData = new FormData();
          if (this.uplodaFileData != undefined)
            formData.append('myFile', this.uplodaFileData, this.uplodaFileData.name);
          formData.append('supplierRawMaterialDocumentDetailsobj', JSON.stringify(this.supplierRawMaterialDocumentDetailsModel));

         
          this.rmmapi.postFormData("SupplierRawMaterialDocumentDetails/AddSupplierRawMaterialDocumentDetails", formData).toPromise().then((resp: any) => {

            if (resp && resp.Status) {
             // this._notificationService.showSuccess("", this.supplierRawMaterialDocumentDetailsModel.Name + resp.Message);
             this._notificationService.showSuccess("", "Document Details added successfully"); 
             this.GetSupplierRawMaterialDocumentDetails();
            } else {
              // this._notificationService.showError("", resp.Message);
              this._notificationService.showError("", "Sorry, Document details could not be added");
            }


            this.ReferenceModalList.forEach(modal => {
              modal.modalInstance.close();
            });

            this.myFiles = [];
          })
        } else {
          const formData: FormData = new FormData();
          if (this.uplodaFileData != undefined)
            formData.append('myFile', this.uplodaFileData, this.uplodaFileData.name);
          this.supplierRawMaterialDocumentDetailsModel.UpdatedBy = this.userName;
          this.supplierRawMaterialDocumentDetailsModel.Validity = ( this.supplierRawMaterialDocumentDetailsModel.Validity === undefined)? 0 : this.supplierRawMaterialDocumentDetailsModel.Validity;
         
          
          formData.append('supplierRawMaterialDocumentDetailsobj', JSON.stringify(this.supplierRawMaterialDocumentDetailsModel));

          this.rmmapi.postFormData("SupplierRawMaterialDocumentDetails/UpdateSupplierRawMaterialDocumentDetails", formData).toPromise().then((resp: any) => {

            if (resp && resp.Status) {
              //this._notificationService.showSuccess("", this.supplierRawMaterialDocumentDetailsModel.Name + resp.Message);
              this._notificationService.showSuccess("", "Document Details updated successfully"); 
              this.GetSupplierRawMaterialDocumentDetails();
            } else {
             // this._notificationService.showError("", resp.Message);
              this._notificationService.showError("", "Sorry, Document details could not be updated");
            }

            this.ReferenceModalList.forEach(modal => {
              modal.modalInstance.close();
            });
            this.myFiles = [];
          });
        }
      }
    })
  }

  OnDocumentValidityChange(event) {
    this.IsNoExpiryEnabled = false;
    if (this.supplierRawMaterialDocumentDetailsModel.Validity != undefined && this.supplierRawMaterialDocumentDetailsModel.Validity >0  && this.supplierRawMaterialDocumentDetailsModel.Validity !== 11 && this.supplierRawMaterialDocumentDetailsModel.EffectiveDate != undefined && this.supplierRawMaterialDocumentDetailsModel.EffectiveDate != null) {

     
      let requiredDate = new Date(this.supplierRawMaterialDocumentDetailsModel.EffectiveDate.getFullYear() + this.supplierRawMaterialDocumentDetailsModel.Validity, this.supplierRawMaterialDocumentDetailsModel.EffectiveDate.getMonth(), this.supplierRawMaterialDocumentDetailsModel.EffectiveDate.getDate());
      this.supplierRawMaterialDocumentDetailsModel.ExpiryDate = this.datepipe.transform(requiredDate, 'dd/MMM/yyyy');
    } else if (this.supplierRawMaterialDocumentDetailsModel.Validity == 11  || this.supplierRawMaterialDocumentDetailsModel.Validity == 0) {
      this.IsNoExpiryEnabled = true;
    //  this.supplierRawMaterialDocumentDetailsModel.EffectiveDate = null;
      this.supplierRawMaterialDocumentDetailsModel.ExpiryDate = null;
    }
  }

  EditSupplierRawMaterialDocumentDetailsInfo(value1: any, value2: any, modalname: string) {
    
    this.myFiles = [];
    this.actionType = false;
    this.IsCheckSupplierRawMaterialDocumentDetails = true;
    if (value2.FileName != "" && value2.FileName != undefined && value2.FileName != null) {
      this.myFiles = [
        { name: value2.FileName, size: 500 }
      ];
      value2.rDMSUrl = "";
      this.IsEnablerDMSURL = false;
      this.IsChangeDMSURLCheck = false;
    }
    else {
      this.IsChangeDMSURLCheck = true;
      value2.FileName = "";
      value2.FilePath = "";
      this.IsEnablerDMSURL = true;
    }
    this.IsCheckSupplierRawMaterialDocumentDetails = false;
    this.supplierRawMaterialDocumentDetailsModel = value2;

    var effecctiveDate = new Date(this.datepipe.transform(value2.EffectiveDate, "dd/MMM/yyyy"));
 
    this.supplierRawMaterialDocumentDetailsModel.EffectiveDate = ((effecctiveDate.toLocaleDateString() == '1/1/1970')?null:new Date(this.datepipe.transform(value2.EffectiveDate, "dd/MMM/yyyy")));
    this.supplierRawMaterialDocumentDetailsModel.ExpiryDate = this.datepipe.transform(value2.ExpiryDate, "dd/MMM/yyyy")
    this.ReferenceModalList.push({
      modalName: modalname,
      modalInstance: this.modalService.open(value1, { size: 'xl' })
    });

    if (this.supplierRawMaterialDocumentDetailsModel.Id > 0) {
      this.DMSURL = this.supplierRawMaterialDocumentDetailsModel.rDMSUrl;
      this.FileName = this.supplierRawMaterialDocumentDetailsModel.FileName;
      this.IsNoExpiryEnabled = this.supplierRawMaterialDocumentDetailsModel.Validity === 11;
    } else {
      this.DMSURL = '';
    }
  }
  InActiveModalInfo(value1: any, value2: any, modalName: string) {
    this.supplierRawMaterialDocumentDetailsModel.Id = value2.Id;
    this.supplierRawMaterialDocumentDetailsModel.Name = value2.Name;

    this.ReferenceModalList.push({
      modalName: modalName,
      modalInstance: this.modalService.open(value1, { size: 'sm' })
    });
  }
  DeleteSupplierRawMaterialDocumentDetailsInfo() {
    this.rmmapi.postData("SupplierRawMaterialDocumentDetails/DeleteSupplierRawMaterialDocumentDetails", { Id: this.supplierRawMaterialDocumentDetailsModel.Id, UpdatedBy: this.userName, SupplierRawMaterialDetailId: this.item.Id }).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetSupplierRawMaterialDocumentDetails();
         // this._notificationService.showSuccess("", this.supplierRawMaterialDocumentDetailsModel.Name + resp.Message);
         this._notificationService.showSuccess("", "Document deleted successfully");
        } else {
          this._notificationService.showWarning("", this.supplierRawMaterialDocumentDetailsModel.Name + resp.Message);
        }
        this.ReferenceModalList.forEach(modal => {
          modal.modalInstance.close();
        });
      } else {
        this._notificationService.showError("", resp.Message);
      }
    })
  }
  IsCheckSupplierRawMaterialDocumentDetailsInfo() {
    if (this.supplierRawMaterialDocumentDetailsModel.Name !== undefined && this.supplierRawMaterialDocumentDetailsModel.Name.length === 0) {
      this.supplierRawMaterialDocumentDetailsModel.Name = '';
    } else {
      let params = new HttpParams().set("Name", this.supplierRawMaterialDocumentDetailsModel.Name)
      .set("Id", (this.supplierRawMaterialDocumentDetailsModel.Id ? this.supplierRawMaterialDocumentDetailsModel.Id : 0))
      .set('SupplierRawMaterialDetailId', this.item.Id);
      this.rmmapi.getData("SupplierRawMaterialDocumentDetails/CheckDuplicateSupplierRawMaterialDocumentDetails", params).toPromise().then((resp: any) => {
        this.IsCheckSupplierRawMaterialDocumentDetails = resp.Data;
      });
    }
  }
  UploadImage1(event) {
    if (event.files.length > 0) {
      this.myFiles = [];
      this.uplodaFileData = event.files[0].rawFile;
      this.myFiles = [{ name: event.files[0].name, size: event.files[0].size }]
    }
  }

  GoToCheckList() {
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
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "Id asc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }
  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber = event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetSupplierRawMaterialDocumentDetails();
  }
  sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Id asc";
    this.searchFilter.sortExpression = sort[0].dir != undefined ? sort[0].field : "SubComponentName";
    this.searchFilter.sortAscending = sort[0].dir != undefined ? (sort[0].dir === 'desc' ? 0 : 1) : 0;
    this.GetSupplierRawMaterialDocumentDetails();
  }
  DonwloadFile(fileName: string) {
    this.commonService.DownloadFile(fileName);
  }
  SelectrDMSURL(event, ConfirmationOnUrlFileChange, modalName: string) {
    
    this.IsEnablerDMSURL = event.target.checked;
    if (this.IsEnablerDMSURL) {
      this.ResetUploadedFiles();
      this.supplierRawMaterialDocumentDetailsModel.rDMSUrl = this.DMSURL = '';
    }
    else {
      this.DMSURL = this.supplierRawMaterialDocumentDetailsModel.rDMSUrl = "";
      this.FileName = '';
      this.supplierRawMaterialDocumentDetailsModel.FileName = this.FileName
    }
  }

  OnChangeConfirmationOnUrlFile() {
    this.ManageSupplierRawMaterialDocumentDetailsInfo();
  }

  ResetUploadedFiles() {
    this.myFiles = [];
    this.uplodaFileData = undefined;
    this.supplierRawMaterialDocumentDetailsModel.fileName = '';
    this.supplierRawMaterialDocumentDetailsModel.FilePath = '';
  }
  CancelTheFileUrlChange() {
    var element = <HTMLInputElement>document.getElementById("DMSURLCheckBoxElement");
    if (element) {
      element.checked = this.IsEnablerDMSURL;
    }
    this.ReferenceModalList.forEach(modal => {
      if (modal.modalName === "ConfirmationOnUrlFileChange") {
        modal.modalInstance.close();
      }
    });
  }
  CancelDocumentUpdate(modal: any) {
    this.GetSupplierRawMaterialDocumentDetails();
    modal.dismiss('Cross click');
  }
}
