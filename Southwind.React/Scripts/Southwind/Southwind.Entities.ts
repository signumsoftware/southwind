//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '../../../Framework/Signum.React/Scripts/Reflection'
import * as Entities from '../../../Framework/Signum.React/Scripts/Signum.Entities'
import * as Files from '../../../Extensions/Signum.React.Extensions/Files/Signum.Entities.Files'
import * as Mailing from '../../../Extensions/Signum.React.Extensions/Mailing/Signum.Entities.Mailing'
import * as SMS from '../../../Extensions/Signum.React.Extensions/SMS/Signum.Entities.SMS'
import * as Authorization from '../../../Extensions/Signum.React.Extensions/Authorization/Signum.Entities.Authorization'
import * as Processes from '../../../Extensions/Signum.React.Extensions/Processes/Signum.Entities.Processes'
import * as Scheduler from '../../../Extensions/Signum.React.Extensions/Scheduler/Signum.Entities.Scheduler'
import * as Basics from '../../../Extensions/Signum.React.Extensions/Basics/Signum.Entities.Basics'



export const AddressEntity = new Type<AddressEntity>("AddressEntity");
export interface AddressEntity extends Entities.EmbeddedEntity {
    Type: "AddressEntity";
    address?: string | null;
    city?: string | null;
    region?: string | null;
    postalCode?: string | null;
    country?: string | null;
}

export const AllowLogin = new EnumType<AllowLogin>("AllowLogin");
export type AllowLogin =
    "WindowsAndWeb" |
    "WindowsOnly" |
    "WebOnly";

export const ApplicationConfigurationEntity = new Type<ApplicationConfigurationEntity>("ApplicationConfiguration");
export interface ApplicationConfigurationEntity extends Entities.Entity {
    Type: "ApplicationConfiguration";
    environment?: string | null;
    email?: Mailing.EmailConfigurationEntity | null;
    smtpConfiguration?: Mailing.SmtpConfigurationEntity | null;
    sms?: SMS.SMSConfigurationEntity | null;
    authTokens?: Authorization.AuthTokenConfigurationEntity | null;
}

export module ApplicationConfigurationOperation {
    export const Save : Entities.ExecuteSymbol<ApplicationConfigurationEntity> = registerSymbol({ Type: "Operation", key: "ApplicationConfigurationOperation.Save" });
}

export const CategoryEntity = new Type<CategoryEntity>("Category");
export interface CategoryEntity extends Entities.Entity {
    Type: "Category";
    categoryName?: string | null;
    description?: string | null;
    picture?: Files.EmbeddedFileEntity | null;
}

export module CategoryOperation {
    export const Save : Entities.ExecuteSymbol<CategoryEntity> = registerSymbol({ Type: "Operation", key: "CategoryOperation.Save" });
}

export const CompanyEntity = new Type<CompanyEntity>("Company");
export interface CompanyEntity extends CustomerEntity {
    Type: "Company";
    companyName?: string | null;
    contactName?: string | null;
    contactTitle?: string | null;
}

export interface CustomerEntity extends Entities.Entity {
    address?: AddressEntity | null;
    phone?: string | null;
    fax?: string | null;
}

export module CustomerOperation {
    export const Save : Entities.ExecuteSymbol<CustomerEntity> = registerSymbol({ Type: "Operation", key: "CustomerOperation.Save" });
}

export const EmployeeEntity = new Type<EmployeeEntity>("Employee");
export interface EmployeeEntity extends Entities.Entity {
    Type: "Employee";
    lastName?: string | null;
    firstName?: string | null;
    title?: string | null;
    titleOfCourtesy?: string | null;
    birthDate?: string | null;
    hireDate?: string | null;
    address?: AddressEntity | null;
    homePhone?: string | null;
    extension?: string | null;
    photo?: Entities.Lite<Files.FileEntity>;
    notes?: string | null;
    reportsTo?: Entities.Lite<EmployeeEntity>;
    photoPath?: string | null;
    territories: Entities.MList<TerritoryEntity>;
}

export module EmployeeOperation {
    export const Save : Entities.ExecuteSymbol<EmployeeEntity> = registerSymbol({ Type: "Operation", key: "EmployeeOperation.Save" });
}

export module EmployeeQuery {
    export const EmployeesByTerritory = new QueryKey("EmployeeQuery", "EmployeesByTerritory");
}

export const OrderDetailsEntity = new Type<OrderDetailsEntity>("OrderDetailsEntity");
export interface OrderDetailsEntity extends Entities.EmbeddedEntity {
    Type: "OrderDetailsEntity";
    product?: Entities.Lite<ProductEntity>;
    unitPrice?: number;
    quantity?: number;
    discount?: number;
}

export const OrderEntity = new Type<OrderEntity>("Order");
export interface OrderEntity extends Entities.Entity {
    Type: "Order";
    customer?: CustomerEntity | null;
    employee?: Entities.Lite<EmployeeEntity>;
    orderDate?: string;
    requiredDate?: string;
    shippedDate?: string | null;
    cancelationDate?: string | null;
    shipVia?: Entities.Lite<ShipperEntity>;
    shipName?: string | null;
    shipAddress?: AddressEntity | null;
    freight?: number;
    details: Entities.MList<OrderDetailsEntity>;
    isLegacy?: boolean;
    state?: OrderState;
}

export const OrderFilterModel = new Type<OrderFilterModel>("OrderFilterModel");
export interface OrderFilterModel extends Entities.ModelEntity {
    Type: "OrderFilterModel";
    customer?: Entities.Lite<CustomerEntity>;
    employee?: Entities.Lite<EmployeeEntity>;
    minOrderDate?: string | null;
    maxOrderDate?: string | null;
}

export module OrderMessage {
    export const DiscountShouldBeMultpleOf5 = new MessageKey("OrderMessage", "DiscountShouldBeMultpleOf5");
    export const CancelShippedOrder0 = new MessageKey("OrderMessage", "CancelShippedOrder0");
    export const SelectAShipper = new MessageKey("OrderMessage", "SelectAShipper");
}

export module OrderOperation {
    export const Create : Entities.ConstructSymbol_Simple<OrderEntity> = registerSymbol({ Type: "Operation", key: "OrderOperation.Create" });
    export const SaveNew : Entities.ExecuteSymbol<OrderEntity> = registerSymbol({ Type: "Operation", key: "OrderOperation.SaveNew" });
    export const Save : Entities.ExecuteSymbol<OrderEntity> = registerSymbol({ Type: "Operation", key: "OrderOperation.Save" });
    export const Ship : Entities.ExecuteSymbol<OrderEntity> = registerSymbol({ Type: "Operation", key: "OrderOperation.Ship" });
    export const Cancel : Entities.ExecuteSymbol<OrderEntity> = registerSymbol({ Type: "Operation", key: "OrderOperation.Cancel" });
    export const CreateOrderFromCustomer : Entities.ConstructSymbol_From<OrderEntity, CustomerEntity> = registerSymbol({ Type: "Operation", key: "OrderOperation.CreateOrderFromCustomer" });
    export const CreateOrderFromProducts : Entities.ConstructSymbol_FromMany<OrderEntity, ProductEntity> = registerSymbol({ Type: "Operation", key: "OrderOperation.CreateOrderFromProducts" });
    export const Delete : Entities.DeleteSymbol<OrderEntity> = registerSymbol({ Type: "Operation", key: "OrderOperation.Delete" });
    export const CancelWithProcess : Entities.ConstructSymbol_FromMany<Processes.ProcessEntity, OrderEntity> = registerSymbol({ Type: "Operation", key: "OrderOperation.CancelWithProcess" });
}

export module OrderProcess {
    export const CancelOrders : Processes.ProcessAlgorithmSymbol = registerSymbol({ Type: "ProcessAlgorithm", key: "OrderProcess.CancelOrders" });
}

export module OrderQuery {
    export const OrderLines = new QueryKey("OrderQuery", "OrderLines");
    export const OrderSimple = new QueryKey("OrderQuery", "OrderSimple");
}

export const OrderState = new EnumType<OrderState>("OrderState");
export type OrderState =
    "New" |
    "Ordered" |
    "Shipped" |
    "Canceled";

export module OrderTask {
    export const CancelOldOrdersWithProcess : Scheduler.SimpleTaskSymbol = registerSymbol({ Type: "SimpleTask", key: "OrderTask.CancelOldOrdersWithProcess" });
    export const CancelOldOrders : Scheduler.SimpleTaskSymbol = registerSymbol({ Type: "SimpleTask", key: "OrderTask.CancelOldOrders" });
}

export const PersonEntity = new Type<PersonEntity>("Person");
export interface PersonEntity extends CustomerEntity {
    Type: "Person";
    firstName?: string | null;
    lastName?: string | null;
    title?: string | null;
    dateOfBirth?: string | null;
    corrupt?: boolean;
}

export const ProductEntity = new Type<ProductEntity>("Product");
export interface ProductEntity extends Entities.Entity {
    Type: "Product";
    productName?: string | null;
    supplier?: Entities.Lite<SupplierEntity>;
    category?: Entities.Lite<CategoryEntity>;
    quantityPerUnit?: string | null;
    unitPrice?: number;
    unitsInStock?: number;
    reorderLevel?: number;
    discontinued?: boolean;
}

export module ProductOperation {
    export const Save : Entities.ExecuteSymbol<ProductEntity> = registerSymbol({ Type: "Operation", key: "ProductOperation.Save" });
}

export module ProductQuery {
    export const CurrentProducts = new QueryKey("ProductQuery", "CurrentProducts");
}

export const RegionEntity = new Type<RegionEntity>("Region");
export interface RegionEntity extends Entities.Entity {
    Type: "Region";
    description?: string | null;
}

export module RegionOperation {
    export const Save : Entities.ExecuteSymbol<RegionEntity> = registerSymbol({ Type: "Operation", key: "RegionOperation.Save" });
}

export const ShipperEntity = new Type<ShipperEntity>("Shipper");
export interface ShipperEntity extends Entities.Entity {
    Type: "Shipper";
    companyName?: string | null;
    phone?: string | null;
}

export module ShipperOperation {
    export const Save : Entities.ExecuteSymbol<ShipperEntity> = registerSymbol({ Type: "Operation", key: "ShipperOperation.Save" });
}

export module SouthwindGroup {
    export const UserEntities : Basics.TypeConditionSymbol = registerSymbol({ Type: "TypeCondition", key: "SouthwindGroup.UserEntities" });
    export const RoleEntities : Basics.TypeConditionSymbol = registerSymbol({ Type: "TypeCondition", key: "SouthwindGroup.RoleEntities" });
    export const CurrentCustomer : Basics.TypeConditionSymbol = registerSymbol({ Type: "TypeCondition", key: "SouthwindGroup.CurrentCustomer" });
}

export const SupplierEntity = new Type<SupplierEntity>("Supplier");
export interface SupplierEntity extends Entities.Entity {
    Type: "Supplier";
    companyName?: string | null;
    contactName?: string | null;
    contactTitle?: string | null;
    address?: AddressEntity | null;
    phone?: string | null;
    fax?: string | null;
    homePage?: string | null;
}

export module SupplierOperation {
    export const Save : Entities.ExecuteSymbol<SupplierEntity> = registerSymbol({ Type: "Operation", key: "SupplierOperation.Save" });
}

export const TerritoryEntity = new Type<TerritoryEntity>("Territory");
export interface TerritoryEntity extends Entities.Entity {
    Type: "Territory";
    region?: RegionEntity | null;
    description?: string | null;
}

export module TerritoryOperation {
    export const Save : Entities.ExecuteSymbol<TerritoryEntity> = registerSymbol({ Type: "Operation", key: "TerritoryOperation.Save" });
}

export const UserEmployeeMixin = new Type<UserEmployeeMixin>("UserEmployeeMixin");
export interface UserEmployeeMixin extends Entities.MixinEntity {
    Type: "UserEmployeeMixin";
    allowLogin?: AllowLogin;
    employee?: Entities.Lite<EmployeeEntity>;
}


