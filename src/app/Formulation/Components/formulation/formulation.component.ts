import { HttpParams } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';

import { EnvService } from 'src/app/shared/services/env.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { FormulationDetails } from '../../Models/formulation-details';
import {
  GridDataResult,
  PageChangeEvent,
  SelectableSettings
} from "@progress/kendo-angular-grid";
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { FormulationService } from '../../Services/formulation.service';
import { FormulationRawMaterials } from '../../Models/formulation-raw-materials';
import { FormulationRawMaterialSubComponents } from '../../Models/formulation-raw-material-sub-components';
import { PaginationDefalts, PrivilegCodes, SearchFilter } from 'src/app/shared/constants/global.constants';
import { SortDescriptor } from '@progress/kendo-data-query';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { StatusName } from '../../../shared/constants/application.constants';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';

@Component({
  selector: 'app-formulation',
  templateUrl: './formulation.component.html',
  styleUrls: ['./formulation.component.css']
})
export class FormulationComponent implements OnInit {

  registerForm: FormGroup;
  formulationForm: FormGroup;
  submitted = false;
  ShowActivated = false;
  public formulationList: GridDataResult;
  public formulationVersionsList: GridDataResult;
  public selectableSettings: SelectableSettings;

  public pageSize = 10;
  public skip = 0;
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  AccessToIF = true;
  AccessToFV = true;
  AccessToMF = true;
  AccessToERC = true;
  AccessToRRC = true;
  AccessToCF = true;
  ShowVersionName: boolean = false;
  public allProductsInfo: any[] = [];
  public allProductCategoriesInfo: any[] = [];
  public allFormulationInfo: any[] = [];
  public allMarkets: any[] = [];
  public formulationInfoModel: any = new FormulationDetails();
  private formulationInfoModelTemp: any = new FormulationDetails();
  public cloneFormulationInfoModel: any = new FormulationDetails();
  public formulationRawMaterialsModel: FormulationRawMaterials = new FormulationRawMaterials();
  public newSubComponentRawMaterialInfo: FormulationRawMaterials = new FormulationRawMaterials();
  public formulationRawMaterials: FormulationRawMaterials[] = [];
  public supplierRawMaterialInfo: any[] = [];
  public rawMaterialInfoList: any[] = [];
  public tradeList:any[] = [];
  minorVersionsList: any[] = [];
  magerVersionsList: any[] = [];
  isConfigureSubComponents: boolean = false;
  public defaultItem: { Name: string; Id: any } = {
    Name: "-- Select --",
    Id: null,
  };
  public defaultItemMaterial: { Name: string; RawMaterialId: any } = {
    Name: "-- Select --",
    RawMaterialId: null,
  };

  userName: any = "";
  actionType = true;
  public allStatusInfo: any[] = [];
  IsCheckFormulationDetails: boolean = false;
  public checkversion: boolean = true;
  IsCopyRawMaterial: boolean = false;
  createVersion: boolean = true;
  IsFormulation: boolean = true;
  isFormulationDisable: boolean = true;
  isVersionFormulation: boolean = false;
  isCloneFormulationEnable: boolean = false;
  allVersionDesc: any[] = [];
  allVersionsInfo: any[] = [];
  allRawMaterialInfo: any[] = [];
  subComponentFunctionList: any[] = [];

  moduleName: any = "VersionChangeDetails";
  public selectedCheckFormulationObj: any = {};
  public defaultItemf: { text: string; value: number } = {
    text: "Select item...",
    value: null,
  };
  Model: any;
  subComponentList: any;
  subComponentRMList: any;
  public data: Array<{ Name: string; Id: number }>;
  public createVersionFormulation: boolean = false;
  public CheckCopyVersionFormulation: boolean = false;
  public defaultVersion: any;
  isVersionDropdown: boolean = false;
  selectedVersion: string;
  public listVersions: Array<string> = [];
  public listVersionsMager: Array<string> = [];
  public listVersionsMiner: Array<string> = [];

  searchFilter: SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [{ field: 'ProductName', dir: 'asc' }];
  @ViewChild('Formulation', { static: false }) Formulation;
  DisableMarkets: boolean;
  HideMarketEditBtn = false;
  HideMarketCancelBtn = false;
  MarketListTemp = [];
  public isEditFormulationCancel:boolean=false;
  constructor(
    private formBuilder: FormBuilder,
    private _formulationService: FormulationService,
    public env: EnvService,
    public rmmapi: RMMApiService,
    public _appService: AppService,
    private modalService: NgbModal,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public _notificationService: NotificationService) {
    this.actionType = false;

    this.setSelectableSettings();
    this.formulationReviewCommentForm = new FormGroup({
      RawMaterialId: new FormControl(""),
      ManufacturerId: new FormControl(""),
      SupplierId: new FormControl(""),
      TradeName: new FormControl(""),
      SubComponentId: new FormControl(""),
      MarketId: new FormControl(""),
      Comment: new FormControl(""),
      CommentAssignedTo: new FormControl(""),
      CommentDueDate: new FormControl(""),
      CommentsReplied: new FormControl("")
    });

  }
  public setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'single',
      drag: false,
    };
  }


  ngOnInit(): void {
    
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.userName = this.rmmapi.getUserName();
    this._appService.setHeaderUserName(this.rmmapi.getUserName());
    this._appService.setHeaderShow(true);
    this._appService.setHeaderTitle("Formulations")
    this.setDefaults();
    this.GetProducts();
    this.GetStatus();
    this.GetMarkets();


    this._formulationService.GetFunctions()
    this._formulationService.GetSuppliers();
    this._formulationService.GetManufacturers();
    this._formulationService.GetFormulationRawMaterials();
    this.registerForm = this.formBuilder.group({
      FormulationReferenceNo: ['', Validators.required],
      ProductName: ['', Validators.required],
      ProductCategory: ['', Validators.required],
      VersionNo: ['', Validators.required],
      RDContact: [''],
      Markets: ['', Validators.required],
      Version: ['Major', Validators.required],
      Project: [''],
      ReasonForChange: [''],

    });
    this.formulationForm = this.formBuilder.group({
      ProductName: ['', Validators.required],
      FormulationReferenceNo: ['', Validators.required],
      ProductCategory: ['', Validators.required],
      VersionNo: ['', Validators.required],
      RDContact: [''],
      Markets: ['', Validators.required],
      Version: new FormControl('Major'),
      Project: [''],
      ReasonForChange: [''],
      CheckCopyVersionFormulation: [false],
      listVersionNo: []

    });
    this.selectedVersion = "Major";
    this.formulationForm.get('Version').disable();
    this.AccessToFV = this.rmmapi.getRolePrivilege(PrivilegCodes.FV).toString() === 'true' ? true : false;
    this.AccessToMF = this.rmmapi.getRolePrivilege(PrivilegCodes.MF).toString() === 'true' ? true : false;
    this.AccessToIF = this.rmmapi.getRolePrivilege(PrivilegCodes.IF).toString() === 'true' ? true : false;
    this.AccessToERC = this.rmmapi.getRolePrivilege(PrivilegCodes.ERC).toString() === 'true' ? true : false;
    this.AccessToCF = this.rmmapi.getRolePrivilege(PrivilegCodes.CF).toString() === 'true' ? true : false;
    this.AccessToRRC = this.rmmapi.getRolePrivilege(PrivilegCodes.RRC).toString() === 'true' ? true : false;
    let formulationId = parseInt(this.rmmapi.getStorage(this.env.CurrentTabState.Id));
    let sessionTab = this.rmmapi.getStorage(this.env.CurrentTabState.TabName);


    if (formulationId !== undefined && formulationId !== NaN &&  sessionTab !== undefined && sessionTab !== 'undefined' && sessionTab !== null) {
      this.IsFormulation = false;
      this.formulationInfoModel.Id = formulationId;
      this.tabchange(sessionTab);
    }



  }
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "Id Desc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
    this.isMarkedUpdate = false;
  }
  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber = event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetFormulationDetails();
  }

  sortChange(sort: SortDescriptor[]): void {

    if (sort[0].field == 'FormulationReferenceNoandVersionNo') {
      sort[0].field = "FormulationReferenceNo";
    }
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Id Desc";
    this.sort = sort;
    this.GetFormulationDetails();
  }

  public onSelectedKeysChange(event) {
    if (event.selectedRows.length > 0 && !event.selectedRows[0].dataItem.IsDeleted) {
      this.isCloneFormulationEnable = true;
      this.selectedCheckFormulationObj = event.selectedRows[0].dataItem;
    }
    else {
      this.isCloneFormulationEnable = false;
      this.selectedCheckFormulationObj = {};
      this.cloneFormulationInfoModel = {};
    }
  }
  async CloneFormulations(content) {
    
    this.ShowVersionName = false;
    this.emailType = 1;
    this.formulationInfoModel = new FormulationDetails();
    this.formulationInfoModel.Id = this.selectedCheckFormulationObj.Id;
    this.formulationInfoModel.VersionNo = "1.0";//this.selectedCheckFormulationObj.VersionNo;
    this.formulationInfoModel.ReasonForChange = this.selectedCheckFormulationObj.ReasonForChange;
    this.formulationInfoModel.Project = this.selectedCheckFormulationObj.Project;
    this.formulationInfoModel.R_DContact = this.selectedCheckFormulationObj.R_DContact;
    this.formulationInfoModel.ProductId = this.selectedCheckFormulationObj.ProductId;
    this.formulationInfoModel.ProductCategoriesId = this.selectedCheckFormulationObj.ProductCategoriesId;
    this.formulationInfoModel.Products = this.allProductsInfo.filter(item => item.Id == this.selectedCheckFormulationObj.ProductId)[0];
    this.formulationInfoModel.ProductCategories = this.allProductCategoriesInfo.filter(item => item.Id == this.selectedCheckFormulationObj.ProductCategoriesId)[0];
    await this.GetMarketsByFormulationDetailsId(this.selectedCheckFormulationObj.Id);
    this.formulationInfoModel.FormulationReferenceNo = '';// this.selectedCheckFormulationObj.FormulationReferenceNo;
    this.GetFormulationRawMaterialsDetails(this.selectedCheckFormulationObj.Id);
    this.cloneFormulationInfoModel.Id = this.selectedCheckFormulationObj.Id;
    this.cloneFormulationInfoModel.CloneFormulationReferenceNo = this.selectedCheckFormulationObj.FormulationReferenceNo;
    this.cloneFormulationInfoModel.CloneVersionNo = this.selectedCheckFormulationObj.VersionNo;
    this.cloneFormulationInfoModel.CloneR_DContact = this.selectedCheckFormulationObj.R_DContact;
    this.cloneFormulationInfoModel.CloneProject = this.selectedCheckFormulationObj.Project;
    this.cloneFormulationInfoModel.CloneReasonForChange = this.selectedCheckFormulationObj.ReasonForChange;
    this.cloneFormulationInfoModel.CloneProducts = this.allProductsInfo.filter(item => item.Id == this.selectedCheckFormulationObj.ProductId)[0];
    this.cloneFormulationInfoModel.CloneProductCategories = this.formulationInfoModel.ProductCategories;
    this.modalReference = this.modalService.open(content, { size: 'xl' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  GetFormulationRawMaterialsDetails(formulationDetailId: number) {
    this.formulationRawMaterials = [];
   // let params = new HttpParams().set("Id", formulationDetailId.toString());
    let params = new HttpParams().set("Id", formulationDetailId.toString()).set("PageSize",'10000').set("PageNumber", '0')
    .set("Sort",'Id asc');
    this.rmmapi.getData("FormulationRawMaterials/GetFormulationRawMaterials", params).toPromise().then((resp: any) => {
     
      let RawMaterials = resp.Data.FormulationRawmaterialDetailsList;  
      RawMaterials.forEach(element => {
        
        this.formulationRawMaterialsModel = new FormulationRawMaterials();
        this.formulationRawMaterialsModel = element;
        if (this.env.rawMaterialsList.length > 0)
          this.formulationRawMaterialsModel.RawMaterialIds = this.env.rawMaterialsList.filter(item => item.RawMaterialId == element.RawMaterialId)[0];;
        this.formulationRawMaterials.push(this.formulationRawMaterialsModel)
      })
    })
  }
  RawMaterialChange(event) {
    if (event.RawMaterialId != null) {
      this.isConfigureSubComponents = true
      this.formulationRawMaterialsModel.RawMaterialDetailsId = event.Id;
      this.formulationRawMaterialsModel.SupplierId = event.SupplierId;
      this.formulationRawMaterialsModel.ManufacturerId = event.ManufacturerId;
      this.formulationRawMaterialsModel.TradeName = event.TradeName;
      this.GetSupplierRawMaterialSubComponentDetails(event.Id)
      this.GetRawMaterialFunctionsBySupplierRawMaterialDetailId(event.Id);
    }
  }
  PostReactionSubcomponentRawMaterialChange(event) {
    if (event.RawMaterialId != null) {
      this.newSubComponentRawMaterialInfo.RawMaterialDetailsId = event.Id;
      this.newSubComponentRawMaterialInfo.SupplierId = event.SupplierId;
      this.newSubComponentRawMaterialInfo.ManufacturerId = event.ManufacturerId;
      this.newSubComponentRawMaterialInfo.TradeName = event.TradeName;
      this.GetNewSupplierRawMaterialSubComponentDetails(event.Id)
      this.GetNewRawMaterialFunctionsBySupplierRawMaterialDetailId(event.Id);
    }
  }
  GetNewRawMaterialFunctionsBySupplierRawMaterialDetailId(id) {
    this.rmmapi.postData("SupplierRawMaterialDetails/GetRawMaterialFunctionsBySupplierRawMaterialDetailId", { Id: id }).toPromise().then((resp: any) => {
      this.newSubComponentRawMaterialInfo.RawMaterialFunctions = resp.Data;
    });
  }
  GetNewSupplierRawMaterialSubComponentDetails(id) {
    this.newSubComponentRawMaterialInfo.FormulationRawMaterialSubComponents = [];
    let params = new HttpParams().set("Id", id)
      .set("SortExpression", "ID")
      .set("SortAscending", "0")
      .set("PageIndex", "0")
      .set("PageSize", "100000");
    this.rmmapi.getData("SupplierRawMaterialSubComponentDetails/GetSupplierRawMaterialSubComponentDetails", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.supplierRawMaterialInfo = res.Data;
        this.supplierRawMaterialInfo.forEach(element => {
          let obj = new FormulationRawMaterialSubComponents();
          obj.SubComponentName = element.GivenSubComponentName;
          obj.SubComponentFunctionName = element.SubComponentFunctionName;
          obj.Impurity = element.Impurities;
          obj.EUINCIName = element.EUINCIName;
          obj.USINCIName = element.USINCIName;
          obj.SubComponentId = element.SubComponentId;
          obj.ECNumberOrKENumber = element.ECNumberOrKENumber;
          obj.CASNumber = element.CASNumber;
          if (this.subComponentFunctionList.length > 0)
            obj.SubComponentFunctions = this.subComponentFunctionList.filter(item => item.SupplierRawMaterialSubComponentDetailId == element.Id);
          this.newSubComponentRawMaterialInfo.FormulationRawMaterialSubComponents.push(obj);
        });
      }
    });
  }
  GetSupplierRawMaterialSubComponentDetails(id) {
    this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents = [];
    let params = new HttpParams().set("Id", id)
      .set("SortExpression", "ID")
      .set("SortAscending", "0")
      .set("PageIndex", "0")
      .set("PageSize", "100000");
    this.rmmapi.getData("SupplierRawMaterialSubComponentDetails/GetSupplierRawMaterialSubComponentDetails", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.supplierRawMaterialInfo = res.Data;
        this.supplierRawMaterialInfo.forEach(element => {
          let obj = new FormulationRawMaterialSubComponents();
          obj.SubComponentName = element.GivenSubComponentName;
          obj.SubComponentFunctionName = element.SubComponentFunctionName;
          obj.Impurity = element.Impurities;
          obj.EUINCIName = element.EUINCIName;
          obj.USINCIName = element.USINCIName;
          obj.SubComponentId = element.SubComponentId;
          obj.ECNumberOrKENumber = element.ECNumberOrKENumber;
          obj.CASNumber = element.CASNumber;
          if (this.subComponentFunctionList.length > 0)
            obj.SubComponentFunctions = this.subComponentFunctionList.filter(item => item.SupplierRawMaterialSubComponentDetailId == element.Id);
          this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents.push(obj);
        });
      }
    });
  }
  AddNewPostReactionSubcomponent(content) {
    
    this.newSubComponentRawMaterialInfo = new FormulationRawMaterials();
    this.modalReference.close();
    this.modalReference = this.modalService.open(content, { size: 'xl' });
  }
  AddPostReactionSubcomponent(SubComponentsRawMaterials) {
    
    this.modalReference.close();
    this.modalReference = this.modalService.open(SubComponentsRawMaterials, { size: 'xl' });
  }
  CloneFormulationClose(CloneFormulation) {
    this.cloneFormulationInfoModel = {};
    this.rmmapi.removeStorage(this.env.CurrentTabState.Id);
    this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
    this.modalReference.close(CloneFormulation);
  }
  VersionSelect(value) {
    if (value == "Major") {
      this.selectedVersion = "Major";
      this.listVersions = this.listVersionsMager.filter((a, b) => this.listVersionsMager.indexOf(a) === b);
      // if(this.defaultVersion.split('.')[1]=="0")
      // {
      // }
      // else{
      //   this.formulationInfoModel.VersionNo= (parseInt(this.defaultVersion.split('.')[0])+1)+".0";
      // }
      this.formulationInfoModel.VersionNo = (parseInt(this.defaultVersion.split('.')[0]) + 1) + ".0";
    }
    else {
      this.listVersions = this.listVersionsMiner.filter((a, b) => this.listVersionsMiner.indexOf(a) === b);
      this.selectedVersion = "Minor";
      if (this.defaultVersion.split('.')[1] == "0") {
        let version = this.minorVersionsList.filter(item => item.VersionNo.split('.')[0] == this.formulationInfoModel.VersionNo.split('.')[0]);
        if (version.length > 0) {
          let versions = version.sort((a, b) => b.Id - a.Id);
        }
        else {
          this.formulationInfoModel.VersionNo = this.defaultVersion.split('.')[0] + "." + (parseInt(this.defaultVersion.split('.')[1]) + 1);
        }
      }
      else {
        this.formulationInfoModel.VersionNo = this.defaultVersion.split('.')[0] + "." + (parseInt(this.defaultVersion.split('.')[1]) + 1);
      }
    }
  }
  SaveCopyFormulationRawMaterials(Formulation) {
    this.CheckCopyVersionFormulation = true;
    this.modalReference.close();
    this.modalReference = this.modalService.open(Formulation, { size: 'xl' });
  }
  CloseCopyFormulationRawMaterials(Formulation) {
    
    this.isVersionFormulation = false;
    this.isFormulationDisable = true;
    this.checkversion = true;
    this.CheckCopyVersionFormulation = false;
    this.modalReference.close();
    this.modalReference = this.modalService.open(Formulation, { size: 'xl' });
  }
  emailType: number;
  FormulationModal(content) {
    this.formulationForm.reset();
    this.createVersionFormulation = false;
    this.emailType = 0;
    this.checkversion = false;
    this.actionType = true;
    this.ShowVersionName = false;
    this.IsCopyRawMaterial = false;
    this.formulationInfoModel = new FormulationDetails();
    this.formulationInfoModel.VersionNo = "1.0";
    this.modalReference = this.modalService.open(content, { size: 'xl' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  FormulationRadioDivModal(content) {
    this.isVersionRadioButton = true;
    this.modalReference = this.modalService.open(content, { size: 'medium' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  isMarkedUpdate: boolean = false;
  isVersionRadioButton: boolean = true;
  AddMarketsInfo(form: NgForm, templateName) {
    var content = form.value["OldNew"];
    this.isMarkedUpdate = true;
    this.HideMarketEditBtn = true;
    this.HideMarketCancelBtn = false;
    this.DisableMarkets = false;
    this.isVersionRadioButton = false;
    if (content === 'new') {
      this.CreateNewVersion(templateName);
    } else if (content === "old") {
      content = 'FormulationRadioDiv';
      this.DisableMarkets = false;
      this.updateFormulationStatus(StatusName.MarketChange);
    }
    this.modalReference.close();
  }

  changeRadiobutton(event : any) {
    console.log(event);
    if(event.target.checked) {
      this.isVersionRadioButton = false;
    }    
  }

  updateFormulationStatus(statusCode: string) {
    let model: any = {};
    model.FormulationDetailId = this.formulationInfoModel.Id;
    model.StatusCode = statusCode; // StatusName.MarketChange;
    model.FormulationReferenceNo = model.FormulationReferenceNo;
    model.RDContact = model.RDContact;
    model.Project = model.Project;
    model.ReasonForChange = model.ReasonForChange;
    model.UpdatedBy = this.rmmapi.getUserName();
    this.rmmapi.postData("FormulationTranscriptSummary/UpdateFormulationDetailStatus", model).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        this._notificationService.showSuccess("", this.formulationInfoModel.ProductName + " Status " + resp.Message);
        this.GetFormulationById(this.formulationInfoModel.Id);
      }
    });
  }

  CancelAddMarketsInfo() {
    this.updateFormulationStatus(StatusName.IngredientListApproved);
   
  }
  CopyFormulationModal(copyformulationcontent, formulationcontent) {
    this.modalReference.close(formulationcontent);
    this.modalReference = this.modalService.open(copyformulationcontent, { size: 'xl' });
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
  NavigateFormulations() {
    
    this.modalReference.close();
    this.allVersionsInfo = this.allVersionsInfo.sort((a, b) => b.Id - a.Id);
    if (this.allVersionsInfo[0].IsDeleted) {
        
        // this.router.navigate(['Formulations'])
    }
    this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
    this.rmmapi.removeStorage(this.env.CurrentTabState.Id);
    location.reload();
  }
  GetFormulationSourceVersions(event)
  {
    let id=this.allVersionsInfo.filter(item=> item.VersionNo==event)[0].Id;
    this.GetFormulationRawMaterialsDetails(id);
    this.GetMarketsByFormulationDetailsId(id);
  }
  NavigateVersionChangeDetails(copyFormulationContent) {
    this.modalReference.close(copyFormulationContent);
    this.router.navigate(['VersionChangeDetails', { skipLocationChange: true }])
  }
  GetProducts() {
    this.rmmapi.getData("Products/GetProducts").toPromise().then((res: any) => {
      this.allProductsInfo = res.Data;
      this.GetProductCategories();
    });
  }
  OnProductsChange(event, type: string) {
    if (event.Id != null) {
      if (this.allProductCategoriesInfo.length > 0) {
        this.allProductCategoriesInfo.filter(item => item.Id == event.ProductCategoriesId)[0].Id;
        if (this.allProductCategoriesInfo.filter(item => item.Id == event.ProductCategoriesId).length > 0)
          this.formulationInfoModel.ProductCategories = this.allProductCategoriesInfo.filter(item => item.Id == event.ProductCategoriesId)[0];
      }
    } else {
      //this.allProductCategoriesInfo = [];
      this.formulationInfoModel.ProductCategories = null;
      this.formulationInfoModel.Products = null;
      if (type == 'clone') {
        this.registerForm.controls["ProductName"].patchValue(null);
        this.registerForm.controls["ProductName"].setValidators(Validators.required);
        this.registerForm.controls["ProductName"].updateValueAndValidity();
      } else {
        this.formulationForm.controls["ProductName"].patchValue(null);
        this.formulationForm.controls["ProductName"].setValidators(Validators.required);
        this.formulationForm.controls["ProductName"].updateValueAndValidity();
      }
    }
  }
  GetFormulationVersions(event: any = 1) {
    if (event.Id === null) {
      this.formulationForm.controls["ProductCategory"].setValue(null);
      return;
    }
    this.allVersionsInfo = [];
    if (this.formulationInfoModel.ProductId == undefined && this.formulationInfoModel.ProductCategoriesId == undefined) {
      this.formulationInfoModel.ProductId = this.formulationInfoModel.Products.Id;
      this.formulationInfoModel.ProductCategoriesId = this.formulationInfoModel.ProductCategories.Id;
    }


    if (this.formulationInfoModel.ProductId != undefined && this.formulationInfoModel.ProductCategories != undefined) {
      let params = new HttpParams().set("productId", this.formulationInfoModel.Products.Id)
        .set("productCategoriesId", this.formulationInfoModel.ProductCategories.Id)
        .set("formulationReferenceNo", this.formulationInfoModel.FormulationReferenceNo);
      this.rmmapi.getData("FormulationDetails/GetFormulationVersions", params).toPromise().then((resp: any) => {
        this.allVersionsInfo = resp.Data;
      })
    }
  }
  GetFormulationDetails() {
    this.isFGridLoading = true;
    let params = new HttpParams()
      .set("PageSize", this._appService.formulationId ? "0" : this.searchFilter.pageSize.toString())
      .set("PageNumber", this._appService.formulationId ? "0" : this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort).set("id", "0")
      .set("type", "type")
      .set("InActive", (this.ShowActivated ? 1 : 0).toString());
    this.rmmapi.getData("FormulationDetails/GetFormulationDetails", params).toPromise().then((res: any) => {
      this.isFGridLoading = false;
      this.allFormulationInfo = res.Data;
      if (this._appService.formulationId) {
        let dataItem = res.Data.FormulationDetailsList.find(x => x.Id == this._appService.formulationId);
        if (this._appService.commingFrom == "Formulation") {
          this.EditFormulationDetailsInfo(this._appService.actionType, this.Formulation, dataItem);
          this._appService.formulationId = undefined;
          this._appService.commingFrom = undefined;
          this._appService.actionType = undefined;
        } else if (this._appService.commingFrom == "Review") {
          this.EditFormulationDetailsInfo("View", this.Formulation, dataItem);
          this.ReviewSetDefaults();
          this.GetFormulationReviewComments();
        }
        this.formulationList = {
          data: res.Data.FormulationDetailsList.slice(0, 10),
          total: res.Data.FormulationDetailsList && res.Data.FormulationDetailsList.length > 0 ? res.Data.FormulationDetailsList[0].TotalRecords : 0
        };
      } else {
        this.formulationList = {
          data: res.Data.FormulationDetailsList,
          total: res.Data.FormulationDetailsList && res.Data.FormulationDetailsList.length > 0 ? res.Data.FormulationDetailsList[0].TotalRecords : 0
        };
      }
    });
  }

  GetProductCategories() {
    this.rmmapi.getData("ProductCategories/GetProductCategories").toPromise().then((res: any) => {
      this.allProductCategoriesInfo = res.Data;
      this.GetFormulationDetails();
    });
  }
  GetMarkets() {
    this.rmmapi.getData("Markets/GetMarkets").toPromise().then((res: any) => {
      if (res && res.Data) {
        this.allMarkets = res.Data;
      }
    });
  }
  GetStatus() {
    this.rmmapi.getData("Status/GetStatus").toPromise().then((res: any) => {
      this.allStatusInfo = res.Data;
    });
  }
  isFGridLoading: boolean = false;
  ShowInactiveFormulation(event) {
    this.isCloneFormulationEnable = false;
    this.selectedCheckFormulationObj = {};
    this.cloneFormulationInfoModel = {};
    this.searchFilter.pageSize = 10;
    this.searchFilter.pageNumber = 1;
    this.searchFilter.sort = 'Id DESC';
    this.isFGridLoading = true;
    if (event.currentTarget.checked) {
      this.ShowActivated = true;
      let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
        .set("Sort", this.searchFilter.sort).set("id", "0").set("type", "type").set("InActive", "1");
      this.rmmapi.getData("FormulationDetails/GetFormulationDetails", params).toPromise().then((res: any) => {
        this.isFGridLoading = false;
        this.allFormulationInfo = res.Data;
        this.formulationList = {
          data: res.Data.FormulationDetailsList,
          total: res.Data.FormulationDetailsList && res.Data.FormulationDetailsList.length > 0 ? res.Data.FormulationDetailsList[0].TotalRecords : 0
        };
      });
    }
    else {
      this.ShowActivated = false;
      let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
        .set("Sort", this.searchFilter.sort).set("id", "0").set("type", "type").set("InActive", "0");
      this.rmmapi.getData("FormulationDetails/GetFormulationDetails", params).toPromise().then((res: any) => {
        this.isFGridLoading = false;
        this.allFormulationInfo = res.Data;
        this.formulationList = {
          data: res.Data.FormulationDetailsList,
          total: res.Data.FormulationDetailsList && res.Data.FormulationDetailsList.length > 0 ? res.Data.FormulationDetailsList[0].TotalRecords : 0
        };
      });
    }
  }

  validateMarketList() {
    let marketCount: number = 0;
    this.marketListId.forEach(element => {
      this.formulationInfoModel.Markets.forEach(market => {
        if (element.Id == market.Id) {
          marketCount = marketCount + 1;
        }
      });
    });
    if (marketCount === this.formulationInfoModel.Markets.length && marketCount === this.marketListId.length) {
      return false;
    } else {
      return true;
    }
  }

  UpdateFormulationInfo() {

    this.HideMarketCancelBtn = this.HideMarketEditBtn = true;
    if (this.formulationInfoModel.StatusCode != "FSN") {
      this.formulationInfoModel.isMarketUpdate = this.validateMarketList();
    } else {
      this.formulationInfoModel.isMarketUpdate = false;
    }
    this.formulationInfoModel.UpdatedBy = this.userName;
    this.formulationInfoModel.IsMarketUpdated = this.isMarkedUpdate;
    if (this.formulationList != null && this.formulationList.data.filter(item => item.Id === this.formulationInfoModel.Id).length > 0) {
      var marketNamesCount = this.formulationList.data.filter(item => item.Id === this.formulationInfoModel.Id)[0].MarketNames.split(',');
      if (this.formulationInfoModel.Markets.length > marketNamesCount.length) {
        if (this.formulationInfoModel.StatusCode === 'ILA') {
          this.formulationInfoModel.StatusId = this.allStatusInfo.filter(item => item.Code === "FMC")[0].Id;
          this.formulationInfoModel.StatusCode = this.allStatusInfo.filter(item => item.Code === "FMC")[0].Code;
        }
        this.formulationInfoModel.R_DContact = this.formulationInfoModel.R_DContact == undefined ? "" : this.formulationInfoModel.R_DContact;
        this.formulationInfoModel.Project = this.formulationInfoModel.Project == undefined ? "" : this.formulationInfoModel.Project;
        this.formulationInfoModel.ReasonForChange = this.formulationInfoModel.ReasonForChange == undefined ? "" : this.formulationInfoModel.ReasonForChange;
      }
    }
    this.rmmapi.postData("FormulationDetails/UpdateFormulationDetails", this.formulationInfoModel).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (this.formulationInfoModel.StatusCode === 'ILA') {
          this.formulationInfoModel.StatusId = this.allStatusInfo.filter(item => item.Code === "FMC")[0].Id;
          this.formulationInfoModel.StatusCode = this.allStatusInfo.filter(item => item.Code === "FMC")[0].Code;
          this.formulationInfoModel.StatusName = this.allStatusInfo.filter(item => item.Code === "FMC")[0].Name;
          this.tabchange("MarketRegulations");
        }
        this._notificationService.showSuccess("", "Version & Change Details updated successfully");
        this.isMarkedUpdate = false;
        this.GetFormulationById(this.formulationInfoModel.Id);
        this.actionType = false;
      } else {
        // this._notificationService.showError("", resp.Message);
        this._notificationService.showError("","Sorry, new Post-reaction Sub-component could not be added");
      }
    });
  }
  AddFormulationInfo(buttonType, AllVersion) {
    if (this.formulationForm.valid) {
      if (this.createVersionFormulation != true) {
        if (this.formulationInfoModel.Id == undefined) {
          let params = new HttpParams().set("Name", this.formulationInfoModel.FormulationReferenceNo).set("Id", "0");
          this.rmmapi.getData("FormulationDetails/CheckDuplicateFormulationDetails", params).toPromise().then((resp: any) => {
            this.IsCheckFormulationDetails = resp.Data;
            if (!this.IsCheckFormulationDetails) {
              this.formulationInfoModel.CreatedBy = this.userName;
              this.formulationInfoModel.UpdatedBy = this.userName;
              this.formulationInfoModel.EmailType = this.emailType;
              this.formulationInfoModel.ProductCategoriesId = this.formulationInfoModel.ProductCategories.Id;
              this.formulationInfoModel.ProductId = this.formulationInfoModel.Products.Id;
              this.formulationInfoModel.StatusId = this.allStatusInfo.filter(item => item.Code == "FSN")[0].Id;
              this.formulationInfoModel.StatusName = this.allStatusInfo.filter(item => item.Code == "FSN")[0].Name;
              this.formulationInfoModel.FormulationReferenceNo = this.formulationInfoModel.FormulationReferenceNo == undefined ? "" : this.formulationInfoModel.FormulationReferenceNo;
              this.formulationInfoModel.R_DContact = this.formulationInfoModel.R_DContact == undefined ? "" : this.formulationInfoModel.R_DContact;
              this.formulationInfoModel.Project = this.formulationInfoModel.Project == undefined ? "" : this.formulationInfoModel.Project;
              this.formulationInfoModel.ReasonForChange = this.formulationInfoModel.ReasonForChange == undefined ? "" : this.formulationInfoModel.ReasonForChange;
              this.rmmapi.postData("FormulationDetails/AddFormulationDetails", this.formulationInfoModel).toPromise().then((resp: any) => {
                if (resp && resp.Status) {
                  this._notificationService.showSuccess("", "New formulation created successfully");
                  if (buttonType == "Manage") {
                    this.actionType = false;
                    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
                      .set("Sort", this.searchFilter.sort).set("id", resp.Data).set("type", "BYID").set("InActive", "0");;
                    this.rmmapi.getData("FormulationDetails/GetFormulationDetails", params).toPromise().then((res: any) => {
                      this.allFormulationInfo = res.Data.FormulationDetailsList;
                      this.CommonDataBindFormulationDetailsInfo(this.allFormulationInfo[0]);
                      this.IsFormulation = false;
                      this.moduleNameBreadCum = "Version & Change Details";
                      this.modalReference.close();
                    });
                    this.GetFormulationVersions();
                  }
                  else {
                    this.GetFormulationDetails();
                    this.modalReference.close();
                  }
                } else {
                  // this._notificationService.showError("", resp.Message);
                  this._notificationService.showError("","Sorry, new formulation could not be created");
                }
              });
            }
          })
        } else {
          let params = new HttpParams().set("Name", this.formulationInfoModel.FormulationReferenceNo).set("Id", this.formulationInfoModel.Id);
          this.rmmapi.getData("FormulationDetails/CheckDuplicateFormulationDetails", params).toPromise().then((resp: any) => {
            this.IsCheckFormulationDetails = resp.Data;
            if (!this.IsCheckFormulationDetails) {
              this.formulationInfoModel.UpdatedBy = this.userName;
              this.rmmapi.postData("FormulationDetails/UpdateFormulationDetails", this.formulationInfoModel).toPromise().then((resp: any) => {
                if (resp && resp.Status) {
                  this._notificationService.showSuccess("", "Formulation Details" + resp.Message);
                  if (buttonType == "Manage") {
                    this.CommonDataBindFormulationDetailsInfo(this.formulationInfoModel);
                    this.modalReference.close();
                    this.IsFormulation = false;
                    this.moduleNameBreadCum = "Version & Change Details";
                  }
                  else {
                    this.GetFormulationDetails();
                    this.modalReference.close();
                  }
                  this.modalReference.close();
                  this.GetFormulationVersions();
                } else {
                  this._notificationService.showError("", resp.Message);
                }
              })
            }
          });
        }
      }
      else {
        this.formulationInfoModel.EmailType = this.emailType;
        this.formulationInfoModel.CreatedBy = this.userName;
        this.formulationInfoModel.UpdatedBy = this.userName;
        this.formulationInfoModel.ProductCategoriesId = this.formulationInfoModel.ProductCategories.Id;
        this.formulationInfoModel.ProductId = this.formulationInfoModel.Products.Id;
        this.formulationInfoModel.StatusId = this.allStatusInfo.filter(item => item.Code == "FSN")[0].Id;
        this.formulationInfoModel.StatusName = this.allStatusInfo.filter(item => item.Code == "FSN")[0].Name;
        this.rmmapi.postData("FormulationDetails/AddFormulationDetails", this.formulationInfoModel).toPromise().then((resp: any) => {
          if (resp && resp.Status) {

            this.modalReference.close();
            if (this.CheckCopyVersionFormulation == true) {
              this.formulationRawMaterials.forEach(element => {
                let objRawMaterials: FormulationRawMaterials = new FormulationRawMaterials();
                objRawMaterials = element;
                objRawMaterials.RawMaterialId = objRawMaterials.RawMaterialIds.RawMaterialId;
                objRawMaterials.FormulationDetailId = resp.Data;
                objRawMaterials.CreatedBy = this.userName;
                this.rmmapi.postData("FormulationRawMaterials/AddFormulationRawMaterials", objRawMaterials).toPromise().then((resp: any) => {
                  if (resp && resp.Status) {

                    this.modalReference.close();
                  } else {
                    this._notificationService.showError("", resp.Message);
                  }
                })
              });

            }
           
            this._notificationService.showSuccess("", "New version created successfully");
            this.GetFormulationDetails();
            this.modalReference.close();
           
            if (buttonType != "Manage") {
              this.OpenFormulationAllVersions(AllVersion, this.formulationInfoModel)
              this.GetFormulationVersions();
            }
            else if (buttonType == "Manage"){
                   this.actionType = false;
                    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
                      .set("Sort", this.searchFilter.sort).set("id", resp.Data).set("type", "BYID").set("InActive", "0");;
                    this.rmmapi.getData("FormulationDetails/GetFormulationDetails", params).toPromise().then((res: any) => {
                      this.allFormulationInfo = res.Data.FormulationDetailsList;
                      this.CommonDataBindFormulationDetailsInfo(this.allFormulationInfo[0]);
                      this.IsFormulation = false;
                      this.moduleNameBreadCum = "Version & Change Details";
                      this.modalReference.close();
                    });
                    this.GetFormulationVersions();
            }
          } else {
            // this._notificationService.showError("", resp.Message);
            this._notificationService.showError("", "Sorry, details could not be updated");
          }
        })

      }
    }
    else {
      this.formulationForm.markAllAsTouched();
    }
  }

  AddCloneFormulationInfo(actionType:string, view:any) {

    
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }
    else {
      let params = new HttpParams().set("Name", this.formulationInfoModel.FormulationReferenceNo).set("Id", "0");
      this.rmmapi.getData("FormulationDetails/CheckDuplicateFormulationDetails", params).toPromise().then((resp: any) => {
        this.IsCheckFormulationDetails = resp.Data;
        if (!this.IsCheckFormulationDetails) {
          this.formulationInfoModel.CreatedBy = this.userName;
          this.formulationInfoModel.UpdatedBy = this.userName;
          this.formulationInfoModel.EmailType = this.emailType;
          this.formulationInfoModel.ProductCategoriesId = this.formulationInfoModel.ProductCategories.Id;
          this.formulationInfoModel.ProductId = this.formulationInfoModel.Products.Id;
          this.formulationInfoModel.StatusId = this.allStatusInfo.filter(item => item.Code == "FSN")[0].Id;
          this.formulationInfoModel.StatusName = this.allStatusInfo.filter(item => item.Code == "FSN")[0].Name;
          this.formulationInfoModel.R_DContact = this.formulationInfoModel.R_DContact == undefined ? "" : this.formulationInfoModel.R_DContact;
          this.formulationInfoModel.Project = this.formulationInfoModel.Project == undefined ? "" : this.formulationInfoModel.Project;
          this.formulationInfoModel.ReasonForChange = this.formulationInfoModel.ReasonForChange == undefined ? "" : this.formulationInfoModel.ReasonForChange;
          this.rmmapi.postData("FormulationDetails/AddFormulationDetails", this.formulationInfoModel).toPromise().then((resp: any) => {
            if (resp && resp.Status) {
              this._appService.formulationId = resp.Data;
              this._appService.commingFrom = "Formulation";
              this._appService.actionType = "View";
              this._notificationService.showSuccess("", "New formulation created successfully");
              this.formulationRawMaterials.forEach(element => {
                let objRawMaterials: FormulationRawMaterials = new FormulationRawMaterials();
                objRawMaterials = element;
                objRawMaterials.RawMaterialId = objRawMaterials.RawMaterialIds.RawMaterialId;
                objRawMaterials.FormulationDetailId = resp.Data;
                objRawMaterials.CreatedBy = this.userName;
                this.rmmapi.postData("FormulationRawMaterials/AddFormulationRawMaterials", objRawMaterials).toPromise().then((resp: any) => {
                  if (resp && resp.Status) {
                    this.modalReference.close();
                  } else {
                    // this._notificationService.showError("", resp.Message);
                    this._notificationService.showError("","Sorry, Raw Material details could not be updated");
                  }
                })
              });
              this.isCloneFormulationEnable = false;
              this.modalReference.close();
              
              if (actionType === 'save') {
                this.rmmapi.setStorage(this.env.CurrentTabState.TabName, "");
                this.rmmapi.setStorage(this.env.CurrentTabState.Id, "");
                this.IsFormulation = true; 
                window.location.reload();
                this.router.navigate(['/Formulations']);
              } else {
                this.GetFormulationDetails();
              }
            } else {
              this._notificationService.showError("", resp.Message);
            }
          })
        }
      });
    }
  }
  EditFormulationVersionDetailsInfo(type, Formulation, dataItem, AllVersion) {
    this.isEditFormulationCancel=true;
    this.modalReference.close(AllVersion);
    this.EditFormulationDetailsInfo(type, Formulation, dataItem);
  }

  GetFormulationById(id: number) {
    
    let params = new HttpParams()
      .set("PageSize", this.searchFilter.pageSize.toString())
      .set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort)
      .set("id", id.toString())
      .set("type", "BYID")
      .set("InActive", "0");
    this.rmmapi.getData("FormulationDetails/GetFormulationDetails", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data && res.Data.FormulationDetailsList.length > 0) {
        this.CommonDataBindFormulationDetailsInfo(res.Data.FormulationDetailsList[0]);
      }
    });
  }

  EditFormulationDetailsInfo(type, value1: any, value2: any) {
    this.createVersionFormulation = false;
    this.actionType = false;
    this.ShowVersionName = false;
    this.IsCheckFormulationDetails = false;
    this.CommonDataBindFormulationDetailsInfo(value2);
    this.moduleNameBreadCum = "Version & Change Details";
    if (type == 'View') {
      this.IsFormulation = false;
    }
    //else if (type == "Version") {
    //   this.CreateNewVersion(value1);
    //   //   this.modalReference = this.modalService.open(value1, { size: 'lg' });
    // }
    else {
      this.modalReference = this.modalService.open(value1, { size: 'xl' });
    }
  }

  isCancelHide: boolean = false;
  async CommonDataBindFormulationDetailsInfo(value2) {
    this.formulationInfoModel.Id = value2.Id;
    this.formulationInfoModel.VersionNo = value2.VersionNo;
    this.formulationInfoModel.ReasonForChange = value2.ReasonForChange;
    this.formulationInfoModel.Project = value2.Project;
    this.formulationInfoModel.R_DContact = value2.R_DContact;
    this.formulationInfoModel.ProductId = value2.ProductId;
    this.formulationInfoModel.ProductCategoriesId = value2.ProductCategoriesId;
    this.formulationInfoModel.Products = this.allProductsInfo.filter(item => item.Id == value2.ProductId)[0];




    this.formulationInfoModel.ProductCategories = this.allProductCategoriesInfo.filter(item => item.Id == value2.ProductCategoriesId)[0];
    await this.GetMarketsByFormulationDetailsId(value2.Id);
    this.formulationInfoModel.ProductName = this.formulationInfoModel.Products.Name;

    this.formulationInfoModel.FormulationReferenceNo = value2.FormulationReferenceNo;
    this.formulationInfoModel.StatusName = value2.StatusName;
    this.formulationInfoModel.CreatedBy = value2.CreatedBy;
    this.formulationInfoModel.CreatedDate = value2.CreatedDate;
    this.formulationInfoModel.UpdatedBy = value2.UpdatedBy;
    this.formulationInfoModel.UpdatedDate = value2.UpdatedDate;
    this.formulationInfoModel.StatusId = value2.StatusId;
    this.formulationInfoModel.StatusCode = value2.StatusCode;
    this.formulationInfoModelTemp = { ...this.formulationInfoModel };

    if (value2.ProductCategoriesId !== undefined && value2.ProductCategoriesId > 0 && this.formulationInfoModel.ProductCategories !== undefined) {
      this.formulationInfoModel.ProductCategoryName = this.formulationInfoModel.ProductCategories.Name;
    } else {
      this.rmmapi.getData("ProductCategories/GetProductCategories").toPromise().then((res: any) => {
        this.allProductCategoriesInfo = res.Data;
        this.formulationInfoModel.ProductCategories = this.allProductCategoriesInfo.filter(item => item.Id == value2.ProductCategoriesId)[0];
        this.formulationInfoModel.ProductCategoryName = this.formulationInfoModel.ProductCategories.Name;
      });
    }


    if (value2.StatusCode === StatusName.IngredientListApproved) {
      this.HideMarketCancelBtn = true;
      this.HideMarketEditBtn = this.isCancelHide = false;
      this.DisableMarkets = true;
    } else if (value2.StatusCode === StatusName.MarketChange) {
      this.DisableMarkets = this.HideMarketCancelBtn = this.isCancelHide = false;
      this.HideMarketEditBtn = true;
    } else {
      this.DisableMarkets = false;
      this.HideMarketEditBtn = this.HideMarketCancelBtn = this.isCancelHide = true;
    }

    this.GetFormulationVersions();
  }
 async CreateNewVersion(Formulation, actionTypeIs = 'old') {
    this.formulationForm.reset();
    this.modalReference.close();
    this.allVersionsInfo = this.allVersionsInfo.sort((a, b) => b.Id - a.Id);
    this.emailType = 2;
    let params = new HttpParams()
      .set("PageSize", this.searchFilter.pageSize.toString())
      .set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort)
      .set("id", this.allVersionsInfo[0].Id)
      .set("type", "BYID").set("InActive", "0");

    this.rmmapi.getData("FormulationDetails/GetFormulationDetails", params).toPromise().then(async (res: any) => {
      this.allFormulationInfo = res.Data.FormulationDetailsList;
      this.allVersionsInfo.forEach(element => {
        if (element.VersionNo.split('.')[1] == "0") {
          this.magerVersionsList.push(element);
          this.listVersionsMager.push(element.VersionNo);
        }
        else {
          this.minorVersionsList.push(element);
          this.listVersionsMiner.push(element.VersionNo);
        }
      });
      if (this.allVersionsInfo[0].VersionNo.split('.')[1] == "0") {
        this.listVersions = this.listVersionsMager.filter((a, b) => this.listVersionsMager.indexOf(a) === b);
        this.selectedVersion = "Major";
        this.defaultVersion = this.allVersionsInfo[0].VersionNo;
        this.formulationInfoModel.VersionNo = (parseInt(this.defaultVersion.split('.')[0]) + 1) + ".0";
      }
      else {
        this.listVersions = this.listVersionsMiner.filter((a, b) => this.listVersionsMiner.indexOf(a) === b);
        this.selectedVersion = "Minor";
        this.defaultVersion = this.allVersionsInfo[0].VersionNo;
        if (this.defaultVersion.split('.')[1] == "0") {
          let version = this.minorVersionsList.filter(item => item.VersionNo.split('.')[0] == this.formulationInfoModel.VersionNo.split('.')[0]);
          if (version.length > 0) {
            let versions = version.sort((a, b) => b.Id - a.Id);
          }
          else {
            this.formulationInfoModel.VersionNo = this.defaultVersion.split('.')[0] + "." + (parseInt(this.defaultVersion.split('.')[1]) + 1);
          }
        }
        else {
          this.formulationInfoModel.VersionNo = this.defaultVersion.split('.')[0] + "." + (parseInt(this.defaultVersion.split('.')[1]) + 1);
        }
      }
      this.isVersionDropdown = true;
      this.CheckCopyVersionFormulation = false;
      this.actionType = true;
      this.ShowVersionName = true;
      this.createVersionFormulation = true;
      this.isFormulationDisable = true;
      let value2 = this.allFormulationInfo.filter(item => item.Id == this.allVersionsInfo[0].Id)[0];
      this.formulationInfoModel.Id = value2.Id;
      this.formulationInfoModel.ReasonForChange = value2.ReasonForChange;
      this.formulationInfoModel.Project = value2.Project;
      this.formulationInfoModel.R_DContact = value2.R_DContact;
      this.formulationInfoModel.ProductId = value2.ProductId;
      this.formulationInfoModel.ProductCategoriesId = value2.ProductCategoriesId;
      this.formulationInfoModel.Products = this.allProductsInfo.filter(item => item.Id == value2.ProductId)[0];
      this.formulationInfoModel.ProductCategories = this.allProductCategoriesInfo.filter(item => item.Id == value2.ProductCategoriesId)[0];
      await this.GetMarketsByFormulationDetailsId(value2.Id);
      this.GetFormulationRawMaterialsDetails(this.formulationInfoModel.Id);
      this.formulationInfoModel.FormulationReferenceNo = value2.FormulationReferenceNo;
      //  this.modalReference.close();
      this.IsCopyRawMaterial = true;
      this.formulationForm.get('Version').enable();
      this.modalReference.close();
      this.modalReference = this.modalService.open(Formulation, { size: 'xl' });

      if (actionTypeIs === 'new') {
         this.formulationInfoModel.Markets = [];
         this.formulationInfoModel.Markets = "";
        this.formulationInfoModel.R_DContact = '';
        this.formulationInfoModel.ReasonForChange = '';
        this.formulationInfoModel.Project = '';
      }
    });

  }
  CloseFormulation(value1) {  
    if (this.createVersionFormulation) {
      this.modalReference.close();
      this.modalReference = this.modalService.open(value1, { size: 'xl' });
    }
    else {
      this.formulationForm.get('Version').disable();
      this.formulationInfoModel.VersionNo = this.defaultVersion;
      this.modalReference.close();
    }
  }
  CopyRawMaterialChange(event) { 
    if (event.currentTarget.checked) {
      this.isVersionFormulation = true;
      this.isFormulationDisable = false;
      this.checkversion = true;
      this.CheckCopyVersionFormulation = true;

      if (this.marketListId != null && this.marketListId != undefined) {
        this.formulationInfoModel.Markets = this.marketListId;
      }
    }
    else {
      this.isVersionFormulation = false;
      this.checkversion = true;
      this.CheckCopyVersionFormulation = false;
      this.isFormulationDisable = true;
      this.formulationInfoModel.Markets = [];
    }
  }
  ViewFormulationRawMaterialsInfo(value1, value2) {
    this.modalReference.close();
    this.modalReference = this.modalService.open(value1, { size: 'xl' });
    this.GetFormulationRawMaterialSubComponentsByFormulationRawMaterialId(value2.Id);
  }
  CloseSubComponentsRawMaterials(value1)
  {
    this.modalReference.close();
    this.modalReference = this.modalService.open(value1, { size: 'xl' });
  } 
  inactiveMsg: string;
  InActiveModalInfo(value1: any, value2: any, value3: any) {
    this.inactiveMsg = "Are you sure you want to " + (!value2.IsDeleted ? "In-Activate" : "Re-Activate");
    this.formulationInfoModel.Id = value2.Id;
    this.formulationInfoModel.FormulationReferenceNo = value2.FormulationReferenceNo;
    this.formulationInfoModel.VersionNo = value2.VersionNo;
    this.formulationInfoModel.IsDeleted = value2.IsDeleted;
    this.formulationInfoModel.FormulationType = value3;
    this.modalReference = this.modalService.open(value1, { size: 'sm' });
  }
  marketListId: any;
  async GetMarketsByFormulationDetailsId(id) {
    let params = new HttpParams().set("Id", id);
    await this.rmmapi.getData("FormulationDetails/GetMarketsByFormulationDetailsId", params).toPromise().then((resp: any) => {
      this.formulationInfoModel.Markets =   resp.Data;
      this.marketListId =  resp.Data;
      this.cloneFormulationInfoModel.CloneMarkets = resp.Data;
      this.rmmapi.setStorage(this.env.CurrentTabState.Id, id);
      this.rmmapi.setStorage(this.env.CurrentTabState.TabName, 'VersionChangeDetails');
      // this.rmmapi.setStorage('l2_TabName', );
      this.MarketListTemp = resp.Data;
    })
  }
  IsCheckFormulationDetailsInfo() {
    if (!this.createVersionFormulation) {
      let params = new HttpParams().set("Name", this.formulationInfoModel.FormulationReferenceNo).set("Id", (this.formulationInfoModel.Id ? this.formulationInfoModel.Id : 0));
      this.rmmapi.getData("FormulationDetails/CheckDuplicateFormulationDetails", params).toPromise().then((resp: any) => {
        this.IsCheckFormulationDetails = resp.Data;
      })
    }
  }
  NavigateVersion() {
    this.modalReference.close();
    this.IsFormulation = false;
  }
  NavigateFormulation() {
    this.modalReference.close();
    this.IsFormulation = true;
  }
  OpenFormulationAllVersions(content, value2) {
    this.isEditFormulationCancel = false;
    this.CommonDataBindFormulationDetailsInfo(value2);
    this.OpenAllVersions(content);
  }
  OpenAllVersions(content) {
    this.isEditFormulationCancel=false;
    this.emailType = 2;
    this.formulationInfoModel.Id
    this.GetFormulationVersions();
    this.modalReference = this.modalService.open(content, { size: 'xl' });
  }
  handleFilter(value) {
    this.subComponentList = this.data.filter(
      (s) => s.Name.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }
  OnSubComponentChange(event: any) {
    this.Model.GivenSubComponentName = this.Model.SubComponentName = event.Name;
    this.Model.CASNumber = event.CASNumber;
    this.Model.EINECSNumber = event.EINECSNumber;
    this.Model.EUINCIName = event.EUINCIName;
    this.Model.USINCIName = event.USINCIName;
    this.Model.ECNumberOrKENumber = event.ECNumberOrKENumber;
    this.Model.SubComponentId = event.Id;
  }

  navigateToFormulation() {
    this._appService.resetValues();
    this.rmmapi.removeStorage(this.env.CurrentTabState.Id);
    this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
    this.router.navigate(["./Formulations"]);
  }

  moduleNameBreadCum: string = "";
  tabchange(tabname) {
    this.moduleName = tabname;
    this.tabName(tabname);
    this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
    this.rmmapi.setStorage(this.env.CurrentTabState.TabName, tabname);

    if (tabname === "VersionChangeDetails") {
      this.GetFormulationById(this.formulationInfoModel.Id);
    }
  }
  get f() { return this.registerForm.controls; }
  AddFormulationRawMaterialsInfo(CloneFormulation) {
    this.modalReference.close();
    this.formulationRawMaterials.forEach(element => {
      if (element.Id == this.formulationRawMaterialsModel.Id) {
        element = this.formulationRawMaterialsModel;
      }
    });
    this.modalReference = this.modalService.open(CloneFormulation, { size: 'xl' });
  }

  tabName(name: string) {
    if (name === "VersionChangeDetails") {
      this.moduleNameBreadCum = "Version & Change Details";
    } else if (name === "RawMaterials") {
      this.moduleNameBreadCum = "Raw Materials";
    } else if (name === "MarketRegulations") {
      this.moduleNameBreadCum = "Market Regulations";
    } else if (name === "DataDocumentCheck") {
      this.moduleNameBreadCum = "Data & Document Check";
    } else if (name === "FormulationTranscriptSummary") {
      this.moduleNameBreadCum = "Formulation Summary";
    } else if (name === "IngredientListINCIBreakdown") {
      this.moduleNameBreadCum = "Ingredient List";
    } else if (name === "DocumentTraking") {
      this.moduleNameBreadCum = "Document Traking";
    }
  }
  IsCheckFormulationRawMaterialsInfo() {
    // let params = new HttpParams().set("Name",this.formulationRawMaterialsModel.TradeName).set("Id", (this.formulationRawMaterialsModel.Id ? this.formulationRawMaterialsModel.Id : 0));
    // this.rmmapi.getData("SupplierFormulationRawMaterialsDetails/CheckDuplicateSupplierFormulationRawMaterialsDetails", params).toPromise().then((resp: any) => {
    //   this.IsCheckFormulationRawMaterials = resp.Data;
    // })
  }
  EditFormulationRawMaterialsInfo(CloneFormulation, value1: any, value2: any) {
    
    this.modalReference.close();
    this.actionType = false;
    this.ShowVersionName = false;
    this.formulationRawMaterialsModel = value2;
    if (this.env.formulationRawMaterialsInfoList.length > 0)
      this.formulationRawMaterialsModel.RawMaterialIds = this.env.rawMaterialsList.filter(item => item.RawMaterialId == value2.RawMaterialId)[0];;
    this.GetFormulationRawMaterialFunctionsById(value2.Id);
    this.GetFormulationRawMaterialSubComponentsByFormulationRawMaterialId(value2.Id);
    this.modalReference = this.modalService.open(value1, { size: 'xl' });
  }
  GetFormulationRawMaterialSubComponentsByFormulationRawMaterialId(id) {
    let params = new HttpParams().set("id", id);
    this.rmmapi.getData("FormulationRawMaterials/GetFormulationRawMaterialSubComponentsByFormulationRawMaterialId", params).toPromise().then((resp: any) => {
      this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents = resp.Data;

    });
  }
  GetRawMaterialFunctionsBySupplierRawMaterialDetailId(id) {
    this.rmmapi.postData("SupplierRawMaterialDetails/GetRawMaterialFunctionsBySupplierRawMaterialDetailId", { Id: id }).toPromise().then((resp: any) => {
      this.formulationRawMaterialsModel.RawMaterialFunctions = resp.Data;
    });
  }
  GetFormulationRawMaterialFunctionsById(id) {

    let params = new HttpParams().set("id", id);
    this.rmmapi.getData("FormulationRawMaterials/GetFormulationRawMaterialFunctionsById", params).toPromise().then((resp: any) => {
      this.formulationRawMaterialsModel.RawMaterialFunctions = resp.Data;
    });
  }
  ConfigureSubComponentsModal(FormulationRawMaterials, SubComponentsRawMaterials) {
    this.modalReference.close(FormulationRawMaterials);
    this.modalReference = this.modalService.open(SubComponentsRawMaterials, { size: 'xl' });
  }
  GotoNextTab(tabName: string) {
    this.tabchange(tabName);
  }

  formulationReviewCommentsList: GridDataResult;
  formulationReferenceNo: string;
  versionNo: string;
  // searchFilter: SearchFilter = new SearchFilter();
  // modalOptions: NgbModalOptions;
  // modalReference: NgbModalRef;
  public ReviewSort: SortDescriptor[] = [{ field: 'RawMaterialName', dir: 'asc' }];
  type = 'numeric';
  position = 'bottom';
  //closeResult: string;
  formulationReviewCommentForm: any;
  allFormulationRawMaterialsInfo: any[] = [];
  rawMaterialList: any[] = [];
  manufacturerList: any[] = [];
  supplierList: any[] = [];
  tradeNameList: any[] = [];
  //subComponentList: any[] = [];
  marketList: any[] = [];
  assignUserList: any[] = [];
  public defaultItemComment: { Name: string; Id: number } = { Name: "All", Id: null, };
  formulationReviewRawMaterialsModel: any = {};
  @ViewChild('ReplyCommentModel', { static: true }) ReplyCommentModel: ElementRef;
  @ViewChild('EditCommentModel', { static: true }) EditCommentModel: ElementRef;
  @ViewChild('ViewCommentModel', { static: true }) ViewCommentModel: ElementRef;

  ViewCommentsGrid(content) {
    this.ReviewSetDefaults();
    this.GetFormulationReviewComments()
    this.modalReference && this.modalReference.close();
    this.modalReference = this.modalService.open(content, { size: 'xl' });
    //this.modalReference.componentInstance.FormulationDetails = this.formulationInfoModel;
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


  ReviewSetDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "RawMaterialName asc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }

  ReviewPageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber = event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetFormulationReviewComments();
  }

  ReviewSortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "RawMaterialName asc";
    this.ReviewSort = sort;
    this.GetFormulationReviewComments();
  }

  GetFormulationMarkets() {
    let params = new HttpParams().set("formulationDetailId", this.formulationInfoModel.Id.toString()).set("pageSize","0").set("pageNumber","0").set("sort","");
    this.rmmapi.getData("FormulationRawMaterialSubComponentMarketRegulations/GetFormulationMarkets", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.marketList = res.Data;
      }
    });
  }

  GetFormulationReviewComments() {
    let formulationId = this._appService.formulationId ? this._appService.formulationId : this.formulationInfoModel.Id.toString();
    let params = new HttpParams().set("formulationDetailId", formulationId)
      .set("PageSize", this._appService.formulationId ? "0" : this.searchFilter.pageSize.toString())
      .set("PageNumber", this._appService.formulationId ? "0" : this.searchFilter.pageNumber.toString()).set("Sort", this.searchFilter.sort);
    this.rmmapi.getData("FormulationReviewComments/GetFormulationReviewComment", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        if (this._appService.formulationId) {
          let dataItem = res.Data.FormulationReviewComments.find(x => x.Id === this._appService.reviewCommentId);
          this.EditReviewComment(this._appService.actionType == "Edit" ? this.EditCommentModel : this.ReplyCommentModel, dataItem, this._appService.actionType === "Edit" ? false : true);
          this.formulationReviewCommentsList = {
            data: res.Data.FormulationReviewComments.slice(0, 10),
            total: res.Data.TotalRecords
          };
          this._appService.formulationId = undefined;
          this._appService.commingFrom = undefined;
        } else {
          this.formulationReviewCommentsList = {
            data: res.Data.FormulationReviewComments,
            total: res.Data.TotalRecords
          };
        }
      }
    });
  }

  AddComment(model: any) {
    this.formulationReviewCommentForm.reset();
    this.formulationReviewCommentForm.clearValidators();
    this.totalCharCount = 0;
    this.formulationReviewCommentForm.controls["CommentsReplied"].setValidators(null);
    this.formulationReviewCommentForm.controls['CommentsReplied'].updateValueAndValidity();
    this.modalReference.close();
    this.formulationReviewRawMaterialsModel = {};
    this.GetFormulationMarkets();
    this.GetFormulationRawMaterials();
    this.GetUsers();
    this.modalReference = this.modalService.open(model, { size: 'xl' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.GetDismissReason(reason)}`;
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

  GetFormulationRawMaterials() {
    let params = new HttpParams().set("formulationDetailId", this.formulationInfoModel.Id.toString());
    this.rmmapi.getData("FormulationReviewComments/GetRawMaterialDetails", params).toPromise().then((resp: any) => {
      if (resp && resp.Status && resp.Data) {
        this.rawMaterialList = resp.Data;
      }
    })
  }

  rawMaterialName: string;
  formulationRawMaterialId: number;
  OnRawMaterialChange(event: any) {
    
    this.manufacturerList = this.subComponentList = this.supplierList = this.tradeNameList = [];
    //this.formulationReviewCommentForm.reset();    
    this.subComponentRMList= [];
    this.rawMaterialName = event.Name;
    this.formulationRawMaterialId = event.FormulationRawMaterialId;

   // if (event && event.ManufacturerList && event.ManufacturerList.length > 0) {
    //  this.manufacturerList = event.ManufacturerList;
   // }

    if (event && event.SupplierList && event.SupplierList.length > 0) {
     // this.supplierList = event.SupplierList;
      this.supplierList = event.SupplierList.filter(item => item.RawMaterialId == event.Id);

    }

    if (event && event.TradeList && event.TradeList.length > 0) {
      //this.tradeNameList = event.TradeList;
      this.tradeList = event.TradeList;
    }

    if (event && event.SubComponentList && event.SubComponentList.length > 0) {

      this.subComponentRMList = event.SubComponentList.filter(item => item.RawMaterialId == event.Id);

     // this.subComponentList = event.SubComponentList;
    }


    this.formulationReviewRawMaterialsModel.SupplierId = null;
   // this.formulationReviewRawMaterialsModel.ManufacturerId.Id = null;
    this.formulationReviewRawMaterialsModel.ManufacturerId = null;
    this.formulationReviewRawMaterialsModel.TradeName = null;
    this.formulationReviewRawMaterialsModel.SubComponentId = null;
  }

  SupplierChange(event) {

    this.manufacturerList =  [];

    if (this.formulationReviewRawMaterialsModel.RawMaterialId && this.formulationReviewRawMaterialsModel.RawMaterialId.ManufacturerList && this.formulationReviewRawMaterialsModel.RawMaterialId.ManufacturerList.length > 0) {
    this.manufacturerList =  this.formulationReviewRawMaterialsModel.RawMaterialId.ManufacturerList.filter(item => item.SupplierId == event);
    }
   // if (event && event.ManufacturerList && event.ManufacturerList.length > 0) {
   //   this.manufacturerList = event.ManufacturerList;
   // }
  
    this.formulationReviewRawMaterialsModel.ManufacturerId = null;
    this.formulationReviewRawMaterialsModel.TradeName = null;
    this.formulationReviewRawMaterialsModel.SubComponentId = null;
    this.bindTradeName();


  }

  tradeNameChange(event) {
    this.subComponentList=[];
   console.log(this.formulationReviewRawMaterialsModel.TradeName);
   this.formulationReviewRawMaterialsModel.SubComponentId = null;
   
    let supplierID = this.formulationReviewRawMaterialsModel.SupplierId;
    let manufacturerID = this.formulationReviewRawMaterialsModel.ManufacturerId != null ? this.formulationReviewRawMaterialsModel.ManufacturerId.Id : undefined; 
    let tradeName = this.formulationReviewRawMaterialsModel.TradeName != null ?this.formulationReviewRawMaterialsModel.TradeName.Id: undefined;
    
    if(supplierID != undefined && manufacturerID != undefined && tradeName!=undefined)
    {
       this.subComponentList = this.subComponentRMList.filter(item => item.SupplierId == supplierID && item.ManufacturerId == manufacturerID && item.TradeName==tradeName);
    }
    else{
      this.formulationReviewRawMaterialsModel.SubComponentId = null;
    }

   
  }

  subComponentChange(event) {
    console.log(this.formulationReviewRawMaterialsModel.TradeName);
    
   }
  ManufacturersChange(event) {
    this.formulationReviewRawMaterialsModel.TradeName = null;
    this.formulationReviewRawMaterialsModel.SubComponentId = null;
    this.bindTradeName();
  }
  bindTradeName()
  {
    this.tradeNameList =[];
    this.subComponentList=[];
    let supplierID = this.formulationReviewRawMaterialsModel.SupplierId;
    let manufacturerID = this.formulationReviewRawMaterialsModel.ManufacturerId != null ? this.formulationReviewRawMaterialsModel.ManufacturerId.Id : undefined; 
    let rawMaterialID = this.formulationReviewRawMaterialsModel.RawMaterialId != null ?this.formulationReviewRawMaterialsModel.RawMaterialId.Id: undefined;
    
    if(supplierID != undefined && manufacturerID != undefined && rawMaterialID!=undefined)
    {
      this.tradeNameList = this.tradeList.filter(item => item.SupplierId == supplierID && item.ManufacturerId == manufacturerID && item.RawMaterialId==rawMaterialID);
    }
    else{
      this.formulationReviewRawMaterialsModel.TradeName = null;
    }
  }

   ConvertDate(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }

  SaveReviewComment() {
     if (this.formulationReviewCommentForm.valid && this.formulationReviewRawMaterialsModel.Comment.length < 2001) {
      let model: any = {};
      model.FormulationReferenceNo = this.formulationInfoModel.FormulationReferenceNo;
      model.VersionNo = this.formulationInfoModel.VersionNo;
      if (this.formulationReviewRawMaterialsModel.Id > 0) {
        model.Id = this.formulationReviewRawMaterialsModel.Id;
        model.isReplied = this.isReplied;
        model.Comment = this.formulationReviewRawMaterialsModel.Comment;
        model.CommentsReplied = this.formulationReviewRawMaterialsModel.CommentsReplied;
        model.CommentRepliedBy = this.rmmapi.getUserName();
        model.CommentRepliedDate = new Date();
        model.CommentUpdatedBy = this.rmmapi.getUserName();
        model.CommentUpdatedDate = new Date();
        model.CommentClosedBy = this.rmmapi.getUserName();
        model.CommentClosedDate = new Date();
        model.IsClosed = this.formulationReviewRawMaterialsModel.IsClosed;
        this.rmmapi.postData("FormulationReviewComments/UpdateFormulationReviewComment", model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            //this._notificationService.showSuccess("", (this.rawMaterialName === undefined ? "All" : this.rawMaterialName) + resp.Message);
            if(this.isReplied==false)
            {
              if(model.IsClosed==true)
              {
                this._notificationService.showSuccess("", "Comment has been closed");
              }
              else
              {
                this._notificationService.showSuccess("", "Comment updated successfully");
              }
            }
            else{
              this._notificationService.showSuccess("", "Reply to the comment added successfully");
            }
            this.GetFormulationReviewComments();
            this.ViewCommentsGrid(this.ViewCommentModel);
          } else {
            // this._notificationService.showError("", resp.Message);
            this._notificationService.showError("", "Sorry, comment could not be closed");
          }
        });
      } else {
        model.Comment = this.formulationReviewRawMaterialsModel.Comment;
        model.CommentAssignedTo = this.formulationReviewRawMaterialsModel.CommentAssignedTo != null ? this.formulationReviewRawMaterialsModel.CommentAssignedTo.FirstName + " " + this.formulationReviewRawMaterialsModel.CommentAssignedTo.LastName : "";
        model.CommentDueDate = this.formulationReviewRawMaterialsModel.CommentDueDate != undefined ? this.ConvertDate(this.formulationReviewRawMaterialsModel.CommentDueDate) : null;
        model.FormulationDetailId = this.formulationInfoModel.Id;
        
        model.FormulationRawMaterialId = this.formulationRawMaterialId != null ? this.formulationRawMaterialId : 0;
        
        model.RawMaterialId = this.formulationReviewRawMaterialsModel.RawMaterialId != null ? this.formulationReviewRawMaterialsModel.RawMaterialId.Id : 0;
        model.SupplierId = this.formulationReviewRawMaterialsModel.SupplierId != null ? this.formulationReviewRawMaterialsModel.SupplierId : 0;
        model.ManufacturerId = this.formulationReviewRawMaterialsModel.ManufacturerId != null ? this.formulationReviewRawMaterialsModel.ManufacturerId.Id : 0;
        model.TradeName = this.formulationReviewRawMaterialsModel.TradeName != null ? this.formulationReviewRawMaterialsModel.TradeName.Id : '';
        model.FormulationRawMaterialSubComponentId = this.formulationReviewRawMaterialsModel.SubComponentId != null ? this.formulationReviewRawMaterialsModel.SubComponentId.Id : 0;
        model.MarketId = this.formulationReviewRawMaterialsModel.MarketId != null ? this.formulationReviewRawMaterialsModel.MarketId.Id : 0;
        model.CommentCreatedBy = this.rmmapi.getUserName();
        model.CommentCreatedDate = new Date();
        this.rmmapi.postData("FormulationReviewComments/AddFormulationReviewComment", model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            //this._notificationService.showSuccess("", (this.rawMaterialName === undefined ? "All" : this.rawMaterialName) + resp.Message);
            this._notificationService.showSuccess("", "New comment added successfully");
            this.GetFormulationReviewComments();
            this.ViewCommentsGrid(this.ViewCommentModel);
          } else {
            //this._notificationService.showError("", resp.Message);
            this._notificationService.showError("", "Sorry, new comment could not be added");
          }
        });
      }
    } else {
      this.formulationReviewCommentForm.markAllAsTouched();
    }
  }


  isReplied: boolean;
  IsClosed: boolean;
  EditReviewComment(popUpName: any, dataItem: any, isReplied: boolean) {
    this.formulationReviewCommentForm.clearValidators();
    if (isReplied) {
      this.formulationReviewCommentForm.controls["CommentsReplied"].setValidators(Validators.required);
      this.formulationReviewCommentForm.controls['CommentsReplied'].updateValueAndValidity();
    } else {
      this.formulationReviewCommentForm.controls["Comment"].setValidators(Validators.required);
      this.formulationReviewCommentForm.controls['Comment'].updateValueAndValidity();
    }
    this.rawMaterialName = dataItem.RawMaterialName;
    this.isReplied = isReplied;
    this.formulationReviewRawMaterialsModel = dataItem;
    this.formulationReviewRawMaterialsModel.IsClosed = this.IsClosed = dataItem.StatusName == "Closed" ? true : false;
    this.modalReference && this.modalReference.close();
    this.modalReference = this.modalService.open(popUpName, { size: 'xl' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.GetDismissReason(reason)}`;
    });
  }

  ReviewCommentFromDashboard(dataItem: any, actionType: boolean) {
    setTimeout(() => {
      this.EditReviewComment(actionType ? this.ReplyCommentModel : this.EditCommentModel, dataItem, actionType);
    }, 1000);
  }

  defaultItemuser: { UserName: string; Id: any } = { UserName: "-- Select --", Id: null };

  GetUsers() {
    let params = new HttpParams().set("PageSize", "0").set("PageNumber", "0").set("Sort", "")
      .set("id", "0").set("RoleId", "0").set("type", "type").set("InActive", "0");
    this.rmmapi.getData("UserAccount/GetUsers", params).toPromise().then((resp: any) => {
      this.assignUserList = resp.Data.UserList;
    })
  }

  ResetTheVersionDetailsChanges(AllVersion) {
    
    if(this.isEditFormulationCancel)
    {
      this.OpenAllVersions(AllVersion)
    }
    else{
    this.IsFormulation = true;
    this.GetProductCategories();
    }
  }
  UpdateFormulationDetailsStatus() {
    this.formulationInfoModel.UpdatedBy = this.rmmapi.getUserName();

    this.formulationInfoModel.ActionType = !this.formulationInfoModel.IsDeleted;
    this.rmmapi.postData("FormulationDetails/DeleteFormulationDetails", this.formulationInfoModel).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          if (this.formulationInfoModel.FormulationType == 'Version')
            this.GetFormulationVersions();
          else
            this.GetFormulationDetails();
          this.modalReference.close();
          //this._notificationService.showSuccess("", this.formulationInfoModel.FormulationReferenceNo + resp.Message);
          if(this.formulationInfoModel.FormulationType == 'Version')
          {
            this._notificationService.showSuccess("", "Version inactivated successfully");
          }
          else
          {
            if(this.formulationInfoModel.IsDeleted==true)
            {
              this._notificationService.showSuccess("", "Formulation reactivated successfully");
            }
            else{
          this._notificationService.showSuccess("", "Formulation inactivated successfully");
            }
          }
        } else {
          this.modalReference.close();
          this._notificationService.showWarning("", this.formulationInfoModel.FormulationReferenceNo + resp.Message);
        }
      } else {
        if(this.formulationInfoModel.FormulationType == 'Version')
        {
          this._notificationService.showSuccess("", "Sorry, this version could not be inactivated");
        }
        else{
          this._notificationService.showError("","Sorry, Formulation could not be inactivated");
        }
        
        this.modalReference.close();
      }
    })
  }

  maxLengthExceed = false;
  totalCharCount = 0;
  CommentMaxLengthCheck(event: any) {
    this.totalCharCount = event.target.value.length;
    if (event.target.value != null && event.target.value !== '' && event.target.value.length > 2000) {
       this.maxLengthExceed = true;
    } else {
      this.maxLengthExceed = false;
    }
  }

  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  public showTooltip(e: MouseEvent, tooltip: TooltipDirective): void {
    const element = e.target as HTMLElement;
    if ((element.nodeName === 'TD' || element.nodeName === 'TH' || element.nodeName === 'SPAN')
      && element.offsetWidth < element.scrollWidth  && element.innerText !='' && tooltip != undefined) {
        tooltip.toggle(element);
    } else {
      if(tooltip !=undefined)
      tooltip.hide();
    }
  }
}
