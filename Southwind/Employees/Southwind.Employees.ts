//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '../../Framework/Signum/React/Reflection'
import * as Entities from '../../Framework/Signum/React/Signum.Entities'
import * as Operations from '../../Framework/Signum/React/Signum.Operations'
import * as Customers from '../Customers/Southwind.Customers'
import * as Files from '../../Framework/Extensions/Signum.Files/Signum.Files'



export const EmployeeEntity: Type<EmployeeEntity> = new Type<EmployeeEntity>("Employee");
export interface EmployeeEntity extends Entities.Entity {
  Type: "Employee";
  lastName: string;
  firstName: string;
  title: string | null;
  titleOfCourtesy: string | null;
  birthDate: string /*DateOnly*/ | null;
  hireDate: string /*DateOnly*/ | null;
  address: Customers.AddressEmbedded;
  homePhone: string | null;
  extension: string | null;
  photo: Entities.Lite<Files.FileEntity> | null;
  notes: string | null;
  reportsTo: Entities.Lite<EmployeeEntity> | null;
  photoPath: string | null;
  territories: Entities.MList<TerritoryEntity>;
}

export const EmployeeLiteModel: Type<EmployeeLiteModel> = new Type<EmployeeLiteModel>("EmployeeLiteModel");
export interface EmployeeLiteModel extends Entities.ModelEntity {
  Type: "EmployeeLiteModel";
  lastName: string;
  firstName: string;
  photo: Entities.Lite<Files.FileEntity> | null;
}

export namespace EmployeeOperation {
  export const Save : Operations.ExecuteSymbol<EmployeeEntity> = registerSymbol("Operation", "EmployeeOperation.Save");
}

export namespace EmployeeQuery {
  export const EmployeesByTerritory: QueryKey = new QueryKey("EmployeeQuery", "EmployeesByTerritory");
}

export const RegionEntity: Type<RegionEntity> = new Type<RegionEntity>("Region");
export interface RegionEntity extends Entities.Entity {
  Type: "Region";
  description: string;
}

export namespace RegionOperation {
  export const Save : Operations.ExecuteSymbol<RegionEntity> = registerSymbol("Operation", "RegionOperation.Save");
}

export const TerritoryEntity: Type<TerritoryEntity> = new Type<TerritoryEntity>("Territory");
export interface TerritoryEntity extends Entities.Entity {
  Type: "Territory";
  region: RegionEntity;
  description: string;
}

export namespace TerritoryOperation {
  export const Save : Operations.ExecuteSymbol<TerritoryEntity> = registerSymbol("Operation", "TerritoryOperation.Save");
}

