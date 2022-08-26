import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  constructor(private rmmapi: RMMApiService,public _appService:AppService,private router:Router) { }

  ngOnInit(): void {
    this._appService.setHeaderUserName(this.rmmapi.getUserName());
    this._appService.setMasterDataShow(false);
    this.router.navigate(['Masterdata/Products/Product']);
  }

}
