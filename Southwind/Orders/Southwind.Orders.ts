//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '../../Framework/Signum/React/Reflection'
import * as Entities from '../../Framework/Signum/React/Signum.Entities'
import * as Operations from '../../Framework/Signum/React/Signum.Operations'
import * as Customer from '../Customers/Southwind.Customer'
import * as Employees from '../Employees/Southwind.Employees'
import * as Shippers from '../Shippers/Southwind.Shippers'
import * as Globals from '../Globals/Southwind.Globals'
import * as Products from '../Products/Southwind.Products'
import * as Processes from '../../Framework/Extensions/Signum.Processes/Signum.Processes'
import * as Scheduler from '../../Framework/Extensions/Signum.Scheduler/Signum.Scheduler'


export const OrderDetailEmbedded = new Type<OrderDetailEmbedded>("OrderDetailEmbedded");
export interface OrderDetailEmbedded extends Entities.EmbeddedEntity {
  Type: "OrderDetailEmbedded";
  product: Entities.Lite<Products.ProductEntity>;
  unitPrice: number;
  quantity: number;
  discount: number;
}

export const OrderDetailMixin = new Type<OrderDetailMixin>("OrderDetailMixin");
export interface OrderDetailMixin extends Entities.MixinEntity {
  Type: "OrderDetailMixin";
  discountCode: string | null;
}

export const OrderEntity = new Type<OrderEntity>("Order");
export interface OrderEntity extends Entities.Entity {
  Type: "Order";
  customer: Customer.CustomerEntity;
  employee: Entities.Lite<Employees.EmployeeEntity>;
  orderDate: string /*DateTime*/;
  requiredDate: string /*DateTime*/;
  shippedDate: string /*DateTime*/ | null;
  cancelationDate: string /*DateTime*/ | null;
  shipVia: Entities.Lite<Shippers.ShipperEntity> | null;
  shipName: string | null;
  shipAddress: Globals.AddressEmbedded;
  freight: number;
  details: Entities.MList<OrderDetailEmbedded>;
  isLegacy: boolean;
  state: OrderState;
}

export const OrderFilterModel = new Type<OrderFilterModel>("OrderFilterModel");
export interface OrderFilterModel extends Entities.ModelEntity {
  Type: "OrderFilterModel";
  customer: Entities.Lite<Customer.CustomerEntity> | null;
  employee: Entities.Lite<Employees.EmployeeEntity> | null;
  minOrderDate: string /*DateOnly*/ | null;
  maxOrderDate: string /*DateOnly*/ | null;
}

export module OrderMessage {
  export const DiscountShouldBeMultpleOf5 = new MessageKey("OrderMessage", "DiscountShouldBeMultpleOf5");
  export const CancelShippedOrder0 = new MessageKey("OrderMessage", "CancelShippedOrder0");
  export const SelectAShipper = new MessageKey("OrderMessage", "SelectAShipper");
  export const SubTotalPrice = new MessageKey("OrderMessage", "SubTotalPrice");
  export const TotalPrice = new MessageKey("OrderMessage", "TotalPrice");
  export const SalesNextMonth = new MessageKey("OrderMessage", "SalesNextMonth");
}

export module OrderOperation {
  export const Create : Operations.ConstructSymbol_Simple<OrderEntity> = registerSymbol("Operation", "OrderOperation.Create");
  export const Save : Operations.ExecuteSymbol<OrderEntity> = registerSymbol("Operation", "OrderOperation.Save");
  export const Ship : Operations.ExecuteSymbol<OrderEntity> = registerSymbol("Operation", "OrderOperation.Ship");
  export const Cancel : Operations.ExecuteSymbol<OrderEntity> = registerSymbol("Operation", "OrderOperation.Cancel");
  export const CreateOrderFromCustomer : Operations.ConstructSymbol_From<OrderEntity, Customer.CustomerEntity> = registerSymbol("Operation", "OrderOperation.CreateOrderFromCustomer");
  export const CreateOrderFromProducts : Operations.ConstructSymbol_FromMany<OrderEntity, Products.ProductEntity> = registerSymbol("Operation", "OrderOperation.CreateOrderFromProducts");
  export const Delete : Operations.DeleteSymbol<OrderEntity> = registerSymbol("Operation", "OrderOperation.Delete");
  export const CancelWithProcess : Operations.ConstructSymbol_FromMany<Processes.ProcessEntity, OrderEntity> = registerSymbol("Operation", "OrderOperation.CancelWithProcess");
}

export module OrderProcess {
  export const CancelOrders : Processes.ProcessAlgorithmSymbol = registerSymbol("ProcessAlgorithm", "OrderProcess.CancelOrders");
}

export module OrderQuery {
  export const OrderLines = new QueryKey("OrderQuery", "OrderLines");
}

export const OrderState = new EnumType<OrderState>("OrderState");
export type OrderState =
  "New" |
  "Ordered" |
  "Shipped" |
  "Canceled";

export module OrderTask {
  export const CancelOldOrdersWithProcess : Scheduler.SimpleTaskSymbol = registerSymbol("SimpleTask", "OrderTask.CancelOldOrdersWithProcess");
  export const CancelOldOrders : Scheduler.SimpleTaskSymbol = registerSymbol("SimpleTask", "OrderTask.CancelOldOrders");
}

