//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '../../Framework/Signum/React/Reflection'
import * as Entities from '../../Framework/Signum/React/Signum.Entities'
import * as Operations from '../../Framework/Signum/React/Signum.Operations'
import * as Globals from '../Globals/Southwind.Globals'


export const CompanyEntity = new Type<CompanyEntity>("Company");
export interface CompanyEntity extends CustomerEntity {
  Type: "Company";
  companyName: string;
  contactName: string;
  contactTitle: string;
}

export interface CustomerEntity extends Entities.Entity {
  address: Globals.AddressEmbedded;
  phone: string;
  fax: string | null;
}

export module CustomerOperation {
  export const Save : Operations.ExecuteSymbol<CustomerEntity> = registerSymbol("Operation", "CustomerOperation.Save");
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

