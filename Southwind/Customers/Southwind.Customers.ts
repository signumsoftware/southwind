//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '../../Framework/Signum/React/Reflection'
import * as Entities from '../../Framework/Signum/React/Signum.Entities'
import * as Operations from '../../Framework/Signum/React/Signum.Operations'



export const AddressEmbedded: Type<AddressEmbedded> = new Type<AddressEmbedded>("AddressEmbedded");
export interface AddressEmbedded extends Entities.EmbeddedEntity {
  Type: "AddressEmbedded";
  address: string;
  city: string;
  region: string | null;
  postalCode: string | null;
  country: string;
}

export const CompanyEntity: Type<CompanyEntity> = new Type<CompanyEntity>("Company");
export interface CompanyEntity extends CustomerEntity {
  Type: "Company";
  companyName: string;
  contactName: string;
  contactTitle: string;
}

export interface CustomerEntity extends Entities.Entity {
  address: AddressEmbedded;
  phone: string;
  fax: string | null;
}

export namespace CustomerOperation {
  export const Save : Operations.ExecuteSymbol<CustomerEntity> = registerSymbol("Operation", "CustomerOperation.Save");
}

export namespace CustomerQuery {
  export const Customer: QueryKey = new QueryKey("CustomerQuery", "Customer");
}

export const PersonEntity: Type<PersonEntity> = new Type<PersonEntity>("Person");
export interface PersonEntity extends CustomerEntity {
  Type: "Person";
  firstName: string;
  lastName: string;
  title: string | null;
  dateOfBirth: string /*DateOnly*/ | null;
}

