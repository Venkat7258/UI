import { FormulationRawMaterials } from "./formulation-raw-materials";

export class FormulationDetails {
    Id                        :number;
    FormulationReferenceNo    :string;
    VersionNo                 :string;
    FormulationReferenceNoandVersionNo:string;
    R_DContact                :string;
    Project                   :string;
    ReasonForChange           :string;
    ProductId                 :number;
    ProductName               :string;
    ProductCategoriesId       :number;
    ProductCategoryName       :string;
    MarketNames                :string;
    StatusId                  :number;
    StatusName                :string;
    CreatedBy                 :string;
    CreatedDate               :any;
    UpdatedBy                 :any;
    UpdatedDate               :any;
    IsDeleted                 :boolean;
    formulationRawMaterials:FormulationRawMaterials[];
    Markets   :any[];
    CloneMarkets   :any[];
    Products:any;
    ProductCategories:any;
    ActionType: boolean;
    isMarketUpdate : boolean;
}
