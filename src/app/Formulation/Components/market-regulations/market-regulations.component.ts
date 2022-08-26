import { Component, EventEmitter, Input, OnInit, Output, SimpleChange,ViewChild } from '@angular/core';
import { AppService } from '../../../app.service';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../shared/services/notification.service';
import { HttpParams } from '@angular/common/http';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { StatusName } from 'src/app/shared/constants/application.constants';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
@Component({
  selector: 'app-market-regulations',
  templateUrl: './market-regulations.component.html',
  styleUrls: ['./market-regulations.component.css']
})
export class MarketRegulationsComponent implements OnInit {

  @Input("formulationDetailId") formulationDetailId: number;
  @Output() informToParent = new EventEmitter();
  market: any;
  formulationMarketsList: any[] = [];
  rawMaterialList:GridDataResult;
  public sort: SortDescriptor[] = [ { field: 'RawMaterialName', dir: 'asc'}];
  public type = "numeric";
  public position = "bottom";
  public pageSize = 10;
  public skip = 0;
  formulationRawMaterialSubComponentsList: any[] = [];
  regulationList: any[] = [];
  formTitle: string = "";
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  constructor(public _appService: AppService,
    public _rmmapi: RMMApiService,
    private _modalService: NgbModal,
    private _notifyService: NotificationService) { }
    searchFilter : SearchFilter = new SearchFilter();
  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetFormulationMarkets();
    this.GetFormulationRawMaterials();    
  }
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "RawMaterialName asc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }
  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber =   event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetFormulationRawMaterials();
   
 }
 sortChange(sort: SortDescriptor[]): void {
  
  this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "RawMaterialName asc";
  this.sort = sort;  
  this.GetFormulationRawMaterials();
}
  ngOnchanges(changes: SimpleChange) {
    if (this.formulationDetailId) {
      this.formulationDetailId = changes["formulationDetailId"].currentValue;
     
    }
  }

  GetFormulationMarkets() {
    let params = new HttpParams().set("formulationDetailId", this.formulationDetailId.toString()).set("pageSize", this.searchFilter.pageSize.toString())
    .set("pageNumber", this.searchFilter.pageNumber.toString()).set("sort", this.searchFilter.sort);
    this._rmmapi.getData("FormulationRawMaterialSubComponentMarketRegulations/GetFormulationMarkets", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.formulationMarketsList = res.Data;
        this.market = this.formulationMarketsList[0];
      }
    });
  }
  isDidabledButton : boolean;
  GetFormulationRawMaterials() {
  
    let params = new HttpParams().set("formulationDetailId", this.formulationDetailId.toString()).set("PageSize",this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
    .set("Sort",this.searchFilter.sort);
    this._rmmapi.getData("FormulationRawMaterialSubComponentMarketRegulations/GetFormulationRawMaterialsById", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data && res.Data.FormulationRawmaterialSubComponentDetailsList.length>0) {
        this.rawMaterialList = {
          data: res.Data.FormulationRawmaterialSubComponentDetailsList,
          total: res.Data.TotalRecords
      };

       this.isDidabledButton = this.rawMaterialList.data[0].StatusCode === StatusName.IngredientListApproved;
      }
    });
  }

  MarketChange(event: any) {
    
    this.market = event;
  }
  marketname: string;
  EditRegulation(value1: any, value2: any) {
    this.formTitle = value2.RawMaterialName;
    this.marketname = this.market.Name;
    this.isRegulation = this.isButtonEnable = false;
    this.formulationRawMaterialSubComponentsList = [];
    this.regulationList = [];
    this.GetFormulationRawMaterialSubComponentsByFormulationId(value2.FormulationRawMaterialId, this.market.Id);
    this.modalReference = this._modalService.open(value1, { size: 'xl' });
  }

  GetFormulationRawMaterialSubComponentsByFormulationId(FormulationRawMaterialId: number, marketId :number) {
    let params = new HttpParams().set("formulationRawMaterialsId", FormulationRawMaterialId.toString()).set("MarketId", this.market.Id);
    this._rmmapi.getData("FormulationRawMaterialSubComponentMarketRegulations/FormulationRawMaterialSubComponentsByFormulationRawMaterialId", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.formulationRawMaterialSubComponentsList = res.Data;
        this.formulationRawMaterialSubComponentsList.forEach(element => {
          element.Impurities = element.Impurities ? "Yes" : "No";
        });
      }
    });
  }

  isUpdate: boolean = false;
  isRegulation: boolean = false;
  buttonTitle: string = "Save";
  isButtonEnable: boolean = false;
  subComponentName: string = "";
  subComponentObject : any;
  showClick(event: any) {
    
    this.subComponentObject = event;
    this.subComponentName = event.SubComponentName;
    let params = new HttpParams().set("SubComponentId", event.SubComponentId).set("MarketId", this.market.Id).set("FormulationDetailId",this.formulationDetailId.toString())
        .set("FormulationRawMaterialId",event.FormulationRawMaterialId).set("FormulationRawMaterialSubComponentId", event.FormulationRawMaterialSubComponentId);
    this._rmmapi.getData("FormulationRawMaterialSubComponentMarketRegulations/RegulationsBySubComponentId", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data.length > 0) {
        this.isRegulation = this.isButtonEnable = true;
        this.regulationList = res.Data;
        this.formGroups = new FormGroup({ items: new FormArray([]) });
        this.regulationList.forEach((i) => {
          const formGroup = new FormGroup({
            RegulationName: new FormControl(i.RegulationName),
            RegulationValue: new FormControl(i.RegulationValue),
            RegulationStatus: new FormControl(event.RegulationStatus),
            RegulationId: new FormControl(i.RegulationId),
            MarketId: new FormControl(this.market.Id),
            FormulationDetailId: new FormControl(this.formulationDetailId),
            FormulationRawMaterialId: new FormControl(event.FormulationRawMaterialId),
            FormulationRawMaterialSubComponentId: new FormControl(event.FormulationRawMaterialSubComponentId),
            CreatedBy: new FormControl(""),
            CreatedDate: new FormControl(new Date()),
            UpdatedBy: new FormControl(""),
            UpdatedDate: new FormControl(new Date())
          });
          (this.formGroups.get('items') as FormArray).push(formGroup);
          if (!this.isUpdate) {
            this.isUpdate = i.FormulationRawMaterialSubComponentMarketRegulationId > 0 ? true : false;
            this.buttonTitle = this.isUpdate ? "Update" : "Save";
          }
        })
      } else {
        this.isRegulation = this.isButtonEnable = false;
      }
    });
  }

  public formGroups: FormGroup = new FormGroup({ items: new FormArray([]) });
  public GetFormControl(dataItem: any, field: string): FormControl {
    return <FormControl>(
      (this.formGroups.get('items') as FormArray).controls
        .find((i) => i.value.RegulationId === dataItem.RegulationId)
        .get(field)
    );
  }

  FilledCheckBoxChange(event, dataItem) {
    dataItem.RegulationStatus = event.target.checked;
    if(this.subComponentObject && this.subComponentObject.SubComponentId == dataItem.SubComponentId) {
      console.log(this.formGroups.get('items'));
      this.formGroups.get('items').value.forEach(element => {
        element.RegulationStatus = event.target.checked;
      });
    }
    console.log(event);
    console.log(dataItem);
  }

  SaveRegulationMarkets() {
    let status = this.formGroups.value.items.filter(x=>x.RegulationStatus == true);
    this.formGroups.value.items.forEach(element => {
      element.RegulationStatus = status.length > 0 ? true : false;
      if (!this.isUpdate) {
        element.CreatedDate = new Date()
      } else {
        element.UpdatedDate = new Date()
      }
    });
    this._rmmapi.postData("FormulationRawMaterialSubComponentMarketRegulations/AddFormulationRawMaterialSubComponentMarketRegulations", this.formGroups.value.items).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        //this._notifyService.showSuccess("", this.subComponentName + resp.Message);
        this._notifyService.showSuccess("", "Market Regulations statuses updated successfully");
        this.isButtonEnable = false;
        this.modalReference.close();
      }
      else{
        this._notifyService.showError("", "Sorry, market regulations statuses could not be updated");
      }
    });

  }

  GotoDataDocumentCheck() {
    this.informToParent.emit();
  }
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  public showTooltip(e: MouseEvent, tooltip: TooltipDirective): void {
    const element = e.target as HTMLElement;
    if ((element.nodeName === 'TD' || element.nodeName === 'TH' || element.nodeName === 'SPAN')
        && element.offsetWidth < element.scrollWidth && element.innerText !='') {
          tooltip.toggle(element);
    } else {
      tooltip.hide();
    }
} 
}
