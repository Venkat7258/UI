
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SortDescriptor, State, orderBy } from '@progress/kendo-data-query';
import { BlockInvalidChar, EnvService } from 'src/app/shared/services/env.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { AppService } from '../../../app.service';
import { FormulationRawMaterialSubComponents } from '../../Models/formulation-raw-material-sub-components';
import { FormulationRawMaterials } from '../../Models/formulation-raw-materials';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { StatusName } from '../../../shared/constants/application.constants';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { SearchFilter,PaginationDefalts } from 'src/app/shared/constants/global.constants';
import {GridDataResult,PageChangeEvent} from "@progress/kendo-angular-grid";
@Component({
  selector: 'app-formulation-raw-materials',
  templateUrl: './formulation-raw-materials.component.html',
  styleUrls: ['./formulation-raw-materials.component.css'],

})
export class FormulationRawMaterialsComponent implements OnInit {
  @Input("formulationDetailId") formulationDetailId: any;
  @Input("StatusCode") statusCode: any;
  @Output() informToParent = new EventEmitter();
  public formulationRawMaterialsDetailsInfo: any[] = [];
  public formulationRawmaterialDetailsList:GridDataResult;
  modalOptions: NgbModalOptions;
  public sort: SortDescriptor[] = [ { field: 'RawMaterialName', dir: 'asc'}];
  modalReference: NgbModalRef;
  closeResult: string;
  Model: any;
  formulationRawMaterialsModel: FormulationRawMaterials = new FormulationRawMaterials();
  AllSuppliersInfo: any[] = [];
  AllManufacturersInfo: any[] = [];

  AllFunctionsInfo: any[] = [];
  AllFormulationRawMaterialsInfo: any[] = [];
  AllRawMaterialsInfo: any[] = [];
  allStatusInfo: any[] = [];
  public rawMaterialTradeNames: Array<string> = [];
  public rawMaterialSuppliers: any[] = [];
  public rawMaterial: any[] = [];
  public rawMaterialManufacturers: any[] = [];
  public rawMaterialManufacturersCopy: any[] = [];
  public rawMaterialTradeNamesCopy: any[] = [];
  public rawMaterialsSuppliers: any[] = [];
  public tradeNameList:any[] = [];
  IsCheckFormulationRawMaterials: boolean = false;
  actionType = true;
  CASNumberValidation = false;
  public defaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  public defaultTradeName = "-- Select --";
  public defaultItemRawMaterial: { Name: string; RawMaterialId: number } = {
    Name: "-- Select --",
    RawMaterialId: null,
  };
  supplierRawMaterialInfo: any[] = [];
  formulationRawMaterialsInfo: FormulationRawMaterials = new FormulationRawMaterials();
  subComponentFunctionList: any[] = [];
  newSubComponentRawMaterialInfo: FormulationRawMaterials = new FormulationRawMaterials();
  userName: any = "";
  isConfigureSubComponents: boolean = false;
  subComponentList: any;
  public data: Array<{ Name: string; Id: number }>;
  suppliersform: any
  formTitle: string = "Add Sub-component";
  buttonName: string = "Save";
  functionName: any[] = [];
  supplierDocumentList: any;
  impurities: any[] = [{ Name: "Yes", Id: 1 }, { Name: "No", Id: 0 }];
  IsCheckRawMaterial: boolean = false;
  IsCheckRawMaterialLevel2: boolean = false;
  view: any;
  public gridState: State = {
    sort: [],
    skip: 0,
    take: 10,
    filter: { logic: "or", filters: [] },
  };
  docRefList: any[] = [];
  public formGroups: FormGroup = new FormGroup({ items: new FormArray([]) });
  SubComponentValidationMessage = '';

  constructor(public router: Router, public _notificationService: NotificationService, public env: EnvService, public _appService: AppService, public rmmapi: RMMApiService, private modalService: NgbModal) {
    this.suppliersform = new FormGroup({
      SubComponentId: new FormControl("", Validators.required),
      CASNumber: new FormControl("", Validators.required),
      ECNumberOrKENumber: new FormControl(""),
      ImpuritiesPPM: new FormControl("", Validators.required),
      REAChNumberOrStatus: new FormControl(""),
      RawMaterialSubComponentConcentration: new FormControl("", Validators.required),
      SubComponentFunction: new FormControl("", Validators.required),
      USINCIName: new FormControl(""),
      EUINCIName: new FormControl(""),
      
      GivenSubComponentName: new FormControl()
    });
  }
  searchFilter : SearchFilter = new SearchFilter();
  ngOnInit(): void {

    this.userName = this.rmmapi.getUserName();
    this._appService.setHeaderShow(true);
    this._appService.setHeaderTitle("Formulations");
    this.setDefaults();
    this.GetFormulationRawMaterialsDetails();
    this.GetRawMaterials();
    this.GetStatus();
    this.GetSuppliers();
    this.GetManufacturers();
    this.GetFunctions();
    this.GetSubComponentFunctionsByRawMaterialSubComponentDetailId();
    
  }
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "RawMaterialName Desc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
    
  }
  GetRawMaterials() {
    this.rmmapi.getData("RawMaterials/GetRawMaterials", { sort: 'name' }).toPromise().then((resp: any) => {

      this.AllRawMaterialsInfo = [];
      this.AllRawMaterialsInfo = resp.Data;
      this.AllRawMaterialsInfo.forEach(element => {
        element.Name = element.Name + " (" + element.Code + ")";
      });
      this.GetFormulationRawMaterials();
    })
  }
  isButtonDisable: boolean;
  GetFormulationRawMaterialsDetails() {
    let params = new HttpParams().set("Id", this.formulationDetailId.toString()).set("PageSize",this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
    .set("Sort",this.searchFilter.sort);
    this.rmmapi.getData("FormulationRawMaterials/GetFormulationRawMaterials", params).toPromise().then((resp: any) => {
      if (resp && resp.Data && resp.Data.FormulationRawmaterialDetailsList.length > 0) {
        this.formulationRawMaterialsDetailsInfo = resp.Data.FormulationRawmaterialDetailsList;
        this.formulationRawmaterialDetailsList = {
          data: resp.Data.FormulationRawmaterialDetailsList,
          total: resp.Data.TotalRecords
      };
        let formulationStatusCode = this.formulationRawMaterialsDetailsInfo[0].StatusCode;
        let workflowRepeatCount = this.formulationRawMaterialsDetailsInfo[0].WorkflowRepeat;
        this.isButtonDisable = formulationStatusCode === StatusName.IngredientListApproved || formulationStatusCode === StatusName.MarketChange || workflowRepeatCount > 0;

      } else {
        this.formulationRawMaterialsDetailsInfo = [];
        this.formulationRawmaterialDetailsList = {
          data: [],
          total: 0
        };
      }
    });
  }
  GotoMarketRegulation() {
    this.informToParent.emit();
  }
  GetStatus() {
    this.rmmapi.getData("Status/GetStatus").toPromise().then((res: any) => {
      this.allStatusInfo = res.Data;
      this.rmmapi.setSession('ConfigStatusCodes', res.Data);
    });
  }
  GetRawMaterialFunctionsBySupplierRawMaterialDetailId(id) {
    this.rmmapi.postData("SupplierRawMaterialDetails/GetRawMaterialFunctionsBySupplierRawMaterialDetailId", { Id: id }).toPromise().then((resp: any) => {
      this.formulationRawMaterialsModel.RawMaterialFunctions = resp.Data;
    });
  }
  GetNewRawMaterialFunctionsBySupplierRawMaterialDetailId(id) {
    this.rmmapi.postData("SupplierRawMaterialDetails/GetRawMaterialFunctionsBySupplierRawMaterialDetailId", { Id: id }).toPromise().then((resp: any) => {
      this.newSubComponentRawMaterialInfo.RawMaterialFunctions = resp.Data;
    });
  }
  GetFormulationRawMaterialFunctionsById(id) {
    let params = new HttpParams().set("id", id);
    this.rmmapi.getData("FormulationRawMaterials/GetFormulationRawMaterialFunctionsById", params).toPromise().then((resp: any) => {
      this.formulationRawMaterialsModel.RawMaterialFunctions = resp.Data;
    });
  }
  GetSuppliers() {
    this.rmmapi.getData("Suppliers/GetSuppliers").toPromise().then((resp: any) => {
      this.AllSuppliersInfo = resp.Data;
    });
  }
  GetManufacturers() {
    this.rmmapi.getData("Manufacturers/GetManufacturers").toPromise().then((resp: any) => {
      this.AllManufacturersInfo = resp.Data;
    })
  }
  GetFunctions() {
    this.rmmapi.getData("RawMaterialFunctions/GetRawMaterialFunctions").toPromise().then((resp: any) => {
      this.AllFunctionsInfo = resp.Data;
    })
  }
  GetFormulationRawMaterials() {
    this.rawMaterial = [];
    this.rmmapi.getData("FormulationRawMaterials/GetSupplierRawMaterialDetailsByRawMaterialId").toPromise().then((resp: any) => {
      this.AllFormulationRawMaterialsInfo = resp.Data;
      this.AllFormulationRawMaterialsInfo.forEach(element => {
        this.rawMaterial.push(this.AllRawMaterialsInfo.filter(item => item.Id == element.RawMaterialId)[0]);
      });
      this.rawMaterial = [...new Map(this.rawMaterial.map(v => [v.Id, v])).values()];
    })
  }
  isDisableConfigureSubComponents() {
    if (this.formulationRawMaterialsModel.RawMaterialId != undefined && this.formulationRawMaterialsModel.SupplierId &&
      this.formulationRawMaterialsModel.ManufacturerId != undefined && this.formulationRawMaterialsModel.TradeName != undefined) {
      this.isConfigureSubComponents = true;
    }
  }
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  RawMaterialChange(event) {
    this.rawMaterialsSuppliers = [];
    this.rawMaterialManufacturers = [];
    this.rawMaterialSuppliers = [];
    this.rawMaterialTradeNames = [];

    if (event != null) {
      this.formulationRawMaterialsModel.SupplierId = null;
      this.formulationRawMaterialsModel.ManufacturerId = null;
      this.formulationRawMaterialsModel.TradeName = "-- Select --";
      let rawMaterialsList = this.AllFormulationRawMaterialsInfo.filter(item => item.RawMaterialId == event);
      this.tradeNameList = rawMaterialsList;
      this.rawMaterialTradeNames = [];
      this.rawMaterialSuppliers = [];
      this.rawMaterialManufacturers = [];
      this.rawMaterialTradeNamesCopy = [];
      // this.rawMaterialManufacturers = this.AllManufacturersInfo;
      // this.rawMaterialSuppliers = this.AllSuppliersInfo;
      rawMaterialsList.forEach(element => {
        this.rawMaterialTradeNamesCopy.push(element.TradeName);
        if (this.AllSuppliersInfo.filter(item => item.Id == element.SupplierId)[0] != undefined)
          this.rawMaterialSuppliers.push(this.AllSuppliersInfo.filter(item => item.Id == element.SupplierId)[0]);
        let rawMaterialsSupplier = rawMaterialsList.filter(item => item.RawMaterialId == event && item.SupplierId == element.SupplierId)
        rawMaterialsSupplier.forEach(element => {
          this.rawMaterialsSuppliers.push(element);
        })

      });
      this.rawMaterialSuppliers = [...new Map(this.rawMaterialSuppliers.map(v => [v.Id, v])).values()];
      this.rawMaterialTradeNamesCopy = [...new Map(this.rawMaterialTradeNamesCopy.map(v => [v, v])).values()];
      this.formulationRawMaterialsModel.RawMaterialId = event;
      // this.formulationRawMaterialsModel.RawMaterialDetailsId = event.Id;
      // this.formulationRawMaterialsModel.SupplierId = event.SupplierId;
      // this.formulationRawMaterialsModel.ManufacturerId = event.ManufacturerId;
      // this.formulationRawMaterialsModel.TradeName = event.TradeName;
      // this.GetSupplierRawMaterialSubComponentDetails(event.Id)
      // this.GetRawMaterialFunctionsBySupplierRawMaterialDetailId(event.Id);
      this.IsCheckRawMaterialInfo();

    }
    else {
      this.isConfigureSubComponents = false;
      this.formulationRawMaterialsModel = new FormulationRawMaterials();
    }
  }
  SupplierChange(event) {
    this.rawMaterialManufacturers = [];
    this.formulationRawMaterialsModel.ManufacturerId = null;
    this.formulationRawMaterialsModel.TradeName = this.defaultTradeName;
    if (event != null) {
      let rawMaterialsList = this.rawMaterialsSuppliers.filter(item => item.SupplierId == event);
      rawMaterialsList.forEach(element => {
        if (this.AllManufacturersInfo.filter(item => item.Id == element.ManufacturerId)[0] != undefined)
          this.rawMaterialManufacturers.push(this.AllManufacturersInfo.filter(item => item.Id == element.ManufacturerId)[0]);
      });
      this.rawMaterialManufacturers = [...new Map(this.rawMaterialManufacturers.map(v => [v.Id, v])).values()];
    }
    else {
      this.formulationRawMaterialsModel.ManufacturerId = null;
    }
    this.bindTradeName();
  }
  MaterialManufacturersChange(event) {
    //this.rawMaterialTradeNames = this.rawMaterialTradeNamesCopy;
    this.bindTradeName();
  }
  bindTradeName()
  {
    this.rawMaterialTradeNames = [];
    this.formulationRawMaterialsModel.TradeName = this.defaultTradeName;
    let supplierID = this.formulationRawMaterialsModel.SupplierId;
    let manufacturerID = this.formulationRawMaterialsModel.ManufacturerId;
    let rawMaterialTradeNameList = this.tradeNameList.filter(item => item.SupplierId == supplierID && item.ManufacturerId == manufacturerID);
    if(rawMaterialTradeNameList.length > 0 )
    {
      rawMaterialTradeNameList.forEach(element => {
        this.rawMaterialTradeNames.push(element.TradeName);
      });
    }
    else
    {
      this.rawMaterialTradeNames = [];
      this.formulationRawMaterialsModel.TradeName = this.defaultTradeName;
    }
  }
  PostReactionSubcomponentRawMaterialChange(event) {
    if (event.Id != null) {
      this.newSubComponentRawMaterialInfo.RawMaterialDetailsId = event.Id;
      this.newSubComponentRawMaterialInfo.SupplierId = event.SupplierId;
      this.newSubComponentRawMaterialInfo.ManufacturerId = event.ManufacturerId;
      this.newSubComponentRawMaterialInfo.TradeName = event.TradeName;
      this.GetNewSupplierRawMaterialSubComponentDetails(event.Id)
      this.GetNewRawMaterialFunctionsBySupplierRawMaterialDetailId(event.Id);
    }
  }
  FormulationRawMaterialsModal(content) {
    this.IsCheckRawMaterial = false;
    this.rawMaterialTradeNames = [];
    this.rawMaterialSuppliers = [];
    this.rawMaterialManufacturers = [];
    this.isConfigureSubComponents = false;
    this.actionType = true;
    this.IsCheckFormulationRawMaterials = false;
    this.formulationRawMaterialsModel = new FormulationRawMaterials();
    this.modalReference = this.modalService.open(content, { size: 'xl' });
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
  AddFormulationRawMaterialsInfo() {
    if ((this.formGroups.get('items') as FormArray).controls.length != 0) {
      this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents = this.formGroups.value.items;
    }

    this.SubComponentValidationMessage = '';
    let isAnyFunctionEmpty =
      this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents.filter(item => item.SubComponentFunctions.length === 0).length > 0;
    var isAnyCasNumberEmpty = this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents.find(item => item.CASNumber.toString() === '');
    if (isAnyFunctionEmpty) {
      this.SubComponentValidationMessage = "Sub-component functions";
      this.CASNumberValidation = true;
    }
    if (isAnyCasNumberEmpty !== undefined) {
      // this._notificationService.showWarning('', 'CAS Number is missing.');
      this.SubComponentValidationMessage = (isAnyFunctionEmpty ? this.SubComponentValidationMessage + ' & ' : '') + 'CAS Number';
      this.CASNumberValidation = true;
    }
    this.SubComponentValidationMessage = this.SubComponentValidationMessage + ' is required.'
    if (this.CASNumberValidation) {
      setTimeout(() => {
        this.CASNumberValidation = false;
      }, 5000);
      return null;
    }

    if(this.formulationRawMaterialsModel.RawMaterialId === undefined || this.formulationRawMaterialsModel.RawMaterialId === null) {
      this.formulationRawMaterialsModel.RawMaterialId = this.formulationRawMaterialsModel.RawMaterialIds;
    }
  
    this.formulationRawMaterialsModel.FormulationDetailId = this.formulationDetailId;
    if (this.formulationRawMaterialsModel.Id == undefined) {
      this.formulationRawMaterialsModel.CreatedBy = this.userName;
      if (this.formulationRawMaterialsModel.RawMaterialId != undefined && this.formulationRawMaterialsModel.SupplierId != undefined && this.formulationRawMaterialsModel.ManufacturerId != undefined && this.formulationRawMaterialsModel.TradeName != undefined) {
        let params = new HttpParams().set("Name", this.formulationRawMaterialsModel.TradeName).set("rawMaterialId", this.formulationRawMaterialsModel.RawMaterialId).set("supplierId", this.formulationRawMaterialsModel.SupplierId).set("manufacturerId", this.formulationRawMaterialsModel.ManufacturerId).set("Id", '0');
        this.rmmapi.getData("SupplierRawMaterialDetails/CheckDuplicateSupplierRawMaterialDetails", params).toPromise().then((resp: any) => {
          if (resp.Data) {
            this.IsCheckRawMaterialLevel2 = false;
            let params = new HttpParams().set("Name", this.formulationRawMaterialsModel.TradeName).set("rawMaterialId", this.formulationRawMaterialsModel.RawMaterialId).set("SupplierRawMaterialDetailId", this.formulationRawMaterialsModel.RawMaterialDetailsId).set("formulationDetailId", this.formulationDetailId).set("supplierId", this.formulationRawMaterialsModel.SupplierId).set("manufacturerId", this.formulationRawMaterialsModel.ManufacturerId).set("Id", (this.formulationRawMaterialsModel.Id ? this.formulationRawMaterialsModel.Id : 0));
            this.rmmapi.getData("FormulationRawMaterials/CheckDuplicateFormulationRawMaterials", params).toPromise().then((resp: any) => {
              this.IsCheckRawMaterial = resp.Data;
              if (!this.IsCheckRawMaterial) {
                this.rmmapi.postData("FormulationRawMaterials/AddFormulationRawMaterials", this.formulationRawMaterialsModel).toPromise().then((resp: any) => {
                  if (resp && resp.Status) {
                    this._notificationService.showSuccess("", "Raw Material added successfully");
                    this.GetFormulationRawMaterialsDetails();
                    this.modalReference.close();
                  } else {
                    // this._notificationService.showError("", resp.Message);
                    this._notificationService.showError("", "Sorry, Raw Material details could not be saved");

                  }
                })
              }
            })
          }
          else {
            this.IsCheckRawMaterialLevel2 = true;
          }
        })
      }

    }
    else {
      this.formulationRawMaterialsModel.UpdatedBy = this.userName;
      this.rmmapi.postData("FormulationRawMaterials/UpdateFormulationRawMaterials", this.formulationRawMaterialsModel).toPromise().then((resp: any) => {
        if (resp && resp.Status) {
          this._notificationService.showSuccess("", "Raw Material updated successfully" );
          this.GetFormulationRawMaterialsDetails();
          this.modalReference.close();
        } else {
          // this._notificationService.showError("", resp.Message);
          this._notificationService.showError("", "Sorry, Raw Material details could not be updated");
        }
      });
    }
  }
  public getFormControl(dataItem: any, field: string): FormControl {
    return <FormControl>(
      (this.formGroups.get('items') as FormArray).controls
        .find((i) => i.value.SubComponentId === dataItem.SubComponentId)
        .get(field)
    );
  }
  GetDocRefList(list: any, name: string) {
    this.docRefList = [];
    let names = name.split(',');
    if (name != "") {
      names.forEach(element => {
        let item = list.find(x => x.Id == element);
        if (item) {
          this.docRefList.push(item);
        }
      });
    }
  }

  loadSubComponentData(subComponent: any) {
    this.formGroups = new FormGroup({ items: new FormArray([]) });
    this.view = subComponent; //this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents;
    this.view.forEach((i) => {
      if (i.Impurity == undefined) {
        i.Impurity = false;
      }
      //this.GetDocRefList(this.subComponentFunctionList,i.SubComponentFunctions);
      const formGroup = new FormGroup({
        Id: new FormControl(i.Id),
        SubComponentId: new FormControl(i.SubComponentId),
        SubComponentName: new FormControl(i.SubComponentName),
        GivenSubComponentName: new FormControl(i.GivenSubComponentName),
        SubComponentFunctions: new FormControl(i.SubComponentFunctions),
        Impurity: new FormControl(i.Impurity),
        CASNumber: new FormControl(i.CASNumber, [Validators.required]),
        ECNumberOrKENumber: new FormControl(i.ECNumberOrKENumber),
        EUINCIName: new FormControl(i.EUINCIName),
        USINCIName: new FormControl(i.USINCIName),
        PostReactionWeightInFinishedProduct: new FormControl(i.PostReactionWeightInFinishedProduct),
        SubComponentConcentrationINCI: new FormControl(i.SubComponentConcentrationINCI),
        RawMaterialSubComponentConcentration: new FormControl(i.RawMaterialSubComponentConcentration),
      });
      (this.formGroups.get("items") as FormArray).push(formGroup);
      console.log('ConfigureSubComponentsModal: while loading component with subcomponent grid');
      console.log(formGroup);
    });
  }
  ConfigureSubComponentsModal(FormulationRawMaterials, SubComponentsRawMaterials) {
        this.formGroups = new FormGroup({ items: new FormArray([]) });
        if ((this.formGroups.get("items") as FormArray).controls.length === 0) {
          if (this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents != undefined) {
            let data = orderBy(this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents, this.sort);
            this.loadSubComponentData(data);
            // this.view = this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents;
            // this.view.forEach((i) => {
            //   if (i.Impurity == undefined) {
            //     i.Impurity = false;
            //   }
            //   //this.GetDocRefList(this.subComponentFunctionList,i.SubComponentFunctions);
            //   const formGroup = new FormGroup({
            //     Id: new FormControl(i.Id),
            //     SubComponentId: new FormControl(i.SubComponentId),
            //     SubComponentName: new FormControl(i.SubComponentName),
            //     GivenSubComponentName: new FormControl(i.GivenSubComponentName),
            //     SubComponentFunctions: new FormControl(i.SubComponentFunctions),
            //     Impurity: new FormControl(i.Impurity),
            //     CASNumber: new FormControl(i.CASNumber, [Validators.required]),
            //     ECNumberOrKENumber: new FormControl(i.ECNumberOrKENumber),
            //     EUINCIName: new FormControl(i.EUINCIName),
            //     USINCIName: new FormControl(i.USINCIName),
            //     PostReactionWeightInFinishedProduct: new FormControl(i.PostReactionWeightInFinishedProduct),
            //     SubComponentConcentrationINCI: new FormControl(i.SubComponentConcentrationINCI),
            //     RawMaterialSubComponentConcentration: new FormControl(i.RawMaterialSubComponentConcentration),
            //   });
            //   (this.formGroups.get("items") as FormArray).push(formGroup);
            //   console.log('ConfigureSubComponentsModal: while loading component with subcomponent grid');
            //   console.log(formGroup);
            // });
          }
        }
        this.modalReference.close(FormulationRawMaterials);
        this.modalReference = this.modalService.open(SubComponentsRawMaterials, { size: 'xl' });  
  }

  // searchFilter: SearchFilter = new SearchFilter();
  // public sort: SortDescriptor[] = [{ field: 'RawMaterialName', dir: 'asc' }];
  // public multiple = false;
  // public allowUnsort = true;


  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "RawMaterialName asc";
  this.sort = sort;  
    this.GetFormulationRawMaterialsDetails();
    let data = orderBy(this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents, this.sort);
    this.loadSubComponentData(data);
  }
  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber = event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetFormulationRawMaterialsDetails();
   
  }
  EditFormulationRawMaterialsInfo(value1: any, value2: any) {
   
    this.actionType = false;
    this.isConfigureSubComponents = true;
    this.IsCheckFormulationRawMaterials = false;
    this.formulationRawMaterialsModel = value2;
    if (this.AllFormulationRawMaterialsInfo.length > 0)
      this.formulationRawMaterialsModel.RawMaterialIds = value2.RawMaterialId;// this.AllFormulationRawMaterialsInfo.filter(item => item.RawMaterialId == value2.RawMaterialId)[0];
    let rawMaterialsList = this.AllFormulationRawMaterialsInfo.filter(item => item.RawMaterialId == value2.RawMaterialId);
    this.rawMaterialTradeNames = [];
    this.rawMaterialSuppliers = [];
    this.rawMaterialManufacturers = [];
    rawMaterialsList.forEach(element => {
      this.rawMaterialTradeNames.push(element.TradeName);
      this.rawMaterialSuppliers.push(this.AllSuppliersInfo.filter(item => item.Id == element.SupplierId)[0]);
      this.rawMaterialManufacturers.push(this.AllManufacturersInfo.filter(item => item.Id == element.ManufacturerId)[0]);
    });
    this.rawMaterialManufacturers = this.rawMaterialManufacturers.filter(item => item != undefined);
    this.rawMaterialManufacturers = [...new Map(this.rawMaterialManufacturers.map(v => [v.Id, v])).values()];
    this.rawMaterialSuppliers = this.rawMaterialSuppliers.filter(item => item != undefined);
    this.rawMaterialSuppliers = [...new Map(this.rawMaterialSuppliers.map(v => [v.Id, v])).values()];
    this.rawMaterialTradeNames = [...new Map(this.rawMaterialTradeNames.map(v => [v, v])).values()];
    this.GetFormulationRawMaterialFunctionsById(value2.Id);
    this.GetFormulationRawMaterialSubComponentsByFormulationRawMaterialId(value2.Id);
    this.formGroups = new FormGroup({ items: new FormArray([]) });
    if ((this.formGroups.get("items") as FormArray).controls.length === 0) {
      this.view = this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents;
      this.view.forEach((i) => {
        if (i.Impurity == undefined) {
          i.Impurity = false;
        }
        const formGroup = new FormGroup({
          Id: new FormControl(i.Id),
          SubComponentId: new FormControl(i.SubComponentId),
          SubComponentName: new FormControl(i.SubComponentName),
          GivenSubComponentName: new FormControl(i.GivenSubComponentName),
          SubComponentFunctions: new FormControl(i.SubComponentFunctions),
          Impurity: new FormControl(i.Impurity),
          CASNumber: new FormControl(i.CASNumber, [Validators.required]),
          ECNumberOrKENumber: new FormControl(i.ECNumberOrKENumber),
          EUINCIName: new FormControl(i.EUINCIName),
          USINCIName: new FormControl(i.USINCIName),
          PostReactionWeightInFinishedProduct: new FormControl(i.PostReactionWeightInFinishedProduct),
          SubComponentConcentrationINCI: new FormControl(parseFloat(i.SubComponentConcentrationINCI).toFixed(7)),
          RawMaterialSubComponentConcentration: new FormControl(i.RawMaterialSubComponentConcentration),
        });
        (this.formGroups.get("items") as FormArray).push(formGroup);
      });
    }
    this.modalReference = this.modalService.open(value1, { size: 'xl' });
  }
  GetFormulationRawMaterialSubComponentsByFormulationRawMaterialId(id) {
    let params = new HttpParams().set("id", id);
    this.rmmapi.getData("FormulationRawMaterials/GetFormulationRawMaterialSubComponentsByFormulationRawMaterialId", params).toPromise().then((resp: any) => {
      this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents = resp.Data;
    });
  }
  InActiveModalInfo(value1: any, value2: any) {
    this.formulationRawMaterialsModel.Id = value2.Id;
    this.formulationRawMaterialsModel.TradeName = value2.TradeName;
    this.formulationRawMaterialsModel.RawMaterialName = value2.RawMaterialName;
    this.modalReference = this.modalService.open(value1, { size: 'sm' });
  }
  DeleteFormulationRawMaterialsInfo() {

    this.rmmapi.postData("FormulationRawMaterials/DeleteFormulationRawMaterials", { Id: this.formulationRawMaterialsModel.Id, UpdatedBy: this.userName }).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetFormulationRawMaterialsDetails();
          this.modalReference.close();
         // this._notificationService.showSuccess("", this.formulationRawMaterialsModel.RawMaterialName + resp.Message);
         this._notificationService.showSuccess("", "Raw Material deleted successfully");
        } else {
          this.modalReference.close();
          this._notificationService.showWarning("", this.formulationRawMaterialsModel.RawMaterialName + resp.Message);
        }
      } else {
        this._notificationService.showError("", resp.Message);
        this.modalReference.close();
      }
    })
  }
  GetSubComponentFunctionsByRawMaterialSubComponentDetailId() {
    this.rmmapi.getData("FormulationRawMaterials/GetSubComponentFunctionsByRawMaterialSubComponentDetailId").toPromise().then((resp: any) => {
      this.subComponentFunctionList = resp.Data;
    });
  }
  GetSupplierRawMaterialSubComponentDetails(id) {
`  `
    this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents = [];
    let params = new HttpParams().set("Id", id)
      .set("SortExpression", "ID")
      .set("SortAscending", "0")
      .set("PageIndex", "0")
      .set("PageSize", "100000");
    this.rmmapi.getData("SupplierRawMaterialSubComponentDetails/GetSupplierRawMaterialSubComponentDetails", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.supplierRawMaterialInfo = res.Data.Data;
        this.supplierRawMaterialInfo.forEach(element => {

          let obj = new FormulationRawMaterialSubComponents();
          obj.SubComponentName = element.SubComponentName;
          obj.GivenSubComponentName = element.GivenSubComponentName;
          obj.SubComponentFunctionName = element.SubComponentFunctionName;
          obj.RawMaterialSubComponentConcentration = element.RawMaterialSubComponentConcentration;
          obj.Impurity = element.ImpuritiesPPM;
          obj.EUINCIName = element.EUINCIName;
          obj.USINCIName = element.USINCIName;
          obj.SubComponentId = element.SubComponentId;
          obj.ECNumberOrKENumber = element.ECNumberOrKENumber;
          obj.CASNumber = element.CASNumber;
          if (this.formulationRawMaterialsModel.RawMaterialConcentration === undefined || this.formulationRawMaterialsModel.RawMaterialConcentration !== NaN) {
            this.formulationRawMaterialsModel.RawMaterialConcentration = '';
          } else {
            this.formulationRawMaterialsModel.RawMaterialConcentration = parseFloat(this.formulationRawMaterialsModel.RawMaterialConcentration);
          }
          if (this.actionType) {
            let tempConcentrationValue = (this.formulationRawMaterialsModel.RawMaterialConcentration * (parseFloat(element.RawMaterialSubComponentConcentration) <= 0 ? 1 : element.RawMaterialSubComponentConcentration)) / 100;
            obj.SubComponentConcentrationINCI = tempConcentrationValue === NaN ? 0 : tempConcentrationValue;
          }
          if (this.subComponentFunctionList.length > 0)
            obj.SubComponentFunctions =  element.SupplierRawMaterialSubComponentFunctions;
          this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents.push(obj);
        });
      }
      // let formulationConcentrationValue = this.formulationRawMaterialsModel.RawMaterialConcentration;
      // this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents.map(item => {
      //   item.SubComponentConcentrationINCI = (formulationConcentrationValue * (item.SubComponentConcentrationINCI <= 0 ? 1 : item.SubComponentConcentrationINCI)) / 100
      // });
    });
  }
  GetNewSupplierRawMaterialSubComponentDetails(id) {
    this.newSubComponentRawMaterialInfo.FormulationRawMaterialSubComponents = [];
    let params = new HttpParams().set("Id", id);
    this.rmmapi.getData("SupplierRawMaterialSubComponentDetails/GetSupplierRawMaterialSubComponentDetails", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.supplierRawMaterialInfo = res.Data;
        this.supplierRawMaterialInfo.forEach(element => {
          let obj = new FormulationRawMaterialSubComponents();
          obj.SubComponentName = element.GivenSubComponentName;
          obj.SubComponentFunctionName = element.SubComponentFunctionName;
          obj.Impurity = element.ImpuritiesPPM;
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
  AddNewPostReactionSubcomponent(content) {
    this.GetSubComponentFunctions();
    this.GetSubComponent();
    this.formTitle = "Add Sub-component";
    this.buttonName = "Save";
    this.functionName = [];
    this.Model = new FormulationRawMaterialSubComponents();
    this.newSubComponentRawMaterialInfo = new FormulationRawMaterials();
    this.modalReference.close();
    this.modalReference = this.modalService.open(content, { size: 'xl' });
  }
  GetFunctionName(list: any, name: string) {
    let names = name.split(',');
    names.forEach(element => {
      let item = list.find(x => x.Name == element);
      this.functionName.push(item);
    });
  }
  GetSubComponentFunctions(functionName?: any) {
    this.rmmapi.getData("SupplierRawMaterialSubComponentDetails/GetSubComponentFunctions").toPromise().then((res: any) => {
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
  ClosePostReactionSubcomponent(content) {
    this.modalReference.close();
    this.modalReference = this.modalService.open(content, { size: 'xl' });
  }
  AddPostReactionSubcomponent(content) {
    this.modalReference.close();
    let obj = new FormulationRawMaterialSubComponents();
    obj.Id = this.Model.Id;
    obj.SubComponentName = this.Model.SubComponentName;
    obj.SubComponentFunctions = this.Model.SubComponentFunction;
    obj.Impurity = this.Model.ImpuritiesPPM.Id == 1 ? true : false;
    obj.EUINCIName = this.Model.EUINCIName;
    obj.USINCIName = this.Model.USINCIName;
    obj.SubComponentId = this.Model.SubComponentId;
    obj.ECNumberOrKENumber = this.Model.ECNumberOrKENumber;
    obj.CASNumber = this.Model.CASNumber;
    this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents.push(obj);
    const formGroup = new FormGroup({
      Id: new FormControl(this.Model.Id),
      SubComponentId: new FormControl(this.Model.SubComponentId),
      SubComponentName: new FormControl(this.Model.SubComponentName),
      GivenSubComponentName: new FormControl(this.Model.GivenSubComponentName),
      SubComponentFunctions: new FormControl(this.Model.SubComponentFunction),
      Impurity: new FormControl(this.Model.ImpuritiesPPM.Id == 1 ? true : false),
      CASNumber: new FormControl(this.Model.CASNumber),
      ECNumberOrKENumber: new FormControl(this.Model.ECNumberOrKENumber),
      EUINCIName: new FormControl(this.Model.EUINCIName),
      USINCIName: new FormControl(this.Model.USINCIName),
      PostReactionWeightInFinishedProduct: new FormControl(this.Model.PostReactionWeightInFinishedProduct),
      SubComponentConcentrationINCI: new FormControl(this.Model.SubComponentConcentrationINCI),
      RawMaterialSubComponentConcentration: new FormControl(this.Model.RawMaterialSubComponentConcentration),
    });
    (this.formGroups.get("items") as FormArray).push(formGroup);
    this.modalReference = this.modalService.open(content, { size: 'xl' });
    this.OnTDSConcentrationChange();
  }
  IsCheckFormulationRawMaterialsInfo() {
    // let params = new HttpParams().set("Name",this.formulationRawMaterialsModel.TradeName).set("Id", (this.formulationRawMaterialsModel.Id ? this.formulationRawMaterialsModel.Id : 0));
    // this.rmmapi.getData("SupplierFormulationRawMaterialsDetails/CheckDuplicateSupplierFormulationRawMaterialsDetails", params).toPromise().then((resp: any) => {
    //   this.IsCheckFormulationRawMaterials = resp.Data;
    // })
  }
  handleFilter(value) {
    this.subComponentList = this.data.filter(
      (s) => s.Name.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }
  OnSubComponentChange(event: any) {
    if (event.Name != "-- Select --") {
      this.Model.GivenSubComponentName = this.Model.SubComponentName = event.Name;
    }
    else {
      this.Model.GivenSubComponentName = this.Model.SubComponentName = "";
    }

    this.Model.CASNumber = event.CASNumber;
    this.Model.EINECSNumber = event.EINECSNumber;
    this.Model.EUINCIName = event.EUINCIName;
    this.Model.USINCIName = event.USINCIName;
    this.Model.ECNumberOrKENumber = event.ECNumberOrKENumber;
    this.Model.SubComponentId = event.Id;
  }
  GetSubComponent(subComponentId?: number) {
    this.rmmapi.getData("SubComponent/GetSubComponents").toPromise().then((res: any) => {
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
  IsCheckRawMaterialFuns() {
    if (this.formulationRawMaterialsModel.RawMaterialId != undefined && this.formulationRawMaterialsModel.SupplierId != undefined && this.formulationRawMaterialsModel.ManufacturerId != undefined && this.formulationRawMaterialsModel.TradeName != undefined && this.formulationRawMaterialsModel.TradeName != "-- Select --") {
      if (!this.IsCheckRawMaterial) {
        if (this.formulationRawMaterialsModel.RawMaterialFunctions.length > 0)
          this.isConfigureSubComponents = true;
        else
          this.isConfigureSubComponents = false;
      }
    }
  }
  IsCheckRawMaterialInfo() {
    if (this.formulationRawMaterialsModel.RawMaterialId != undefined && this.formulationRawMaterialsModel.SupplierId != undefined && this.formulationRawMaterialsModel.ManufacturerId != undefined && this.formulationRawMaterialsModel.TradeName != undefined && this.formulationRawMaterialsModel.TradeName != "-- Select --") {
      if (this.formulationRawMaterialsModel.RawMaterialId != undefined && this.formulationRawMaterialsModel.SupplierId != undefined && this.formulationRawMaterialsModel.ManufacturerId != undefined && this.formulationRawMaterialsModel.TradeName != undefined) {
        let params = new HttpParams().set("Name", this.formulationRawMaterialsModel.TradeName).set("rawMaterialId", this.formulationRawMaterialsModel.RawMaterialId).set("supplierId", this.formulationRawMaterialsModel.SupplierId).set("manufacturerId", this.formulationRawMaterialsModel.ManufacturerId).set("Id", '0');
        this.rmmapi.getData("SupplierRawMaterialDetails/CheckDuplicateSupplierRawMaterialDetails", params).toPromise().then((resp: any) => {
          if (resp.Data) {
            this.IsCheckRawMaterialLevel2 = false;
            if (this.AllFormulationRawMaterialsInfo.filter(item => item.SupplierId == this.formulationRawMaterialsModel.SupplierId && item.RawMaterialId == this.formulationRawMaterialsModel.RawMaterialId && item.ManufacturerId == this.formulationRawMaterialsModel.ManufacturerId && item.TradeName == this.formulationRawMaterialsModel.TradeName).length > 0) {
              this.formulationRawMaterialsModel.RawMaterialDetailsId = this.AllFormulationRawMaterialsInfo.filter(item => item.SupplierId == this.formulationRawMaterialsModel.SupplierId && item.RawMaterialId == this.formulationRawMaterialsModel.RawMaterialId && item.ManufacturerId == this.formulationRawMaterialsModel.ManufacturerId && item.TradeName == this.formulationRawMaterialsModel.TradeName)[0].Id;
              //  this.GetSupplierRawMaterialSubComponentDetails(this.formulationRawMaterialsModel.RawMaterialDetailsId);
              this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents = [];
              let params2 = new HttpParams().set("Id", this.formulationRawMaterialsModel.RawMaterialDetailsId)
                .set("SortExpression", "ID")
                .set("SortAscending", "0")
                .set("PageIndex", "0")
                .set("PageSize", "100000");
              this.rmmapi.getData("SupplierRawMaterialSubComponentDetails/GetSupplierRawMaterialSubComponentDetails", params2).toPromise().then((res: any) => {
                if (res && res.Status && res.Data) {
                  this.supplierRawMaterialInfo = res.Data.Data;
                  this.supplierRawMaterialInfo.forEach(element => {
                    let obj = new FormulationRawMaterialSubComponents();
                    obj.SubComponentName = element.SubComponentName;
                    obj.GivenSubComponentName = element.GivenSubComponentName;
                    obj.SubComponentFunctionName = element.SubComponentFunctionName;
                    obj.RawMaterialSubComponentConcentration = element.RawMaterialSubComponentConcentration;
                    obj.Impurity = element.ImpuritiesPPM;
                    obj.EUINCIName = element.EUINCIName;
                    obj.USINCIName = element.USINCIName;
                    obj.SubComponentId = element.SubComponentId;
                    obj.ECNumberOrKENumber = element.ECNumberOrKENumber;
                    obj.CASNumber = element.CASNumber;
                    if (this.formulationRawMaterialsModel.RawMaterialConcentration === undefined || this.formulationRawMaterialsModel.RawMaterialConcentration !== NaN) {
                      this.formulationRawMaterialsModel.RawMaterialConcentration = '';
                    } else {
                      this.formulationRawMaterialsModel.RawMaterialConcentration = parseFloat(this.formulationRawMaterialsModel.RawMaterialConcentration);
                    }
                    if (this.actionType) {
                      let tempConcentrationValue = (this.formulationRawMaterialsModel.RawMaterialConcentration * (parseFloat(element.RawMaterialSubComponentConcentration) <= 0 ? 1 : element.RawMaterialSubComponentConcentration)) / 100;
                      obj.SubComponentConcentrationINCI = tempConcentrationValue === NaN ? 0 : tempConcentrationValue;
                    }
                    if (this.subComponentFunctionList.length > 0)
                      obj.SubComponentFunctions = element.SupplierRawMaterialSubComponentFunctions;
                    this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents.push(obj);
                  });
                  let data = orderBy(this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents, this.sort);
                  this.loadSubComponentData(data);
                }
                this.rmmapi.postData("SupplierRawMaterialDetails/GetRawMaterialFunctionsBySupplierRawMaterialDetailId", { Id: this.formulationRawMaterialsModel.RawMaterialDetailsId }).toPromise().then((resp: any) => {
                  this.formulationRawMaterialsModel.RawMaterialFunctions = resp.Data;
                  let params = new HttpParams().set("Name", this.formulationRawMaterialsModel.TradeName).set("rawMaterialId", this.formulationRawMaterialsModel.RawMaterialId).set("SupplierRawMaterialDetailId", this.formulationRawMaterialsModel.RawMaterialDetailsId).set("formulationDetailId", this.formulationDetailId).set("supplierId", this.formulationRawMaterialsModel.SupplierId).set("manufacturerId", this.formulationRawMaterialsModel.ManufacturerId).set("Id", (this.formulationRawMaterialsModel.Id ? this.formulationRawMaterialsModel.Id : 0));
                  this.rmmapi.getData("FormulationRawMaterials/CheckDuplicateFormulationRawMaterials", params).toPromise().then((resp: any) => {
                    this.IsCheckRawMaterial = resp.Data;
                    if (!this.IsCheckRawMaterial) {
                      if (this.formulationRawMaterialsModel.RawMaterialFunctions != undefined && this.formulationRawMaterialsModel.RawMaterialFunctions != null) {
                        if (this.formulationRawMaterialsModel.RawMaterialFunctions.length > 0)
                          this.isConfigureSubComponents = true;
                        else
                          this.isConfigureSubComponents = false;
                      }
                      else {
                        this.rmmapi.postData("SupplierRawMaterialDetails/GetRawMaterialFunctionsBySupplierRawMaterialDetailId", { Id: this.formulationRawMaterialsModel.RawMaterialDetailsId }).toPromise().then((resp: any) => {
                          this.formulationRawMaterialsModel.RawMaterialFunctions = resp.Data;
                          if (this.formulationRawMaterialsModel.RawMaterialFunctions.length > 0)
                            this.isConfigureSubComponents = true;
                          else
                            this.isConfigureSubComponents = false;
                        });
                      }
                    }
                  })
                });
              });
            }
          }
          else {
            this.IsCheckRawMaterialLevel2 = true;
            this.IsCheckRawMaterial = false;
            this.formulationRawMaterialsModel.RawMaterialFunctions = [];
          }
        })
      }
    }
    else {
      this.IsCheckRawMaterial = false;
      this.isConfigureSubComponents = false;
      this.formulationRawMaterialsModel.RawMaterialFunctions = [];
    }
  }
  OnTDSConcentrationChange() {
    
    if (this.formulationRawMaterialsModel.RawMaterialConcentration === NaN || this.formulationRawMaterialsModel.RawMaterialConcentration === 0 || this.formulationRawMaterialsModel.RawMaterialConcentration === undefined) {
      return 0;
    }
    if ((this.formGroups.get('items') as FormArray).controls.length != 0) {
      this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents = this.formGroups.value.items;
    }
    this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents.map(item => {
      var finalValue = 1;
      if (item.SubComponentConcentrationINCI !== NaN && item.SubComponentConcentrationINCI !== undefined) {
        finalValue = item.RawMaterialSubComponentConcentration;
      }
      item.SubComponentConcentrationINCI = ((this.formulationRawMaterialsModel.RawMaterialConcentration * finalValue) / 100).toFixed(8);
      if (item.SubComponentConcentrationINCI === NaN) {
        item.SubComponentConcentrationINCI = 0;
      }
      console.log(item.SubComponentConcentrationINCI);
      console.log(item.RawMaterialSubComponentConcentration + ' * ' + this.formulationRawMaterialsModel.RawMaterialConcentration + '/ 100 = ' + item.SubComponentConcentrationINCI);
    });
    this.formGroups = new FormGroup({ items: new FormArray([]) });
    if ((this.formGroups.get("items") as FormArray).controls.length === 0) {
      this.view = this.formulationRawMaterialsModel.FormulationRawMaterialSubComponents;
      this.view.forEach((i) => {
        if (i.Impurity == undefined) {
          i.Impurity = false;
        }
        const formGroup = new FormGroup({
          Id: new FormControl(i.Id),
          SubComponentId: new FormControl(i.SubComponentId),
          SubComponentName: new FormControl(i.SubComponentName),
          GivenSubComponentName: new FormControl(i.GivenSubComponentName),
          SubComponentFunctions: new FormControl(i.SubComponentFunctions),
          Impurity: new FormControl(i.Impurity),
          CASNumber: new FormControl(i.CASNumber, [Validators.required]),
          ECNumberOrKENumber: new FormControl(i.ECNumberOrKENumber),
          EUINCIName: new FormControl(i.EUINCIName),
          USINCIName: new FormControl(i.USINCIName),
          PostReactionWeightInFinishedProduct: new FormControl(i.PostReactionWeightInFinishedProduct),
          SubComponentConcentrationINCI: new FormControl(parseFloat(i.SubComponentConcentrationINCI).toFixed(7)),
          RawMaterialSubComponentConcentration: new FormControl(i.RawMaterialSubComponentConcentration),
        });
        (this.formGroups.get("items") as FormArray).push(formGroup);
      });
    }
  }

  IsValidationInvalid(dataItem: any, field: string) {
    let result = false;
    // // result = this.formGroups.controls.items.get(field).valid;
    // let formArrayList = this.formGroups.controls.items as FormArray;
    // formArrayList.controls.filter(item => {
    //   let formGroupData = item as FormGroup;
    //   if(formGroupData.status === 'INVALID'){
    //     result = true; //formGroupData.get(field).invalid
    //     result = formGroupData.controls[field].invalid
    //   }
    // });
    return result;
  }

  CheckFormulationSubComponentGridValidation() {
    let result = false;
    // let formArrayList = this.formGroups.controls.items as FormArray;
    // formArrayList.controls.filter(item => {
    //   let formGroupData = item as FormGroup;
    //   if(formGroupData.status === 'INVALID'){
    //     result = true;
    //     // console.log('controls: ')
    //     // console.log(JSON.stringify(formGroupData.controls));
    //   }
    // });
    return result;
  }

  JsonStringyfy() {
    return JSON.stringify(this.view);
  }

  NumberTypeValidation(event:any,dataItem: any){
    BlockInvalidChar(event);
    dataItem.PostReactionWeightInFinishedProduct = event.target.value;
  }
  NumberTypeValidation2(event:any,dataItem: any){
    BlockInvalidChar(event);
    dataItem.SubComponentConcentrationINCI = event.target.value;
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

  functionChange(event: any, dataItem: any) {
    if (event && event.length > 0) {
      let item = event.find(x => x.Name === "Impurity");
      let control = this.getFormControl(dataItem, 'Impurity');
      if (item) {
        control.setValue(true);
        control.disable();
      } else if (item === undefined && control.disabled === true) {
        control.setValue(false);
        control.enable();
      }
    }
  }

}