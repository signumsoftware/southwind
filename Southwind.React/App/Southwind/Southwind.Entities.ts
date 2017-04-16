//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '../../../Framework/Signum.React/Scripts/Reflection'
import * as Entities from '../../../Framework/Signum.React/Scripts/Signum.Entities'
import * as Files from '../../../Extensions/Signum.React.Extensions/Files/Signum.Entities.Files'
import * as Mailing from '../../../Extensions/Signum.React.Extensions/Mailing/Signum.Entities.Mailing'
import * as SMS from '../../../Extensions/Signum.React.Extensions/SMS/Signum.Entities.SMS'
import * as Authorization from '../../../Extensions/Signum.React.Extensions/Authorization/Signum.Entities.Authorization'
import * as Workflow from '../../../Extensions/Signum.React.Extensions/Workflow/Signum.Entities.Workflow'
import * as Processes from '../../../Extensions/Signum.React.Extensions/Processes/Signum.Entities.Processes'
import * as Scheduler from '../../../Extensions/Signum.React.Extensions/Scheduler/Signum.Entities.Scheduler'
import * as Basics from '../../../Extensions/Signum.React.Extensions/Basics/Signum.Entities.Basics'



export const AddressEmbedded = new Type<AddressEmbedded>("AddressEmbedded");
export interface AddressEmbedded extends Entities.EmbeddedEntity {
    Type: "AddressEmbedded";
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
    email?: Mailing.EmailConfigurationEmbedded | null;
    smtpConfiguration?: Mailing.SmtpConfigurationEntity | null;
    sms?: SMS.SMSConfigurationEmbedded | null;
    authTokens?: Authorization.AuthTokenConfigurationEmbedded | null;
    workflow?: Workflow.WorkflowConfigurationEmbedded | null;
}

export module ApplicationConfigurationOperation {
    export const Save : Entities.ExecuteSymbol<ApplicationConfigurationEntity> = registerSymbol("Operation", "ApplicationConfigurationOperation.Save");
}

export const CategoryEntity = new Type<CategoryEntity>("Category");
export interface CategoryEntity extends Entities.Entity {
    Type: "Category";
    categoryName?: string | null;
    description?: string | null;
    picture?: Files.FileEmbedded | null;
}

export module CategoryOperation {
    export const Save : Entities.ExecuteSymbol<CategoryEntity> = registerSymbol("Operation", "CategoryOperation.Save");
}

export const CompanyEntity = new Type<CompanyEntity>("Company");
export interface CompanyEntity extends CustomerEntity {
    Type: "Company";
    companyName?: string | null;
    contactName?: string | null;
    contactTitle?: string | null;
}

export interface CustomerEntity extends Entities.Entity {
    address?: AddressEmbedded | null;
    phone?: string | null;
    fax?: string | null;
}

export module CustomerOperation {
    export const Save : Entities.ExecuteSymbol<CustomerEntity> = registerSymbol("Operation", "CustomerOperation.Save");
}

export module CustomerQuery {
    export const Customer = new QueryKey("CustomerQuery", "Customer");
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
    address?: AddressEmbedded | null;
    homePhone?: string | null;
    extension?: string | null;
    photo?: Entities.Lite<Files.FileEntity> | null;
    notes?: string | null;
    reportsTo?: Entities.Lite<EmployeeEntity> | null;
    photoPath?: string | null;
    territories: Entities.MList<TerritoryEntity>;
}

export module EmployeeOperation {
    export const Save : Entities.ExecuteSymbol<EmployeeEntity> = registerSymbol("Operation", "EmployeeOperation.Save");
}

export module EmployeeQuery {
    export const EmployeesByTerritory = new QueryKey("EmployeeQuery", "EmployeesByTerritory");
}

export const OrderDetailEmbedded = new Type<OrderDetailEmbedded>("OrderDetailEmbedded");
export interface OrderDetailEmbedded extends Entities.EmbeddedEntity {
    Type: "OrderDetailEmbedded";
    product?: Entities.Lite<ProductEntity> | null;
    unitPrice?: number;
    quantity?: number;
    discount?: number;
}

export const OrderEntity = new Type<OrderEntity>("Order");
export interface OrderEntity extends Entities.Entity {
    Type: "Order";
    customer?: CustomerEntity | null;
    employee?: Entities.Lite<EmployeeEntity> | null;
    orderDate?: string;
    requiredDate?: string;
    shippedDate?: string | null;
    cancelationDate?: string | null;
    shipVia?: Entities.Lite<ShipperEntity> | null;
    shipName?: string | null;
    shipAddress?: AddressEmbedded | null;
    freight?: number;
    details: Entities.MList<OrderDetailEmbedded>;
    isLegacy?: boolean;
    state?: OrderState;
}

export const OrderFilterModel = new Type<OrderFilterModel>("OrderFilterModel");
export interface OrderFilterModel extends Entities.ModelEntity {
    Type: "OrderFilterModel";
    customer?: Entities.Lite<CustomerEntity> | null;
    employee?: Entities.Lite<EmployeeEntity> | null;
    minOrderDate?: string | null;
    maxOrderDate?: string | null;
}

export module OrderMessage {
    export const DiscountShouldBeMultpleOf5 = new MessageKey("OrderMessage", "DiscountShouldBeMultpleOf5");
    export const CancelShippedOrder0 = new MessageKey("OrderMessage", "CancelShippedOrder0");
    export const SelectAShipper = new MessageKey("OrderMessage", "SelectAShipper");
}

export module OrderOperation {
    export const Create : Entities.ConstructSymbol_Simple<OrderEntity> = registerSymbol("Operation", "OrderOperation.Create");
    export const SaveNew : Entities.ExecuteSymbol<OrderEntity> = registerSymbol("Operation", "OrderOperation.SaveNew");
    export const Save : Entities.ExecuteSymbol<OrderEntity> = registerSymbol("Operation", "OrderOperation.Save");
    export const Ship : Entities.ExecuteSymbol<OrderEntity> = registerSymbol("Operation", "OrderOperation.Ship");
    export const Cancel : Entities.ExecuteSymbol<OrderEntity> = registerSymbol("Operation", "OrderOperation.Cancel");
    export const CreateOrderFromCustomer : Entities.ConstructSymbol_From<OrderEntity, CustomerEntity> = registerSymbol("Operation", "OrderOperation.CreateOrderFromCustomer");
    export const CreateOrderFromProducts : Entities.ConstructSymbol_FromMany<OrderEntity, ProductEntity> = registerSymbol("Operation", "OrderOperation.CreateOrderFromProducts");
    export const Delete : Entities.DeleteSymbol<OrderEntity> = registerSymbol("Operation", "OrderOperation.Delete");
    export const CancelWithProcess : Entities.ConstructSymbol_FromMany<Processes.ProcessEntity, OrderEntity> = registerSymbol("Operation", "OrderOperation.CancelWithProcess");
}

export module OrderProcess {
    export const CancelOrders : Processes.ProcessAlgorithmSymbol = registerSymbol("ProcessAlgorithm", "OrderProcess.CancelOrders");
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
    export const CancelOldOrdersWithProcess : Scheduler.SimpleTaskSymbol = registerSymbol("SimpleTask", "OrderTask.CancelOldOrdersWithProcess");
    export const CancelOldOrders : Scheduler.SimpleTaskSymbol = registerSymbol("SimpleTask", "OrderTask.CancelOldOrders");
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
    supplier?: Entities.Lite<SupplierEntity> | null;
    category?: Entities.Lite<CategoryEntity> | null;
    quantityPerUnit?: string | null;
    unitPrice?: number;
    unitsInStock?: number;
    reorderLevel?: number;
    discontinued?: boolean;
}

export module ProductOperation {
    export const Save : Entities.ExecuteSymbol<ProductEntity> = registerSymbol("Operation", "ProductOperation.Save");
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
    export const Save : Entities.ExecuteSymbol<RegionEntity> = registerSymbol("Operation", "RegionOperation.Save");
}

export const ShipperEntity = new Type<ShipperEntity>("Shipper");
export interface ShipperEntity extends Entities.Entity {
    Type: "Shipper";
    companyName?: string | null;
    phone?: string | null;
}

export module ShipperOperation {
    export const Save : Entities.ExecuteSymbol<ShipperEntity> = registerSymbol("Operation", "ShipperOperation.Save");
}

export module SouthwindGroup {
    export const UserEntities : Basics.TypeConditionSymbol = registerSymbol("TypeCondition", "SouthwindGroup.UserEntities");
    export const RoleEntities : Basics.TypeConditionSymbol = registerSymbol("TypeCondition", "SouthwindGroup.RoleEntities");
    export const CurrentCustomer : Basics.TypeConditionSymbol = registerSymbol("TypeCondition", "SouthwindGroup.CurrentCustomer");
}

export const SupplierEntity = new Type<SupplierEntity>("Supplier");
export interface SupplierEntity extends Entities.Entity {
    Type: "Supplier";
    companyName?: string | null;
    contactName?: string | null;
    contactTitle?: string | null;
    address?: AddressEmbedded | null;
    phone?: string | null;
    fax?: string | null;
    homePage?: string | null;
}

export module SupplierOperation {
    export const Save : Entities.ExecuteSymbol<SupplierEntity> = registerSymbol("Operation", "SupplierOperation.Save");
}

export const TerritoryEntity = new Type<TerritoryEntity>("Territory");
export interface TerritoryEntity extends Entities.Entity {
    Type: "Territory";
    region?: RegionEntity | null;
    description?: string | null;
}

export module TerritoryOperation {
    export const Save : Entities.ExecuteSymbol<TerritoryEntity> = registerSymbol("Operation", "TerritoryOperation.Save");
}

export const UserEmployeeMixin = new Type<UserEmployeeMixin>("UserEmployeeMixin");
export interface UserEmployeeMixin extends Entities.MixinEntity {
    Type: "UserEmployeeMixin";
    allowLogin?: AllowLogin;
    employee?: Entities.Lite<EmployeeEntity> | null;
}


