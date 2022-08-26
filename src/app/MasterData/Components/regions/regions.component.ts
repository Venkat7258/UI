import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { NotificationService } from './../../../shared/services/notification.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { Regions } from '../../Models/regions';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { HttpParams } from '@angular/common/http';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
@Component({
  selector: 'app-regions',
  templateUrl: './regions.component.html',
  styleUrls: ['./regions.component.css']
})
export class RegionsComponent implements OnInit {
  public regionsinfo: any[] = [];
  public regionsList: GridDataResult;
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  Regionform: any;
  Model: any = new Regions();
  actionType: boolean = true;
  searchFilter: SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [{ field: 'Name', dir: 'asc' }];
  public type = "numeric";
  public position = "bottom";
  submitted = false;
  RegionName: string;
  isDuplicateRegion: boolean = false;
  regionExists: string;
  constructor(public env: EnvService, public _appService: AppService,
    public rmmapi: RMMApiService,
    private modalService: NgbModal,
    private notifyService: NotificationService) {
    this.Regionform = new FormGroup({
      RegionName: new FormControl("", Validators.required)
    });
  }

  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetRegions();

  }
  GetRegions() {
    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString()).set("Sort", this.searchFilter.sort);
    this.rmmapi.getData("Regions/GetAllRegions", params).toPromise().then((res: any) => {
      this.regionsinfo = res.Data;
      this.regionsList = {
        data: res.Data.RegionsDetailsList,
        total: res.Data.RegionsDetailsList && res.Data.RegionsDetailsList.length > 0 ? res.Data.RegionsDetailsList[0].TotalRecords : 0
      };
    });
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
    this.GetRegions();
  }
  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
    this.sort = sort;
    this.GetRegions();
  }

  AddRegionsModal(content) {

    this.actionType = true;
    this.isDuplicateRegion = false;
    this.submitted = false;
    this.Regionform.controls.RegionName.touched = false;
    this.Model = new Regions();
    this.Model.Id = 0;
    this.modalReference = this.modalService.open(content, { size: 'lg' });
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
  AddRegionsInfo() {
    this.submitted = true;
    let isFormValid = this.Regionform.valid && this.Regionform.controls['RegionName'].value != undefined
      && this.Regionform.controls.RegionName.value.trim().length > 0;

    if (isFormValid == false) {
      this.Regionform.controls["RegionName"].setErrors({ 'required': true });
      return;
    }
    this.rmmapi.getData("Regions/CheckDuplicateRegion?regions=" + this.Model.Name.trim()
      + '&id=' + (this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
        this.isDuplicateRegion = res.Data;
        if (!this.isDuplicateRegion) {
          if (this.Model.Id == 0) {
            this.rmmapi.postData("Regions/AddRegion", { Name: this.Model.Name, CreatedBy: "" }).toPromise().then((resp: any) => {
              if (resp && resp.Status) {
                this.notifyService.showSuccess("", "Region added successfully");

                this.GetRegions();
                this.modalReference.close();
              } else {
                this.notifyService.showError("","Sorry, Region could not be added");
              }
            });

          } else {
            this.rmmapi.postData("Regions/UpdateRegion", { Id: this.Model.Id, Name: this.Model.Name, UpdatedBy: "" }).toPromise().then((resp: any) => {
              if (resp && resp.Status) {

                this.notifyService.showSuccess("", "Region updated successfully");

                this.GetRegions();
                this.modalReference.close();
              } else {
                this.notifyService.showError("", "Sorry, Region could not be updated");
              }
            });
          }

        }

      });
  }

  EditRegionsInfo(value1: any, value2: any) {
    if (this.rmmapi.getRolePrivilege('VR') && this.rmmapi.getRolePrivilege('MR')) {
      this.actionType = false;
      this.resetControls();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.RegionName = value2.Name;
      this.modalReference = this.modalService.open(value1, { size: 'lg' });
    }
    else {
      this.Regionform.controls["RegionName"].disable();
      this.actionType = false;
      this.resetControls();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.modalReference = this.modalService.open(value1, { size: 'lg' });
    }

  }
  DeleteRegionsInfo(Data) {
    this.Model.UpdatedBy = "";
    this.rmmapi.postData("Regions/DeleteRegion", { Id: this.Model.Id, UpdatedBy: "" }).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetRegions();
          this.notifyService.showSuccess("", "Region inactivated successfully");
        } else {
          this.notifyService.showWarning("", "Sorry, this Region could not be inactivated because it is referred by another active item");
        }
      } else {
        this.notifyService.showError("","Error: unable to inactivate the Region");
      }
      this.modalReference.close();
    })
  }
  InActiveModalInfo(value1: any, value2: any) {
    this.Model.Id = value2.Id
    this.Model.Name = value2.Name;
    this.modalReference = this.modalService.open(value1, { size: 'sm' });
  }


  checkDuplicate() {
    if (this.Model.Name != undefined && this.Model.Name.trim().length >= 0) {
     
        this.rmmapi.getData("Regions/CheckDuplicateRegion?regions=" + this.Model.Name.trim()
      + '&id=' + (this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
        this.isDuplicateRegion = res.Data;
        if (this.isDuplicateRegion) {
          this.isDuplicateRegion = true;
          this.regionExists = this.env.ValidationMessages.Thisvaluealreadyexists;
          this.Regionform.controls["RegionName"].setErrors({ 'incorrect': true });
        } else {
          this.isDuplicateRegion = false;
          this.regionExists = res.Message;
          this.Regionform.controls["RegionName"].setErrors(null);
        }
      });
    }
else
{
  this.Model.Name = '';
  //this.Regionform.markAsUnTouched();
  return;
}
  }
  resetControls() {
    this.regionExists = "";
    this.isDuplicateRegion = false;
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
