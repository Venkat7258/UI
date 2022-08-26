import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormulationComponent } from './formulation/Components/formulation/formulation.component';
import { LoginComponent } from './common/Components/login/login.component';
import { FunctionsComponent } from './masterdata/Components/functions/functions.component';
import { RegionsComponent } from './masterdata/Components/regions/regions.component';
import { MarketsComponent } from './masterdata/Components/markets/markets.component';
import { ProductsComponent } from './masterdata/Components/products/products.component';
import { RegulationsComponent } from './masterdata/Components/regulations/regulations.component';
import { StatusComponent } from './masterdata/Components/status/status.component';
import { MasterdataComponent } from './masterdata/components/masterdata/masterdata.component';
import { DashboardComponent } from './common/components/dashboard/dashboard.component';
import { ProductcategoriesComponent } from './masterdata/components/productcategories/productcategories.component';
import { ProductComponent } from './masterdata/components/product/product.component';
import { RawMaterialsComponent } from './masterdata/Components/raw-materials/raw-materials.component';
import { SupplierRawMaterialDetailsComponent } from './rawmaterial/components/supplier-raw-material-details/supplier-raw-material-details.component';
import { SupplierRawMaterialLandingComponent } from './rawmaterial/components/supplier-raw-material-landing/supplier-raw-material-landing.component';
import { SubComponentComponent } from './masterData/Components/sub-component/sub-component.component';
import { UsersComponent } from './administration/components/users/users.component';
import { ForgotPasswordComponent } from './Common/Components/forgot-password/forgot-password.component';
import { SetPasswordComponent } from './Common/Components/set-password/set-password.component';

const routes: Routes = [
  { path: "", component: LoginComponent },
  { path: "Login", component: LoginComponent },
  { path: "ForgotPassword", component: ForgotPasswordComponent },
  { path: "SetPassword/:id", component: SetPasswordComponent },
  { path: "Dashboard", component: DashboardComponent },
  { path: "Formulations", component: FormulationComponent },
  // { path: "Formulation", component: FormulationComponent },
  {
    path: "Masterdata", component: MasterdataComponent,
    children: [
      // {
      //   path: 'Products', component: ProductsComponent,

      //   children: [
      //     { path: "Product", component: ProductComponent }
      //   ]
      // },
      {
        path: 'Products', component: ProductComponent,
      },
      {
        path: 'Status', component: StatusComponent
      },
      {
        path: 'Regions', component: RegionsComponent
      },
      {
        path: 'Markets', component: MarketsComponent
      },
      {
        path: 'ProductCategories', component: ProductcategoriesComponent
      },
      {
        path: 'Regulations', component: RegulationsComponent
      },
      {
        path: 'Functions', component: FunctionsComponent
      },
      {
        path: 'RawMaterials', component: RawMaterialsComponent
      },
      {
        path: 'Sub-Component', component: SubComponentComponent
      }
    ], runGuardsAndResolvers: 'always'
  },
  {
    path: "RawMaterials", component: SupplierRawMaterialLandingComponent,
  },
  {
    path: 'RawMaterialDetails', component: SupplierRawMaterialDetailsComponent
  },
  {
    path: 'administration', component: UsersComponent
  },
  {
    path: 'Users', component: UsersComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload', useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
