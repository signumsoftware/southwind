//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '@framework/Reflection'
import * as Entities from '@framework/Signum.Entities'
import * as Customers from '../Customers/Southwind.Customers'
import * as Files from '@extensions/Signum.Files/Signum.Files'



export const EmployeeEntity = new Type<EmployeeEntity>("Employee");
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

export const EmployeeLiteModel = new Type<EmployeeLiteModel>("EmployeeLiteModel");
export interface EmployeeLiteModel extends Entities.ModelEntity {
  Type: "EmployeeLiteModel";
  lastName: string;
  firstName: string;
  photo: Entities.Lite<Files.FileEntity> | null;
}

export module EmployeeOperation {
  export const Save : Entities.ExecuteSymbol<EmployeeEntity> = registerSymbol("Operation", "EmployeeOperation.Save");
}

export module EmployeeQuery {
  export const EmployeesByTerritory = new QueryKey("EmployeeQuery", "EmployeesByTerritory");
}

export const RegionEntity = new Type<RegionEntity>("Region");
export interface RegionEntity extends Entities.Entity {
  Type: "Region";
  description: string;
}

export module RegionOperation {
  export const Save : Entities.ExecuteSymbol<RegionEntity> = registerSymbol("Operation", "RegionOperation.Save");
}

export const TerritoryEntity = new Type<TerritoryEntity>("Territory");
export interface TerritoryEntity extends Entities.Entity {
  Type: "Territory";
  region: RegionEntity;
  description: string;
}

export module TerritoryOperation {
  export const Save : Entities.ExecuteSymbol<TerritoryEntity> = registerSymbol("Operation", "TerritoryOperation.Save");
}


