import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChange,ViewChild } from '@angular/core';
import { AppService } from '../../../app.service';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
@Component({
  selector: 'app-data-document-check',
  templateUrl: './data-document-check.component.html',
  styleUrls: ['./data-document-check.component.css']
})
export class DataDocumentCheckComponent implements OnInit {

  @Input("formulationDetail") formulationDetail : any;
  @Output() informToParent = new EventEmitter();
  documentComplianceList : any[] = [];
  checklistComplianceList : any[] =[];
  constructor(public _appService: AppService,
    private _rmmapi: RMMApiService,
    private _notifyService: NotificationService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes : SimpleChange) {
    if(this.formulationDetail) {
      this.formulationDetail = changes['formulationDetail'].currentValue;
      this.GetDataDocumentCheckList();
    }
  }

  GetDataDocumentCheckList() {
    let params = new HttpParams().set("formulationDetailId", this.formulationDetail.Id.toString());
    this._rmmapi.getData("FormulationINCIBreakdownList/GetFormulationDataDocumentChecks", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        let data = res.Data;
        this.checklistComplianceList = data.CheckListCompliance;        
        this.documentComplianceList = data.DocumentCompliance;        
      }
    });
  }

  GotoFormulationTranscript() {
    this.informToParent.emit(); 
  }

  Refresh() {
    this.GetDataDocumentCheckList();
  }
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  public showTooltip(e: MouseEvent, tooltip: TooltipDirective): void {
    const element = e.target as HTMLElement;
    if ((element.nodeName === 'TD' || element.nodeName === 'TH' || element.nodeName === 'SPAN')
        && element.offsetWidth < element.scrollWidth) {
          tooltip.toggle(element);
    } else {
      tooltip.hide();
    }
}

}
