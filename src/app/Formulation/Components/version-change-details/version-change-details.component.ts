import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-version-change-details',
  templateUrl: './version-change-details.component.html',
  styleUrls: ['./version-change-details.component.css']
})
export class VersionChangeDetailsComponent implements OnInit {

  constructor(public _appService:AppService) { }

  ngOnInit(): void {
    this._appService.setHeaderShow(true);
    this._appService.setHeaderTitle("Formulations");
  }
}
