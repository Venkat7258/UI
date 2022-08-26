import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import * as XLSX from 'xlsx';
import { SubComponent } from '../../Models/sub-component';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../shared/services/notification.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { getDate } from '@progress/kendo-date-math';
import { HttpParams } from '@angular/common/http';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { EnvService } from 'src/app/shared/services/env.service';

@Component({
  selector: 'app-sub-component',
  templateUrl: './sub-component.component.html',
  styleUrls: ['./sub-component.component.css']
})
export class SubComponentComponent implements OnInit {
  public SubcomponentList: GridDataResult;
  searchFilter: SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [{ field: 'Name', dir: 'asc' }];
  public type = "numeric";
  public position = "bottom";
  public statustypesinfo: any = [];
  public SubcomponentInfo: any[] = [];
  public SubComponentData: any = [];
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  subcomponentfunctions: any[];
  moduleName: any = "Sub-components"
  model: any = new SubComponent();
  actionType: boolean = true;
  closeResult: string;
  SubComponentform: any;
  isDuplicateSubComponent: boolean = false;
  @ViewChild("fileInputRef", { static: false }) fileInputRef;
  mandatoryItem: any[] = [{ Name: "Yes", Id: 1 }, { Name: "No", Id: 0 }];
  constructor(public _appService: AppService,
    public rmmapi: RMMApiService,
    private _modalService: NgbModal,
    private _notifyService: NotificationService,
    public env: EnvService) {
    this.SubComponentform = new FormGroup({
      Name: new FormControl("", Validators.required),
      CASNumber: new FormControl("", Validators.required),
      EUINCIName: new FormControl(""),
      USINCIName: new FormControl(""),
      ECNumberOrKENumber: new FormControl(""),
      Functions: new FormControl("", Validators.required)
    
      // ddl_SubComponents:new FormControl("",Validators.required)
    })
  }

  ngOnInit(): void {
    this.model.Import = "Sub-component";
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetSubComponents();
    this.GetSubComponentFunctions();
    const sessionTab = this.rmmapi.getStorage(this.env.CurrentTabState.TabName);
    const tempSubMenuArray = [
      'Sub-components',
      'Import']
    if (tempSubMenuArray.find(item => item == sessionTab)) {
      this.tabchange(sessionTab);
    } else {
      this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
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
    this.GetSubComponents();
  }
  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
    this.sort = sort;
    this.GetSubComponents();
  }
  GetSubComponents() {
    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort);
    this.rmmapi.getData("SubComponent/GetAllSubComponents", params).toPromise().then((resp: any) => {
      this.SubcomponentInfo = resp.Data;
      this.SubcomponentList = {
        data: resp.Data.SubComponentDetailsList,
        total: resp.Data.SubComponentDetailsList && resp.Data.SubComponentDetailsList.length > 0 ? resp.Data.SubComponentDetailsList[0].TotalRecords : 0
      };
    })
  }
  GetSubComponentFunctions() {
    this.SubComponentData = [];
    this.rmmapi.getData("SubComponent/GeSubComponentFunctionNames").toPromise().then((resp: any) => {
      this.SubComponentData = resp.Data;
    })
  }
  GetSubComponentsBySubcomponentId(Id: any) {
    this.SubComponentData = [];
    this.model.Functions = [];
    this.rmmapi.postData("SubComponent/GetSubComponentsBySubcomponentId", Id).toPromise().then((res: any) => {
      if (res && res.Data) {
        this.SubComponentData = res.Data;
        this.model.Functions = res.Data;
      }
      this.GetSubComponentFunctions();
    });
  }

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  AddSubComponent(content) {
    this.SubComponentform.reset();  
    this.SubComponentform.markAsUntouched();
    this.actionType = true;
    this.model = new SubComponent();
    this.model.Id = 0;
    this.modalReference = this._modalService.open(content, { size: 'xl' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.listModel = [];
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
  EditSubComponentsInfo(value1: any, value2: any) {
    this.isDuplicateSubComponent = false;
    if (this.rmmapi.getRolePrivilege('VSC') && this.rmmapi.getRolePrivilege('MSC')) {
      this.actionType = false;
      this.model.Id = value2.Id
      this.model.Name = value2.Name;
      this.model.CASNumber = value2.CASNumber;
      this.model.EUINCIName = value2.EUINCIName;
      this.model.USINCIName = value2.USINCIName;
      this.model.ECNumberOrKENumber = value2.ECNumberOrKENumber;
      this.GetSubComponentsBySubcomponentId(value2.Id);
      this.modalReference = this._modalService.open(value1, { size: 'xl' });
    }
    else {
      this.SubComponentform.controls["Name"].disable();
      this.SubComponentform.controls["CASNumber"].disable();
      this.SubComponentform.controls["EUINCIName"].disable();
      this.SubComponentform.controls["USINCIName"].disable();
      this.SubComponentform.controls["ECNumberOrKENumber"].disable();
      this.SubComponentform.controls["Functions"].disable();
      this.actionType = false;
      this.model.Id = value2.Id
      this.model.Name = value2.Name;
      this.model.CASNumber = value2.CASNumber;
      this.model.EUINCIName = value2.EUINCIName;
      this.model.USINCIName = value2.USINCIName;
      this.model.ECNumberOrKENumber = value2.ECNumberOrKENumber;
      this.GetSubComponentsBySubcomponentId(value2.Id);
      this.modalReference = this._modalService.open(value1, { size: 'xl' });
    }
  }
  DeleteSubComponentsInfo(Data) {
    this.model.UpdatedBy = "";
    this.rmmapi.postData("SubComponent/DeleteSubComponent", { Id: this.model.Id, UpdatedBy: "" }).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetSubComponents();
          this._notifyService.showSuccess("", "Sub-component inactivated successfully");
        } else {
          this._notifyService.showWarning("", "Sorry, this Sub-component could not be inactivated because it is referred by another active item");
        }
      } else {
        this._notifyService.showError("", "Error: unable to inactivate the Sub-component");
      }
      this.modalReference.close();
    })
  }
  InActiveModalInfo(value1: any, value2: any) {
    this.model.Id = value2.Id
    this.model.Name = value2.Name;
    this.modalReference = this._modalService.open(value1, { size: 'sm' });
  }
  SaveSubComponent() {
    if (this.SubComponentform.valid && this.model.Name != '') {
      this.rmmapi.getData("SubComponent/CheckDuplicateSubComponent?subComponents=" + this.model.Name +'&subComponentId='+this.model.Id).toPromise().then((res: any) => {
        this.isDuplicateSubComponent = res.Data;
        if (!this.isDuplicateSubComponent) {
          this.model.Name = this.model.Name;
          this.model.CASNumber = this.model.CASNumber;
          if (this.model.Id == 0) {
            if (this.model.ECNumberOrKENumber == undefined) {
              this.model.ECNumberOrKENumber = ""
            }
            if (this.model.EUINCIName == undefined) {
              this.model.EUINCIName = ""
            }
            if (this.model.USINCIName == undefined) {
              this.model.USINCIName = ""
            }
            let subComponentList = new SubComponent();
            subComponentList.Name = this.model.Name;
            subComponentList.CASNumber = this.model.CASNumber;
            subComponentList.ECNumberOrKENumber = this.model.ECNumberOrKENumber;
            subComponentList.Functions = this.model.Functions.map(x => x.Id).join(",");
            subComponentList.EUINCIName = this.model.EUINCIName;
            subComponentList.USINCIName = this.model.USINCIName;
            subComponentList.CreatedBy = "";
            subComponentList.CreatedDate = new Date();
            subComponentList.UpdatedBy = "";
            subComponentList.UpdatedDate = new Date();
            subComponentList.Type = true;
            this.listModel.push(subComponentList);
            this.rmmapi.postData("SubComponent/AddSubComponent", this.listModel).toPromise().then((resp: any) => {
              if (resp && resp.Status) {
                this._notifyService.showSuccess("", "Sub-component added successfully");
                this.GetSubComponents();
                this.modalReference.close();
              } else {
                this._notifyService.showError("", "Sorry, Sub-component could not be added");
              }
            });
          }
          else {
            this.rmmapi.postData("SubComponent/UpdateSubComponent", this.model).toPromise().then((resp: any) => {
              if (resp && resp.Status) {
                this._notifyService.showSuccess("", "Sub-component updated successfully");
                this.GetSubComponents();
                this.modalReference.close();
              } else {
                this._notifyService.showError("", "Sorry, Sub-component could not be updated");
              }
            });
          }
        }
      });
    }
    else {
      this.SubComponentform.markAllAsTouched();
    }
  }

  tabchange(tabname) {
    
    this.moduleName = tabname;
    this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
    this.rmmapi.setStorage(this.env.CurrentTabState.TabName, tabname);

    if (tabname != undefined && tabname.toLocaleLowerCase() === "sub-components") {
      this.GetSubComponents();
      this.GetSubComponentFunctions();
    }
  }
  SubComponentFunctionNames(Content: any, Data: any) {
    this.subcomponentfunctions = Data.split(',');
    this.modalReference = this._modalService.open(Content);
  }
  checkEmpty() {
    if (this.model.CASNumber.length == 0) {
      this.model.CASNumber = '';
      return;
    }
  }
  subcomponentExists: string;
  checkDuplicate() {
    
    if (this.model.Name != undefined && this.model.Name != "") {
      this.rmmapi.getData("SubComponent/CheckDuplicateSubComponent?subComponents=" + this.model.Name+'&subComponentId='+this.model.Id).toPromise().then((res: any) => {
        this.isDuplicateSubComponent = res.Data;
      });
    }
    else {
      this.isDuplicateSubComponent = false;
    }

  }

  getFileDetails() {
    let fileEx = this.fileInputRef.nativeElement.value.split('.');
    if (fileEx[fileEx.length - 1] != "xls" && fileEx[fileEx.length - 1] != "xlsx") {
      this._notifyService.showWarning("", "File types allowed are .xls, .xlsx");
      this.model.ImportFile = "";
      return false;
    }
  }

  listModel: any[] = [];
  IngredientRegulationList: any[] = [];
  ChemicalRegulationList: any[] = [];

  uploadList() {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();

    // validate file uploaded or not

    if (this.fileInputRef.nativeElement.files.length == 0) {
      this._notifyService.showWarning("", "Please upload " + this.model.Import + " template");
      this.model.ImportFile = "";
      return false;
    }

    const file = this.fileInputRef.nativeElement.files[0];

    // get data from an uploaded file 
    reader.onload = (event) => {

      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = (XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]], { defval: "", header: 1 }));

      if (jsonData.length <= 1) {
        this._notifyService.showWarning("", "Template should have at least one record");
        this.model.ImportFile = "";
        return false;
      } else if (jsonData.length > 1 && this.model.Import == "Sub-Component") {
        jsonData.splice(jsonData[0], 1);
      }

      // check its sub-component or regulations and call the required method

      if (this.model.Import == "Sub-component") {
        this.prepareSubComponentModel(jsonData);
      } else {
        this.prepareRegulationModel(jsonData);
      }

      if (this.listModel.length > 0) {
        // update data into the respective table
        this.rmmapi.postData("SubComponent/ImportSubComponents", this.listModel).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this._notifyService.showSuccess("", this.model.Import + resp.Message);
            this.model.ImportFile = "";

            // get import history if type is regulations
            if (this.model.Import == "Regulations") {

              this.GetImportedSubComponentHistory();
            }
            else {
              this.IngredientRegulationList = [];
              this.ChemicalRegulationList = [];
            }
          } else {
            this._notifyService.showError("", resp.Message);
          }
        });

      }
      //else{
      // this._notifyService.showWarning("", "Template should have at least one record");
      // return false;
      // }

    }
    reader.readAsBinaryString(file);
  }



  GetImportedSubComponentHistory() {

    let params = new HttpParams().set("CreatedDate", new Date().toLocaleDateString());
    this.rmmapi.getData("SubComponent/GetImportedSubComponentsHistory", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        let data = res.Data;
        this.IngredientRegulationList = data.filter(x => x.ImportType == 'Ingredient');
        this.ChemicalRegulationList = data.filter(x => x.ImportType == 'Chemical');
      } else {
        this.IngredientRegulationList = [];
        this.ChemicalRegulationList = [];
      }
    });
  }

  prepareSubComponentModel(jsonData: any) {
    this.listModel = [];
    // validate the Ingredient Properties template or not and get requried column data
    if (jsonData[0].length != 28) {
      this._notifyService.showWarning("", "Please upload valid template");
      this.model.ImportFile = "";
      return false;
    }
    jsonData.forEach(element => {
      let subComponentList = new SubComponent();
      if (element[1] != "" && element[1] != null && element[1] != undefined) {
        subComponentList.Name = element[1];
        subComponentList.CASNumber = element[2];
        subComponentList.ECNumberOrKENumber = element[4];
        subComponentList.Functions = element[5];
        subComponentList.EUINCIName = element[6];
        subComponentList.USINCIName = element[7];
        subComponentList.CreatedBy = "";
        subComponentList.CreatedDate = new Date();
        subComponentList.UpdatedBy = "";
        subComponentList.UpdatedDate = new Date();
        subComponentList.Type = true;
        this.listModel.push(subComponentList);
      }
    });
  }

  prepareRegulationModel(jsonData: any) {
    this.listModel = [];
    let count: number = 1;

    // validate the Ingredient Regulations template or not (14 - Cosmetics and 10 - Chemical ) and get requried column data 

    if (jsonData[0].length != 14 && jsonData[0].length != 10) {
      this._notifyService.showWarning("", "Please upload valid template");
      this.model.ImportFile = "";
      return false;
    }
    jsonData.forEach(element => {
      let regulationList = new SubComponent();
      if (jsonData[0].length == 14) { // Ingradient Regulation
        regulationList.Name = element[0];
        regulationList.Country = element[1];
        regulationList.Regulatory_Status = element[3];
        regulationList.Regulatory_Description = element[4];
        regulationList.LimitsAndRanges = element[6];
        regulationList.Restricition_Description = element[7];
        regulationList.Prohibition_Description = element[8];
        regulationList.Labeling_Requirements = element[9];
        regulationList.isIngradient = true;
      } else if (jsonData[0].length == 10) { // 
        regulationList.Name = element[1];
        regulationList.Country = element[5];
        regulationList.Regulatory_Status = element[6];
        regulationList.Regulatory_Description = element[7];
        regulationList.LimitsAndRanges = element[8];
        regulationList.Restricition_Description = element[9];
        regulationList.isIngradient = false;
      }
      regulationList.CreatedBy = "";
      regulationList.CreatedDate = new Date();
      regulationList.UpdatedBy = "";
      regulationList.UpdatedDate = new Date();
      regulationList.Type = false;
      regulationList.Id = count;
      this.listModel.push(regulationList);
      count = count + 1;
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