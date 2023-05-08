//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '../../Framework/Signum/React/Reflection'
import * as Entities from '../../Framework/Signum/React/Signum.Entities'
import * as Operations from '../../Framework/Signum/React/Signum.Operations'
import * as Customers from '../Customers/Southwind.Customers'
import * as Files from '../../Framework/Extensions/Signum.Files/Signum.Files'
import * as MachineLearning from '../../Framework/Extensions/Signum.MachineLearning/Signum.MachineLearning'



export const AdditionalInformationEmbedded = new Type<AdditionalInformationEmbedded>("AdditionalInformationEmbedded");
export interface AdditionalInformationEmbedded extends Entities.EmbeddedEntity {
  Type: "AdditionalInformationEmbedded";
  key: string;
  value: string;
}

export module CatalogMessage {
  export const ProductName = new MessageKey("CatalogMessage", "ProductName");
  export const UnitPrice = new MessageKey("CatalogMessage", "UnitPrice");
  export const QuantityPerUnit = new MessageKey("CatalogMessage", "QuantityPerUnit");
  export const UnitsInStock = new MessageKey("CatalogMessage", "UnitsInStock");
}

export const CategoryEntity = new Type<CategoryEntity>("Category");
export interface CategoryEntity extends Entities.Entity {
  Type: "Category";
  categoryName: string;
  description: string;
  picture: Files.FileEmbedded | null;
}

export module CategoryOperation {
  export const Save : Operations.ExecuteSymbol<CategoryEntity> = registerSymbol("Operation", "CategoryOperation.Save");
}

export const ProductEntity = new Type<ProductEntity>("Product");
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

export module ProductOperation {
  export const Save : Operations.ExecuteSymbol<ProductEntity> = registerSymbol("Operation", "ProductOperation.Save");
}

export module ProductPredictorPublication {
  export const MonthlySales : MachineLearning.PredictorPublicationSymbol = registerSymbol("PredictorPublication", "ProductPredictorPublication.MonthlySales");
}

export module ProductQuery {
  export const CurrentProducts = new QueryKey("ProductQuery", "CurrentProducts");
}

export const SupplierEntity = new Type<SupplierEntity>("Supplier");
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

export module SupplierOperation {
  export const Save : Operations.ExecuteSymbol<SupplierEntity> = registerSymbol("Operation", "SupplierOperation.Save");
}

