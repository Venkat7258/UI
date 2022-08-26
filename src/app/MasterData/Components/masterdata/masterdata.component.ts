import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';

@Component({
  selector: 'app-masterdata',
  templateUrl: './masterdata.component.html',
  styleUrls: ['./masterdata.component.css']
})
export class MasterdataComponent implements OnInit {

 
  showMasterData:boolean=true;
  constructor(private rmmapi:RMMApiService,public _appService:AppService,public cdf: ChangeDetectorRef,private router: Router) {
    
   }
  
  ngOnInit(): void {
   // alert(2)
   this._appService.setHeaderUserName(this.rmmapi.getUserName());
    this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.showMasterData = true;
      }
    });
    this._appService.setHeaderShow(true);
    this.showMasterData = true;
    this._appService.showMasterData.subscribe(response => {
      this.showMasterData = response;
      this.cdf.detectChanges();
    })
    this._appService.setHeaderTitle("Master Data")
   
  }

}
