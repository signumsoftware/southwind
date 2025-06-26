//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '../../Framework/Signum/React/Reflection'
import * as Entities from '../../Framework/Signum/React/Signum.Entities'
import * as Operations from '../../Framework/Signum/React/Signum.Operations'
import * as Files from '../../Framework/Extensions/Signum.Files/Signum.Files'
import * as Customers from '../Customers/Southwind.Customers'
import * as MachineLearning from '../../Framework/Extensions/Signum.MachineLearning/Signum.MachineLearning'



export const AdditionalInformationEmbedded: Type<AdditionalInformationEmbedded> = new Type<AdditionalInformationEmbedded>("AdditionalInformationEmbedded");
export interface AdditionalInformationEmbedded extends Entities.EmbeddedEntity {
  Type: "AdditionalInformationEmbedded";
  key: string;
  value: string;
}

export namespace CatalogMessage {
  export const ProductName: MessageKey = new MessageKey("CatalogMessage", "ProductName");
  export const UnitPrice: MessageKey = new MessageKey("CatalogMessage", "UnitPrice");
  export const QuantityPerUnit: MessageKey = new MessageKey("CatalogMessage", "QuantityPerUnit");
  export const UnitsInStock: MessageKey = new MessageKey("CatalogMessage", "UnitsInStock");
}

export const CategoryEntity: Type<CategoryEntity> = new Type<CategoryEntity>("Category");
export interface CategoryEntity extends Entities.Entity {
  Type: "Category";
  categoryName: string;
  description: string;
  picture: Files.FileEmbedded | null;
}

export namespace CategoryOperation {
  export const Save : Operations.ExecuteSymbol<CategoryEntity> = registerSymbol("Operation", "CategoryOperation.Save");
}

export const ProductEntity: Type<ProductEntity> = new Type<ProductEntity>("Product");
export interface ProductEntity extends Entities.Entity {
  Type: "Product";
  productName: string;
  supplier: Entities.Lite<SupplierEntity>;
  category: Entities.Lite<CategoryEntity>;
  quantityPerUnit: string;
  unitPrice: number;
  unitsInStock: number;
  reorderLevel: number;
  discontinued: boolean;
  additionalInformation: Entities.MList<AdditionalInformationEmbedded>;
}

export namespace ProductOperation {
  export const Save : Operations.ExecuteSymbol<ProductEntity> = registerSymbol("Operation", "ProductOperation.Save");
}

export namespace ProductPredictorPublication {
  export const MonthlySales : MachineLearning.PredictorPublicationSymbol = registerSymbol("PredictorPublication", "ProductPredictorPublication.MonthlySales");
}

export namespace ProductQuery {
  export const CurrentProducts: QueryKey = new QueryKey("ProductQuery", "CurrentProducts");
}

export const SupplierEntity: Type<SupplierEntity> = new Type<SupplierEntity>("Supplier");
export interface SupplierEntity extends Entities.Entity {
  Type: "Supplier";
  companyName: string;
  contactName: string | null;
  contactTitle: string | null;
  address: Customers.AddressEmbedded;
  phone: string;
  fax: string;
  homePage: string | null;
}

export namespace SupplierOperation {
  export const Save : Operations.ExecuteSymbol<SupplierEntity> = registerSymbol("Operation", "SupplierOperation.Save");
}

