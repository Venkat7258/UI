import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './common/Components/login/login.component';
import { FormulationComponent } from './formulation/Components/formulation/formulation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductsComponent } from './masterdata/Components/products/products.component';

import { MarketsComponent } from './masterdata/Components/markets/markets.component';
import { StatusComponent } from './masterdata/Components/status/status.component';
import { FunctionsComponent } from './masterdata/Components/functions/functions.component';
import { MasterdataComponent } from './masterdata/components/masterdata/masterdata.component';
import { DashboardComponent } from './common/components/dashboard/dashboard.component';
import { ProductComponent } from './masterdata/components/product/product.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EnvServiceProvider } from './shared/services/env.service.provider';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { RMMApiService } from './shared/services/rmmapi.service';
import { RegulationsComponent } from './masterdata/Components/regulations/regulations.component';
import { MarketCountriesComponent } from './masterdata/Components/market-countries/market-countries.component';
import { CountriesComponent } from './masterdata/Components/countries/countries.component';
import { RawMaterialsComponent } from './masterdata/Components/raw-materials/raw-materials.component';
import { RegionsComponent } from './masterdata/Components/regions/regions.component';
import { SuppliersComponent } from './masterdata/Components/suppliers/suppliers.component';
import { CommonModule, DatePipe } from '@angular/common';
import { ManufacturersComponent } from './masterdata/Components/manufacturers/manufacturers.component';
import { ProductcategoriesComponent } from './masterdata/components/productcategories/productcategories.component';
import { RegulationGroupsComponent } from './masterdata/Components/regulation-groups/regulation-groups.component';
import { RegulationPropertiesComponent } from './masterdata/Components/regulation-properties/regulation-properties.component';
import { PropertyValueTypesComponent } from './masterdata/Components/property-value-types/property-value-types.component';
import { PropertyValueTypeOptionsComponent } from './masterdata/Components/property-value-type-options/property-value-type-options.component';
import { DocumentTypesComponent } from './masterdata/Components/document-types/document-types.component';
import { ToastrModule } from 'ngx-toastr';
import { SupplierRawMaterialDataChecksComponent } from './rawmaterial/components/supplier-raw-material-data-checks/supplier-raw-material-data-checks.component';
import { SupplierRawMaterialDetailsComponent } from './rawmaterial/components/supplier-raw-material-details/supplier-raw-material-details.component';
import { SupplierRawMaterialDocumentDetailsComponent } from './rawmaterial/components/supplier-raw-material-document-details/supplier-raw-material-document-details.component';
import { SupplierRawMaterialFunctionsComponent } from './rawmaterial/components/supplier-raw-material-functions/supplier-raw-material-functions.component';
import { SupplierRawMaterialReviewCommentsComponent } from './rawmaterial/components/supplier-raw-material-review-comments/supplier-raw-material-review-comments.component';
import { SupplierRawMaterialSubComponentDetailsComponent } from './rawmaterial/components/supplier-raw-material-sub-component-details/supplier-raw-material-sub-component-details.component';
import { SupplierRawMaterialSubComponentFunctionsComponent } from './rawmaterial/components/supplier-raw-material-sub-component-functions/supplier-raw-material-sub-component-functions.component';
import { SupplierRawMaterialDataCheckDocumentsComponent } from './rawmaterial/components/supplier-raw-material-data-check-documents/supplier-raw-material-data-check-documents.component';
import { SupplierRawMaterialLandingComponent } from './rawmaterial/components/supplier-raw-material-landing/supplier-raw-material-landing.component';
import { SupplierRawMaterialGeneralDetailsComponent } from './rawmaterial/components/supplier-raw-material-general-details/supplier-raw-material-general-details.component';
import { StatusTypesComponent } from './masterdata/Components/status-types/status-types.component';
import { SubComponentFunctionsComponent } from './masterdata/Components/sub-component-functions/sub-component-functions.component';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { SubComponentComponent } from './masterData/Components/sub-component/sub-component.component';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { IntlModule } from '@progress/kendo-angular-intl';
import { UploadsModule } from "@progress/kendo-angular-upload";
import { UploadInterceptor } from './shared/interceptors/upload.interceptor';
import { FormulationRawMaterialsComponent } from './formulation/Components/formulation-raw-materials/formulation-raw-materials.component';
import { MarketRegulationsComponent } from './formulation/Components/market-regulations/market-regulations.component';
import { FormulationService } from './formulation/Services/formulation.service';
import { RequiredValidatorLogicDirective } from './shared/directives/required-validator-logic.directive';
import { FormulationTranscriptSummaryComponent } from './formulation/Components/formulation-transcript-summary/formulation-transcript-summary.component';
import { FormulationINCIBreakdownListComponent } from './formulation/Components/formulation-incibreakdown-list/formulation-incibreakdown-list.component';
import { DataDocumentCheckComponent } from './formulation/Components/data-document-check/data-document-check.component';
import { FormulationReviewCommentComponent } from './formulation/Components/formulation-review-comment/formulation-review-comment.component';
import { FormulationDocumentTrackingComponent } from './formulation/Components/formulation-document-tracking/formulation-document-tracking.component';
import { UsersComponent } from './administration/components/users/users.component';
import { ProfileComponent } from './administration/profile/profile.component';
import { NumbersOnlyDirective } from './shared/directives/numbers-only.directive';
import { ChangePasswordComponent } from './administration/change-password/change-password.component';
import { MustMatchDirective } from './shared/directives/must-match.directive';
import { ForgotPasswordComponent } from './Common/Components/forgot-password/forgot-password.component';
import { SetPasswordComponent } from './Common/Components/set-password/set-password.component';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { TransformationStatuCodeColor } from './common/Pipes/TransformationStatuCodeColor.pipe';
import { AutoLogoutService } from './shared/services/AutoLogout/auto-logout.service';
import { InputTrimDirective } from './shared/directives/input-trim.directive';
import { InputTrimModule } from 'ng2-trim-directive';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FormulationComponent,
    ProductsComponent,
    MarketsComponent,
    StatusComponent,
    StatusTypesComponent,
    FunctionsComponent,
    MasterdataComponent,
    DashboardComponent,
    ProductComponent,    
    MarketCountriesComponent,
    CountriesComponent,
    RegulationGroupsComponent,
    RegulationsComponent,
    RawMaterialsComponent,
    RegionsComponent,
    SuppliersComponent,
    ProductcategoriesComponent,
    ManufacturersComponent,
    SuppliersComponent,
    RegulationPropertiesComponent,
    PropertyValueTypeOptionsComponent,
    PropertyValueTypesComponent,
    DocumentTypesComponent,
    SupplierRawMaterialDataCheckDocumentsComponent,
    SupplierRawMaterialDataChecksComponent,
    SupplierRawMaterialDetailsComponent,
    SupplierRawMaterialDocumentDetailsComponent,
    SupplierRawMaterialFunctionsComponent,
    SupplierRawMaterialReviewCommentsComponent,
    SupplierRawMaterialSubComponentDetailsComponent,
    SupplierRawMaterialSubComponentFunctionsComponent,
    SupplierRawMaterialLandingComponent,
    SupplierRawMaterialGeneralDetailsComponent,
    SubComponentFunctionsComponent,
    SubComponentComponent,
    FormulationRawMaterialsComponent,
    MarketRegulationsComponent,
    RequiredValidatorLogicDirective,
    FormulationTranscriptSummaryComponent,
    FormulationINCIBreakdownListComponent,
    DataDocumentCheckComponent,
    FormulationReviewCommentComponent,      
    FormulationINCIBreakdownListComponent,
    FormulationDocumentTrackingComponent,
    UsersComponent,
    ProfileComponent,
    NumbersOnlyDirective,
    ChangePasswordComponent,
    MustMatchDirective,
    ForgotPasswordComponent,
    SetPasswordComponent,
    TransformationStatuCodeColor,
    InputTrimDirective
     ],
  entryComponents : [FormulationReviewCommentComponent,ProfileComponent,ChangePasswordComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,                       
    ReactiveFormsModule, ButtonsModule,GridModule, BrowserAnimationsModule,
    NgbModule,
    HttpClientModule,
    UploadsModule,
    DropDownsModule,
    CommonModule,
    TreeViewModule,
    IntlModule,
    DateInputsModule,
    TooltipModule,
    InputTrimModule ,
    ToastrModule.forRoot({
      maxOpened: 1,
      preventDuplicates: true,
      autoDismiss: true,
      positionClass: 'toast-top-center',
    }),
 
  ],
  providers: [RMMApiService,FormulationService,EnvServiceProvider,DatePipe,AutoLogoutService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UploadInterceptor,
      multi: true,
    }],
  bootstrap: [AppComponent],
  //entryComponents:[RegulationGroupsComponent]
})
export class AppModule { }
