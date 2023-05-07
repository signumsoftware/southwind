//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '@framework/Reflection'
import * as Entities from '@framework/Signum.Entities'



export const ShipperEntity = new Type<ShipperEntity>("Shipper");
export interface ShipperEntity extends Entities.Entity {
  Type: "Shipper";
  companyName: string;
  phone: string;
}

export module ShipperOperation {
  export const Save : Entities.ExecuteSymbol<ShipperEntity> = registerSymbol("Operation", "ShipperOperation.Save");
}


