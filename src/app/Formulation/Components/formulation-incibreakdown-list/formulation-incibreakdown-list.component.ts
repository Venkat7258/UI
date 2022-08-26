import { Component, EventEmitter, Input, OnInit, Output, SimpleChange,ViewChild, Renderer2, NgZone, AfterViewInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { AppService } from '../../../app.service';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { HttpParams } from '@angular/common/http';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import * as FileSaver from 'file-saver';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { StatusName } from '../../../shared/constants/application.constants';
import { PaginationDefalts, PrivilegCodes, SearchFilter } from 'src/app/shared/constants/global.constants';
import { BlockInvalidChar } from 'src/app/shared/services/env.service';
@Component({
  selector: 'app-formulation-incibreakdown-list',
  templateUrl: './formulation-incibreakdown-list.component.html',
  styleUrls: ['./formulation-incibreakdown-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FormulationINCIBreakdownListComponent implements OnInit {

  @Input("formulationDetail") formulationDetail: any;
  @Output() informToParent = new EventEmitter();

  formulationInciList: any;
  formulationMarketRegulationList: any;
  formulationMarketList: any;
  isSendforReview: boolean = false;
  isApproveInciList: boolean = false;
  isGenerateDetailsList: boolean = false;
  isReDo: boolean = false;
  isSaveIngredientList: boolean = false;
  isGotoDocumentTrackingt: boolean = false;
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  AccessToRINCI = true;
  isUpdate: boolean = false;
  isManagePriority : boolean = true;
  isExportToExcel : boolean = true;
  constructor(public _appService: AppService,
    public _rmmapi: RMMApiService,
    private _modalService: NgbModal,
    private _notifyService: NotificationService) { 

    }

  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.AccessToRINCI = this._rmmapi.getRolePrivilege(PrivilegCodes.RINCI).toString() === 'true' ? true : false;
  }

  ngOnChanges(changes: SimpleChange) {
    if (this.formulationDetail) {
      this.formulationDetail = changes["formulationDetail"].currentValue;
    }

    this.GetFormulationInciList();
  }

  GetFormulationInciList(isRedoFlag : boolean = false) {
    let params = new HttpParams().set("formulationDetailId", this.formulationDetail.Id.toString()).set("sort", "").set("isRedo", isRedoFlag.toString());
    this._rmmapi.getData("FormulationINCIBreakdownList/GetFormulationINCIByFormulationDetailId", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.formulationInciList = res.Data;
        this.formulationInciList.forEach(element => {
          if (element.FormulationRawMaterialSubComponents && element.FormulationRawMaterialSubComponents.length > 0) {
            if (element.FormulationRawMaterialSubComponents[0].FormulationINCIBreakdownListId > 0) {
              this.isSaveIngredientList = this.isSendforReview = element.StatusCode === StatusName.FormulationSummaryApproved ? true : false;
              this.isApproveInciList = element.StatusCode === StatusName.IngredientListSubmitted ? true : false;
              this.isReDo = element.StatusCode === StatusName.IngredientListSubmitted || element.StatusCode === StatusName.FormulationSummaryApproved ? true : false;
              this.isUpdate = this.isSubcomponent = this.isGotoDocumentTrackingt = true;
              this.formulationRawMaterialSubComponents = element.FormulationRawMaterialSubComponents;
              this.isExportToExcel = false;
              this.isManagePriority =  element.StatusCode === StatusName.FormulationSummaryApproved ? false : true;
              element.FormulationRawMaterialSubComponents.forEach(item => {
                item.OldPriority = item.Priority;
                item.TempPriority = item.Priority;
              });
            }
          }
        });
      }
    });
  }

  SaveIngredientList() {
    //this.isReDo = false;
    this.formulationRawMaterialSubComponents.forEach(element => {
      element.FormulationDetailId = this.formulationDetail.Id;
    });
    this._rmmapi.postData("FormulationINCIBreakdownList/AddFormulationINCIBreakdownList", this.formulationRawMaterialSubComponents).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        this._notifyService.showSuccess("", "Ingredient List updated successfully");
        this.GetFormulationInciList();
        this.modalReference && this.modalReference.close();
      }
      else{
        this._notifyService.showSuccess("", "Sorry, Ingredient List could not be updated");
      }
    });
  }


  SendforReview(code: string) {
    let model: any = {};
    model.FormulationDetailId = this.formulationDetail.Id;
    model.StatusCode = code;
    model.UpdatedBy = this._rmmapi.getUserName();
    model.FormulationReferenceNo = this.formulationDetail.FormulationReferenceNo;
    model.VersionNo = this.formulationDetail.VersionNo;
    this._rmmapi.postData("FormulationTranscriptSummary/UpdateFormulationDetailStatus", model).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if(model.StatusCode=="ILS")
        {
        this._notifyService.showSuccess("","Ingredient List sent for review");
        }
        else{
          this._notifyService.showSuccess("","Ingredient List approved");
        }
        this.GetFormulationInciList();
        this.isApproveInciList = true;        
      }
      else{
        this._notifyService.showError("","Sorry, Ingredient List could not be sent for review");
      }
    });
  }

  GotoDocumentTracking() {
    this.informToParent.emit();
  }

  formulationRawMaterialSubComponents: any;
  isSubcomponent: boolean = false;
  GenerateDetailsList() {
    let priority: number = 1;
    this.formulationRawMaterialSubComponents = [];
    let items = this.formulationInciList.filter(x => x.IsCheck == true);
    if (items && items.length > 0) {
      items.forEach(element => {
        element.FormulationRawMaterialSubComponents.forEach(item => {
          item.FormulationDetailId = this.formulationDetail.Id;
          item.CreatedDate = new Date();
          item.UpdatedDate = null;
          item.RawMeterialName = element.RawMeterialName;
          item.Priority = priority;
          item.OldPriority = priority;
          item.TempPriority = priority;
          this.formulationRawMaterialSubComponents.push(item);
          priority++;
        });
      });    
      this.MakeSubComponentGroup();  
      this._notifyService.showSuccess("","Ingredient List generated");
      this.isReDo = this.isSaveIngredientList = this.isSubcomponent  = true;
      this.isGenerateDetailsList = this.isManagePriority = this.isExportToExcel = false;
    } else {
      this._notifyService.showWarning("", "Select atleast one Raw Material to Generate Details List!");
    }
  }

  MakeSubComponentGroup() {
    let list : any[] =[];
    this.formulationRawMaterialSubComponents.forEach(element => {
      if(list.length == 0) {
        list.push(element);
      } else {
        let index = list.findIndex(x=>x.SubComponentName == element.SubComponentName);
        if(index >= 0) {
          list[index].RawMeterialName = list[index].RawMeterialName + ", "+ element.RawMeterialName;
          list[index].Concentration = list[index].Concentration + element.Concentration;
        } else {
          list.push(element);
        }
      }
    });
    this.formulationRawMaterialSubComponents = list;
    console.log(list);
  }

  ReDo() {
    this.GetFormulationInciList(true);
    this.modalReference.close();
    this.isReDo = this.isSaveIngredientList = this.isSubcomponent = this.isSendforReview = this.isGenerateDetailsList = false;
    this.isApproveInciList = false;
    this._notifyService.showSuccess("","Ingredient List ready to be generated again");
    this.isManagePriority = this.isExportToExcel = true;
  }

  checkboxChange(event: any) {
    let items = this.formulationInciList.filter(x => x.IsCheck == true);
    this.isGenerateDetailsList = items && items.length > 0 ? true : false;
  }

  BtnManagePriority(templateName: any, windowSize:string) {
    this.modalReference = this._modalService.open(templateName, { size: windowSize });
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

  ChangePriority(dataItem: any, rowIndex : number) {
   let list = this.formulationRawMaterialSubComponents;
    for(let i =0; i<list.length;i++) {      
      if(((list[i].FormulationINCIBreakdownListId != dataItem.FormulationINCIBreakdownListId) 
        || (list[i].FormulationRawMaterialSubComponentId != dataItem.FormulationRawMaterialSubComponentId)) && list[i].Priority.toString() == dataItem.Priority) {
        list[i].Priority = dataItem.TempPriority;
        list[i].TempPriority = dataItem.TempPriority;
        break;
      }
    }
    list[rowIndex].TempPriority = dataItem.Priority;   
  }

  getFileName(){
    let date = new Date();
    let month = date.getMonth()+1
    return 'Formulation_INCI_List_' +month + date.getDate() + date.getFullYear()+'_'+date.getHours()+date.getMinutes()+date.getSeconds();
  
  }

  exportAsTemplateExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    worksheet.A1.v = "Raw Material Name and Code";
    worksheet.B1.v = "Sub-component Name";
    worksheet.C1.v = "EU INCI Name";
    worksheet.D1.v = "US INCI Name";
    worksheet.E1.v = "Function";
    worksheet.F1.v = "CAS Number(s)";
    worksheet.G1.v = "Concentration (%) (of Sub- Component in the finished Product)";
    var range = XLSX.utils.decode_range(worksheet['!ref']);    
    const workbook: XLSX.WorkBook = { Sheets: { 'Sheet1': worksheet }, SheetNames: ['Sheet1'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }

  ValidateInputIngredientTab(event: any, dataIte: any) {
    
    BlockInvalidChar(event);
  }
  ExportToExcel() {
    let items : any[] = [];
    this.formulationRawMaterialSubComponents.forEach(element => {
      let item : any = {};
      item.RawMaterialName = element.RawMeterialName;
      item.SubComponentName = element.SubComponentName;
      item.EUINCIName = element.EUINCIName;
      item.USINCIName = element.USINCIName;
      item.FuntionName = element.FuntionName;
      item.CASNumber = element.CASNumber;
      item.Concentration = element.Concentration;
      items.push(item);
      this._notifyService.showSuccess("","Ingredient List exported to Excel successfully");
    });
    this.exportAsTemplateExcelFile(items, this.getFileName());
  }
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  public showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;
    if ((element.nodeName === 'TD' || element.nodeName === 'TH' || element.nodeName === 'SPAN')
        && element.offsetWidth < element.scrollWidth  && element.innerText !='') {
        this.tooltipDir.toggle(element);
    } else {
        this.tooltipDir.hide();
    }
} 
}
