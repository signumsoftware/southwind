//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '../../Framework/Signum/React/Reflection'
import * as Entities from '../../Framework/Signum/React/Signum.Entities'
import * as Operations from '../../Framework/Signum/React/Signum.Operations'



export const ShipperEntity = new Type<ShipperEntity>("Shipper");
export interface ShipperEntity extends Entities.Entity {
  Type: "Shipper";
  companyName: string;
  phone: string;
}

export module ShipperOperation {
  export const Save : Operations.ExecuteSymbol<ShipperEntity> = registerSymbol("Operation", "ShipperOperation.Save");
}

