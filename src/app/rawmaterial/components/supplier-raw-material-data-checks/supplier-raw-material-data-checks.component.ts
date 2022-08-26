import { Component, Input, OnInit, SimpleChange, ViewChild } from '@angular/core';
import { AppService } from '../../../app.service';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { of, Observable } from 'rxjs';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
@Component({
  selector: 'app-supplier-raw-material-data-checks',
  templateUrl: './supplier-raw-material-data-checks.component.html',
  styleUrls: ['./supplier-raw-material-data-checks.component.css']
})
export class SupplierRawMaterialDataChecksComponent implements OnInit {
  IsValidationPassed = false;
  ValidationMessage = '';
  checkListRegulationGroupsList: any[] = [{ Name: '', items: [] }];
  docReferenceList: any[] = [];
  keys: string[] = [];
  view: any = [];
  public defaultItem: { Name: string; Id: number } = { Name: "Select", Id: null };
  public formGroups: FormGroup = new FormGroup({ items: new FormArray([]) });
  isButtonEnable: boolean = false;
  public expandedKeys: any[] = ["0"];
  public selectedKeys: any[] = ["0_0"];
  @Input("supplierRawMaterialDetailId") supplierRawMaterialDetailId: number;
  userName : string;
  constructor(public _appService: AppService,
    public _rmmapi: RMMApiService,
    private _notifyService: NotificationService) { }
  ngOnInit(): void {
    this.userName = this._rmmapi.getUserName();
    this._appService.setHeaderShow(true);
    this.GetChecklistRegulationGroups();
    this.GetSupplierRawMaterialDocumentDetailsById();
    
  
  }
  ngOnChanges(changes: SimpleChange) {
    if (this.supplierRawMaterialDetailId) {
      this.supplierRawMaterialDetailId = changes['supplierRawMaterialDetailId'].currentValue;
    }
  }
  GetChecklistRegulationGroups() {
    this._rmmapi.getData("RegulationGroups/GetCheckListRegulationGroups").toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        
        this.checkListRegulationGroupsList[0].Name = "Raw Material Checklist Groups";
        this.checkListRegulationGroupsList[0].items = res.Data;
          if( res.Data !== null && res.Data.length > 0) {
           const id = res.Data[0].Id
            this.GetDataForSelectedValue(id);
        }
      }
    });
  }
  GetSupplierRawMaterialDocumentDetailsById() {
    let params = new HttpParams().set("Id", this.supplierRawMaterialDetailId.toString());
    this._rmmapi.getData("SupplierRawMaterialDataChecks/GetSupplierRawMaterialDocumentDetailsById", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.docReferenceList = res.Data;

      }
    });
  }
  public getFormControl(dataItem: any, field: string): FormControl {

    return <FormControl>(
      (this.formGroups.get('items') as FormArray).controls
        .find((i) => i.value.PropertyId === dataItem.PropertyId)
        .get(field)
    );
  }
  public isExpanded = (dataItem: any, index: string) => {
    return this.keys.indexOf(index) > -1;
  }
  public handleCollapse(node) {
    this.keys = this.keys.filter(k => k !== node.index);
  }
  public handleExpand(node) {
    this.keys = this.keys.concat(node.index);
  }

  public hasChildren = (item: any) => item.items && item.items.length > 0;
  public fetchChildren = (item: any) => of(item.items);
  public children = (dataitem: any): Observable<any[]> => of(dataitem.items);
  
  docRefList: any[] = [];
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
  isUpdate: boolean = false;
  buttonTitle: string = "Save";
  groupName: string = "";
  showClick(event: any) {
    this.groupName = event.dataItem.Name;
    this.GetDataForSelectedValue(event.dataItem.Id);
  }

  touchedContol() {
    this.isButtonEnable = true;
  }


  GetDataForSelectedValue(Id: number){
    this.view = [];
    this._rmmapi.getData("SupplierRawMaterialDataChecks/GetSupplierRawMaterialDataChecks?Id=" + Id 
    + '&SupplierRawMaterialDetailId=' 
    + this.supplierRawMaterialDetailId).toPromise().then((res: any) => {
      if (res && res.Status && res.Data.length > 0) {
        this.isButtonEnable = true;
        this.view = res.Data;
        this.formGroups = new FormGroup({ items: new FormArray([]) });
        if ((this.formGroups.get('items') as FormArray).controls.length === 0) {
          this.isUpdate = false;
          this.view.forEach((i) => {
            this.GetDocRefList(this.docReferenceList, i.DocReferenceId);
            const formGroup = new FormGroup({
              PropertyId: new FormControl(i.PropertyId),
              PropertyName: new FormControl(i.PropertyName),
              PropertyValues: new FormControl(i.PropertyValueTypeOptionId),
              Data: new FormControl(i.Data, Validators.required),
              Comments: new FormControl(i.Comments, Validators.required),
              DocReference: new FormControl(this.docRefList),
              PropertyValueTypeOptionId: new FormControl(i.PropertyValueTypeOptionId),
              ChecklistRegulationGroupId: new FormControl(i.ChecklistRegulationGroupId),
              ChecklistRegulationPropertiesId: new FormControl(i.ChecklistRegulationPropertiesId),
              SupplierRawMaterialDataChecksId: new FormControl(i.SupplierRawMaterialDataChecksId),
              PropertyValueTypeOptionNames: new FormControl(i.PropertyValueTypeOptionNames),
              CreatedBy: new FormControl(i.CreatedBy),
              CreatedDate: new FormControl(i.CreatedDate),
              UpdatedBy: new FormControl(this.userName),
              UpdatedDate: new FormControl(i.UpdatedDate),
              SupplierRawMaterialDetailId: new FormControl()

            });
            (this.formGroups.get('items') as FormArray).push(formGroup);
            if (!this.isUpdate) {
              this.isUpdate = i.SupplierRawMaterialDataChecksId > 0 ? true : false;
              this.buttonTitle = this.isUpdate ? "Update" : "Save";
            }
          });
        }
      } else {
        this.isButtonEnable = false;
        this.view = [];
      }
    });
  }

  SaveDataCheck() {
      this.formGroups.value.items.forEach(element => {
        element.Data = element.Data != undefined ? element.Data : '' ;
        element.Comments = element.Comments != undefined ? element.Comments : '' ;
        if (!this.isUpdate) {
        element.CreatedDate = new Date()
        element.CreatedBy = this.userName;
      } else {
        element.UpdatedDate = new Date()
        element.UpdatedBy = this.userName;
      }
      element.DocReference = (element.DocReference.length > 0  && (typeof element.DocReference === 'object'))? element.DocReference.map(x => x.Id).join(",") : (element.DocReference.length > 0 )?element.DocReference:"";
      element.SupplierRawMaterialDetailId = this.supplierRawMaterialDetailId;
    });

    let IsPropertyValueReq = (this.formGroups.value.items.filter(item => item.PropertyValues <= 0).length) >0  ;
    let IsDocumentReferenceReq = (this.formGroups.value.items.filter(item => item.DocReference.length <=0).length ) >0;
   
    if (IsPropertyValueReq || IsDocumentReferenceReq ) {
      this.IsValidationPassed = true;
      this.ValidationMessage =  (IsPropertyValueReq && IsDocumentReferenceReq) ? "Property Values and At least one Document Reference": ( IsPropertyValueReq ?  "Property Values": "At least one Document Reference");
      setTimeout(() => {
        this.IsValidationPassed = false;
        this.ValidationMessage = '';
      }, 3000);
      return;
    }

    if (!this.isUpdate) {
     
      
      this._rmmapi.postData("SupplierRawMaterialDataChecks/AddSupplierRawMaterialDataChecks", this.formGroups.value.items).toPromise().then((resp: any) => {
        if (resp && resp.Status) {
          //this._notifyService.showSuccess("", this.groupName + resp.Message);
          this._notifyService.showSuccess("", "Checklist Details added successfully");
          this.isButtonEnable = false;
          this.GetDataForSelectedValue(this.formGroups.value.items[0].ChecklistRegulationGroupId);
        } else {
          // this._notifyService.showError("", resp.Message);
          this._notifyService.showError("", "Sorry, Checklist details could not be added");
        }
      });
    } else {
      this._rmmapi.postData("SupplierRawMaterialDataChecks/UpdateSupplierRawMaterialDataChecks", this.formGroups.value.items).toPromise().then((resp: any) => {
        if (resp && resp.Status) {
          // this._notifyService.showSuccess("", this.groupName + resp.Message);
          this._notifyService.showSuccess("", "Checklist Details updated successfully");
          this.isButtonEnable = false;
          this.GetDataForSelectedValue(this.formGroups.value.items[0].ChecklistRegulationGroupId);
        } else {
          this._notifyService.showError("", "Sorry, Checklist details could not be updated");
        }
      });
    }
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
