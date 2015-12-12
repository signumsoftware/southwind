//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////
import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from 'Framework/Signum.React/Scripts/Reflection'

import * as Entities from 'Framework/Signum.React/Scripts/Signum.Entities' 

import * as Files from 'Extensions/Signum.React.Extensions/Files/Signum.Entities.Files' 

import * as Mailing from 'Extensions/Signum.React.Extensions/Mailing/Signum.Entities.Mailing' 

import * as SMS from 'Extensions/Signum.React.Extensions/SMS/Signum.Entities.SMS' 

import * as Processes from 'Extensions/Signum.React.Extensions/Processes/Signum.Entities.Processes' 

import * as Basics from 'Extensions/Signum.React.Extensions/Basics/Signum.Entities.Basics' 

import * as Scheduler from 'Extensions/Signum.React.Extensions/Scheduler/Signum.Entities.Scheduler' 

export const AddressEntity_Type = new Type<AddressEntity>("AddressEntity");
export interface AddressEntity extends Entities.EmbeddedEntity {
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
}

export enum AllowLogin {
    WindowsAndWeb,
    WindowsOnly,
    WebOnly,
}
export const AllowLogin_Type = new EnumType<AllowLogin>("AllowLogin", AllowLogin);

export const ApplicationConfigurationEntity_Type = new Type<ApplicationConfigurationEntity>("ApplicationConfigurationEntity");
export interface ApplicationConfigurationEntity extends Entities.Entity {
    environment?: string;
    email?: Mailing.EmailConfigurationEntity;
    smtpConfiguration?: Mailing.SmtpConfigurationEntity;
    sms?: SMS.SMSConfigurationEntity;
}

export module ApplicationConfigurationOperation {
    export const Save : Entities.ExecuteSymbol<ApplicationConfigurationEntity> = registerSymbol({ key: "ApplicationConfigurationOperation.Save" });
}

export const CategoryEntity_Type = new Type<CategoryEntity>("CategoryEntity");
export interface CategoryEntity extends Entities.Entity {
    categoryName?: string;
    description?: string;
    picture?: Files.EmbeddedFileEntity;
}

export module CategoryOperation {
    export const Save : Entities.ExecuteSymbol<CategoryEntity> = registerSymbol({ key: "CategoryOperation.Save" });
}

export const CompanyEntity_Type = new Type<CompanyEntity>("CompanyEntity");
export interface CompanyEntity extends CustomerEntity {
    companyName?: string;
    contactName?: string;
    contactTitle?: string;
}

export interface CustomerEntity extends Entities.Entity {
    address?: AddressEntity;
    phone?: string;
    fax?: string;
}

export module CustomerOperation {
    export const Save : Entities.ExecuteSymbol<CustomerEntity> = registerSymbol({ key: "CustomerOperation.Save" });
}

export const EmployeeEntity_Type = new Type<EmployeeEntity>("EmployeeEntity");
export interface EmployeeEntity extends Entities.Entity {
    lastName?: string;
    firstName?: string;
    title?: string;
    titleOfCourtesy?: string;
    birthDate?: string;
    hireDate?: string;
    address?: AddressEntity;
    homePhone?: string;
    extension?: string;
    photo?: Entities.Lite<Files.FileEntity>;
    notes?: string;
    reportsTo?: Entities.Lite<EmployeeEntity>;
    photoPath?: string;
    territories?: Entities.MList<TerritoryEntity>;
}

export module EmployeeOperation {
    export const Save : Entities.ExecuteSymbol<EmployeeEntity> = registerSymbol({ key: "EmployeeOperation.Save" });
}

export module EmployeeQuery {
    export const EmployeesByTerritory = new MessageKey("EmployeeQuery", "EmployeesByTerritory");
}

export const OrderDetailsEntity_Type = new Type<OrderDetailsEntity>("OrderDetailsEntity");
export interface OrderDetailsEntity extends Entities.EmbeddedEntity {
    product?: Entities.Lite<ProductEntity>;
    unitPrice?: number;
    quantity?: number;
    discount?: number;
}

export const OrderEntity_Type = new Type<OrderEntity>("OrderEntity");
export interface OrderEntity extends Entities.Entity {
    customer?: CustomerEntity;
    employee?: Entities.Lite<EmployeeEntity>;
    orderDate?: string;
    requiredDate?: string;
    shippedDate?: string;
    cancelationDate?: string;
    shipVia?: Entities.Lite<ShipperEntity>;
    shipName?: string;
    shipAddress?: AddressEntity;
    freight?: number;
    details?: Entities.MList<OrderDetailsEntity>;
    isLegacy?: boolean;
    state?: OrderState;
}

export const OrderFilterModel_Type = new Type<OrderFilterModel>("OrderFilterModel");
export interface OrderFilterModel extends Entities.ModelEntity {
    customer?: Entities.Lite<CustomerEntity>;
    employee?: Entities.Lite<EmployeeEntity>;
    minOrderDate?: string;
    maxOrderDate?: string;
}

export module OrderMessage {
    export const DiscountShouldBeMultpleOf5 = new MessageKey("OrderMessage", "DiscountShouldBeMultpleOf5");
    export const CancelShippedOrder0 = new MessageKey("OrderMessage", "CancelShippedOrder0");
    export const SelectAShipper = new MessageKey("OrderMessage", "SelectAShipper");
}

export module OrderOperation {
    export const Create : Entities.ConstructSymbol_Simple<OrderEntity> = registerSymbol({ key: "OrderOperation.Create" });
    export const SaveNew : Entities.ExecuteSymbol<OrderEntity> = registerSymbol({ key: "OrderOperation.SaveNew" });
    export const Save : Entities.ExecuteSymbol<OrderEntity> = registerSymbol({ key: "OrderOperation.Save" });
    export const Ship : Entities.ExecuteSymbol<OrderEntity> = registerSymbol({ key: "OrderOperation.Ship" });
    export const Cancel : Entities.ExecuteSymbol<OrderEntity> = registerSymbol({ key: "OrderOperation.Cancel" });
    export const CreateOrderFromCustomer : Entities.ConstructSymbol_From<OrderEntity, CustomerEntity> = registerSymbol({ key: "OrderOperation.CreateOrderFromCustomer" });
    export const CreateOrderFromProducts : Entities.ConstructSymbol_FromMany<OrderEntity, ProductEntity> = registerSymbol({ key: "OrderOperation.CreateOrderFromProducts" });
    export const Delete : Entities.DeleteSymbol<OrderEntity> = registerSymbol({ key: "OrderOperation.Delete" });
    export const CancelWithProcess : Entities.ConstructSymbol_FromMany<Processes.ProcessEntity, OrderEntity> = registerSymbol({ key: "OrderOperation.CancelWithProcess" });
}

export module OrderProcess {
    export const CancelOrders : Processes.ProcessAlgorithmSymbol = registerSymbol({ key: "OrderProcess.CancelOrders" });
}

export module OrderQuery {
    export const OrderLines = new MessageKey("OrderQuery", "OrderLines");
    export const OrderSimple = new MessageKey("OrderQuery", "OrderSimple");
}

export enum OrderState {
    New,
    Ordered,
    Shipped,
    Canceled,
}
export const OrderState_Type = new EnumType<OrderState>("OrderState", OrderState);

export module OrderTask {
    export const CancelOldOrdersWithProcess : Scheduler.SimpleTaskSymbol = registerSymbol({ key: "OrderTask.CancelOldOrdersWithProcess" });
    export const CancelOldOrders : Scheduler.SimpleTaskSymbol = registerSymbol({ key: "OrderTask.CancelOldOrders" });
}

export const PersonEntity_Type = new Type<PersonEntity>("PersonEntity");
export interface PersonEntity extends CustomerEntity {
    firstName?: string;
    lastName?: string;
    title?: string;
    dateOfBirth?: string;
    corrupt?: boolean;
}

export const ProductEntity_Type = new Type<ProductEntity>("ProductEntity");
export interface ProductEntity extends Entities.Entity {
    productName?: string;
    supplier?: Entities.Lite<SupplierEntity>;
    category?: Entities.Lite<CategoryEntity>;
    quantityPerUnit?: string;
    unitPrice?: number;
    unitsInStock?: number;
    reorderLevel?: number;
    discontinued?: boolean;
}

export module ProductOperation {
    export const Save : Entities.ExecuteSymbol<ProductEntity> = registerSymbol({ key: "ProductOperation.Save" });
}

export module ProductQuery {
    export const CurrentProducts = new MessageKey("ProductQuery", "CurrentProducts");
}

export const RegionEntity_Type = new Type<RegionEntity>("RegionEntity");
export interface RegionEntity extends Entities.Entity {
    description?: string;
}

export module RegionOperation {
    export const Save : Entities.ExecuteSymbol<RegionEntity> = registerSymbol({ key: "RegionOperation.Save" });
}

export const ShipperEntity_Type = new Type<ShipperEntity>("ShipperEntity");
export interface ShipperEntity extends Entities.Entity {
    companyName?: string;
    phone?: string;
}

export module ShipperOperation {
    export const Save : Entities.ExecuteSymbol<ShipperEntity> = registerSymbol({ key: "ShipperOperation.Save" });
}

export module SouthwindGroup {
    export const UserEntities : Basics.TypeConditionSymbol = registerSymbol({ key: "SouthwindGroup.UserEntities" });
    export const RoleEntities : Basics.TypeConditionSymbol = registerSymbol({ key: "SouthwindGroup.RoleEntities" });
    export const CurrentCustomer : Basics.TypeConditionSymbol = registerSymbol({ key: "SouthwindGroup.CurrentCustomer" });
}

export const SupplierEntity_Type = new Type<SupplierEntity>("SupplierEntity");
export interface SupplierEntity extends Entities.Entity {
    companyName?: string;
    contactName?: string;
    contactTitle?: string;
    address?: AddressEntity;
    phone?: string;
    fax?: string;
    homePage?: string;
}

export module SupplierOperation {
    export const Save : Entities.ExecuteSymbol<SupplierEntity> = registerSymbol({ key: "SupplierOperation.Save" });
}

export const TerritoryEntity_Type = new Type<TerritoryEntity>("TerritoryEntity");
export interface TerritoryEntity extends Entities.Entity {
    region?: RegionEntity;
    description?: string;
}

export module TerritoryOperation {
    export const Save : Entities.ExecuteSymbol<TerritoryEntity> = registerSymbol({ key: "TerritoryOperation.Save" });
}

export const UserEmployeeMixin_Type = new Type<UserEmployeeMixin>("UserEmployeeMixin");
export interface UserEmployeeMixin extends Entities.MixinEntity {
    allowLogin?: AllowLogin;
    employee?: EmployeeEntity;
}

