//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '../../../Framework/Signum.React/Scripts/Reflection'
import * as Entities from '../../../Framework/Signum.React/Scripts/Signum.Entities'



export const AddressEmbedded = new Type<AddressEmbedded>("AddressEmbedded");
export interface AddressEmbedded extends Entities.EmbeddedEntity {
  Type: "AddressEmbedded";
  address: string;
  city: string;
  region: string | null;
  postalCode: string | null;
  country: string;
}

export const CompanyEntity = new Type<CompanyEntity>("Company");
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

export module CustomerOperation {
  export const Save : Entities.ExecuteSymbol<CustomerEntity> = registerSymbol("Operation", "CustomerOperation.Save");
}

export module CustomerQuery {
  export const Customer = new QueryKey("CustomerQuery", "Customer");
}

export const PersonEntity = new Type<PersonEntity>("Person");
export interface PersonEntity extends CustomerEntity {
  Type: "Person";
  firstName: string;
  lastName: string;
  title: string | null;
  dateOfBirth: string /*DateTime*/ | null;
  corrupt: boolean;
}


