//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////
import * as Entities from 'Framework/Signum.React/Scripts/Signum.Entities' 

import * as Extensions from 'Extensions/Signum.React.Extensions/Signum.Entities.Extensions' 
export const AddressEntity: Entities.Type<AddressEntity> = "AddressEntity";
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

export const ApplicationConfigurationEntity: Entities.Type<ApplicationConfigurationEntity> = "ApplicationConfigurationEntity";
export interface ApplicationConfigurationEntity extends Entities.Entity {
    environment?: string;
    email?: Extensions.Mailing.EmailConfigurationEntity;
    smtpConfiguration?: Extensions.Mailing.SmtpConfigurationEntity;
    sms?: Extensions.SMS.SMSConfigurationEntity;
}

export module ApplicationConfigurationOperation {
    export const Save : Entities.ExecuteSymbol<ApplicationConfigurationEntity> = { key: "ApplicationConfigurationOperation.Save" };
}

export const CategoryEntity: Entities.Type<CategoryEntity> = "CategoryEntity";
export interface CategoryEntity extends Entities.Entity {
    categoryName?: string;
    description?: string;
    picture?: Extensions.Files.EmbeddedFileEntity;
}

export module CategoryOperation {
    export const Save : Entities.ExecuteSymbol<CategoryEntity> = { key: "CategoryOperation.Save" };
}

export const CompanyEntity: Entities.Type<CompanyEntity> = "CompanyEntity";
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
    export const Save : Entities.ExecuteSymbol<CustomerEntity> = { key: "CustomerOperation.Save" };
}

export const EmployeeEntity: Entities.Type<EmployeeEntity> = "EmployeeEntity";
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
    photo?: Entities.Lite<Extensions.Files.FileEntity>;
    notes?: string;
    reportsTo?: Entities.Lite<EmployeeEntity>;
    photoPath?: string;
    territories?: Entities.MList<TerritoryEntity>;
}

export module EmployeeOperation {
    export const Save : Entities.ExecuteSymbol<EmployeeEntity> = { key: "EmployeeOperation.Save" };
}

export const OrderDetailsEntity: Entities.Type<OrderDetailsEntity> = "OrderDetailsEntity";
export interface OrderDetailsEntity extends Entities.EmbeddedEntity {
    product?: Entities.Lite<ProductEntity>;
    unitPrice?: number;
    quantity?: number;
    discount?: number;
}

export const OrderEntity: Entities.Type<OrderEntity> = "OrderEntity";
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

export const OrderFilterModel: Entities.Type<OrderFilterModel> = "OrderFilterModel";
export interface OrderFilterModel extends Entities.ModelEntity {
    customer?: Entities.Lite<CustomerEntity>;
    employee?: Entities.Lite<EmployeeEntity>;
    minOrderDate?: string;
    maxOrderDate?: string;
}

export module OrderMessage {
    export const DiscountShouldBeMultpleOf5 = "OrderMessage.DiscountShouldBeMultpleOf5"
    export const CancelShippedOrder0 = "OrderMessage.CancelShippedOrder0"
    export const SelectAShipper = "OrderMessage.SelectAShipper"
}

export module OrderOperation {
    export const Create : Entities.ConstructSymbol_Simple<OrderEntity> = { key: "OrderOperation.Create" };
    export const SaveNew : Entities.ExecuteSymbol<OrderEntity> = { key: "OrderOperation.SaveNew" };
    export const Save : Entities.ExecuteSymbol<OrderEntity> = { key: "OrderOperation.Save" };
    export const Ship : Entities.ExecuteSymbol<OrderEntity> = { key: "OrderOperation.Ship" };
    export const Cancel : Entities.ExecuteSymbol<OrderEntity> = { key: "OrderOperation.Cancel" };
    export const CreateOrderFromCustomer : Entities.ConstructSymbol_From<OrderEntity, CustomerEntity> = { key: "OrderOperation.CreateOrderFromCustomer" };
    export const CreateOrderFromProducts : Entities.ConstructSymbol_FromMany<OrderEntity, ProductEntity> = { key: "OrderOperation.CreateOrderFromProducts" };
    export const Delete : Entities.DeleteSymbol<OrderEntity> = { key: "OrderOperation.Delete" };
    export const CancelWithProcess : Entities.ConstructSymbol_FromMany<Extensions.Processes.ProcessEntity, OrderEntity> = { key: "OrderOperation.CancelWithProcess" };
}

export module OrderProcess {
    export const CancelOrders : Extensions.Processes.ProcessAlgorithmSymbol = { key: "OrderProcess.CancelOrders" };
}

export enum OrderState {
    New,
    Ordered,
    Shipped,
    Canceled,
}

export module OrderTask {
    export const CancelOldOrdersWithProcess : Extensions.Scheduler.SimpleTaskSymbol = { key: "OrderTask.CancelOldOrdersWithProcess" };
    export const CancelOldOrders : Extensions.Scheduler.SimpleTaskSymbol = { key: "OrderTask.CancelOldOrders" };
}

export const PersonEntity: Entities.Type<PersonEntity> = "PersonEntity";
export interface PersonEntity extends CustomerEntity {
    firstName?: string;
    lastName?: string;
    title?: string;
    dateOfBirth?: string;
    corrupt?: boolean;
}

export const ProductEntity: Entities.Type<ProductEntity> = "ProductEntity";
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
    export const Save : Entities.ExecuteSymbol<ProductEntity> = { key: "ProductOperation.Save" };
}

export const RegionEntity: Entities.Type<RegionEntity> = "RegionEntity";
export interface RegionEntity extends Entities.Entity {
    description?: string;
}

export module RegionOperation {
    export const Save : Entities.ExecuteSymbol<RegionEntity> = { key: "RegionOperation.Save" };
}

export const ShipperEntity: Entities.Type<ShipperEntity> = "ShipperEntity";
export interface ShipperEntity extends Entities.Entity {
    companyName?: string;
    phone?: string;
}

export module ShipperOperation {
    export const Save : Entities.ExecuteSymbol<ShipperEntity> = { key: "ShipperOperation.Save" };
}

export module SouthwindGroup {
    export const UserEntities : Extensions.Basics.TypeConditionSymbol = { key: "SouthwindGroup.UserEntities" };
    export const RoleEntities : Extensions.Basics.TypeConditionSymbol = { key: "SouthwindGroup.RoleEntities" };
    export const CurrentCustomer : Extensions.Basics.TypeConditionSymbol = { key: "SouthwindGroup.CurrentCustomer" };
}

export const SupplierEntity: Entities.Type<SupplierEntity> = "SupplierEntity";
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
    export const Save : Entities.ExecuteSymbol<SupplierEntity> = { key: "SupplierOperation.Save" };
}

export const TerritoryEntity: Entities.Type<TerritoryEntity> = "TerritoryEntity";
export interface TerritoryEntity extends Entities.Entity {
    region?: RegionEntity;
    description?: string;
}

export module TerritoryOperation {
    export const Save : Entities.ExecuteSymbol<TerritoryEntity> = { key: "TerritoryOperation.Save" };
}

export const UserEmployeeMixin: Entities.Type<UserEmployeeMixin> = "UserEmployeeMixin";
export interface UserEmployeeMixin extends Entities.MixinEntity {
    allowLogin?: AllowLogin;
    employee?: EmployeeEntity;
}

