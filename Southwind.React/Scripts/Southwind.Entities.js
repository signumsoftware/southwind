//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////
var Reflection_1 = require('../../Framework/Signum.React/Scripts/Reflection');
exports.AddressEntity_Type = new Reflection_1.Type("Address");
(function (AllowLogin) {
    AllowLogin[AllowLogin["WindowsAndWeb"] = "WindowsAndWeb"] = "WindowsAndWeb";
    AllowLogin[AllowLogin["WindowsOnly"] = "WindowsOnly"] = "WindowsOnly";
    AllowLogin[AllowLogin["WebOnly"] = "WebOnly"] = "WebOnly";
})(exports.AllowLogin || (exports.AllowLogin = {}));
var AllowLogin = exports.AllowLogin;
exports.AllowLogin_Type = new Reflection_1.EnumType("AllowLogin", AllowLogin);
exports.ApplicationConfigurationEntity_Type = new Reflection_1.Type("ApplicationConfiguration");
var ApplicationConfigurationOperation;
(function (ApplicationConfigurationOperation) {
    ApplicationConfigurationOperation.Save = Reflection_1.registerSymbol({ Type: "Operation", key: "ApplicationConfigurationOperation.Save" });
})(ApplicationConfigurationOperation = exports.ApplicationConfigurationOperation || (exports.ApplicationConfigurationOperation = {}));
exports.CategoryEntity_Type = new Reflection_1.Type("Category");
var CategoryOperation;
(function (CategoryOperation) {
    CategoryOperation.Save = Reflection_1.registerSymbol({ Type: "Operation", key: "CategoryOperation.Save" });
})(CategoryOperation = exports.CategoryOperation || (exports.CategoryOperation = {}));
exports.CompanyEntity_Type = new Reflection_1.Type("Company");
var CustomerOperation;
(function (CustomerOperation) {
    CustomerOperation.Save = Reflection_1.registerSymbol({ Type: "Operation", key: "CustomerOperation.Save" });
})(CustomerOperation = exports.CustomerOperation || (exports.CustomerOperation = {}));
exports.EmployeeEntity_Type = new Reflection_1.Type("Employee");
var EmployeeOperation;
(function (EmployeeOperation) {
    EmployeeOperation.Save = Reflection_1.registerSymbol({ Type: "Operation", key: "EmployeeOperation.Save" });
})(EmployeeOperation = exports.EmployeeOperation || (exports.EmployeeOperation = {}));
var EmployeeQuery;
(function (EmployeeQuery) {
    EmployeeQuery.EmployeesByTerritory = new Reflection_1.MessageKey("EmployeeQuery", "EmployeesByTerritory");
})(EmployeeQuery = exports.EmployeeQuery || (exports.EmployeeQuery = {}));
exports.OrderDetailsEntity_Type = new Reflection_1.Type("OrderDetails");
exports.OrderEntity_Type = new Reflection_1.Type("Order");
exports.OrderFilterModel_Type = new Reflection_1.Type("OrderFilter");
var OrderMessage;
(function (OrderMessage) {
    OrderMessage.DiscountShouldBeMultpleOf5 = new Reflection_1.MessageKey("OrderMessage", "DiscountShouldBeMultpleOf5");
    OrderMessage.CancelShippedOrder0 = new Reflection_1.MessageKey("OrderMessage", "CancelShippedOrder0");
    OrderMessage.SelectAShipper = new Reflection_1.MessageKey("OrderMessage", "SelectAShipper");
})(OrderMessage = exports.OrderMessage || (exports.OrderMessage = {}));
var OrderOperation;
(function (OrderOperation) {
    OrderOperation.Create = Reflection_1.registerSymbol({ Type: "Operation", key: "OrderOperation.Create" });
    OrderOperation.SaveNew = Reflection_1.registerSymbol({ Type: "Operation", key: "OrderOperation.SaveNew" });
    OrderOperation.Save = Reflection_1.registerSymbol({ Type: "Operation", key: "OrderOperation.Save" });
    OrderOperation.Ship = Reflection_1.registerSymbol({ Type: "Operation", key: "OrderOperation.Ship" });
    OrderOperation.Cancel = Reflection_1.registerSymbol({ Type: "Operation", key: "OrderOperation.Cancel" });
    OrderOperation.CreateOrderFromCustomer = Reflection_1.registerSymbol({ Type: "Operation", key: "OrderOperation.CreateOrderFromCustomer" });
    OrderOperation.CreateOrderFromProducts = Reflection_1.registerSymbol({ Type: "Operation", key: "OrderOperation.CreateOrderFromProducts" });
    OrderOperation.Delete = Reflection_1.registerSymbol({ Type: "Operation", key: "OrderOperation.Delete" });
    OrderOperation.CancelWithProcess = Reflection_1.registerSymbol({ Type: "Operation", key: "OrderOperation.CancelWithProcess" });
})(OrderOperation = exports.OrderOperation || (exports.OrderOperation = {}));
var OrderProcess;
(function (OrderProcess) {
    OrderProcess.CancelOrders = Reflection_1.registerSymbol({ Type: "ProcessAlgorithm", key: "OrderProcess.CancelOrders" });
})(OrderProcess = exports.OrderProcess || (exports.OrderProcess = {}));
var OrderQuery;
(function (OrderQuery) {
    OrderQuery.OrderLines = new Reflection_1.MessageKey("OrderQuery", "OrderLines");
    OrderQuery.OrderSimple = new Reflection_1.MessageKey("OrderQuery", "OrderSimple");
})(OrderQuery = exports.OrderQuery || (exports.OrderQuery = {}));
(function (OrderState) {
    OrderState[OrderState["New"] = "New"] = "New";
    OrderState[OrderState["Ordered"] = "Ordered"] = "Ordered";
    OrderState[OrderState["Shipped"] = "Shipped"] = "Shipped";
    OrderState[OrderState["Canceled"] = "Canceled"] = "Canceled";
})(exports.OrderState || (exports.OrderState = {}));
var OrderState = exports.OrderState;
exports.OrderState_Type = new Reflection_1.EnumType("OrderState", OrderState);
var OrderTask;
(function (OrderTask) {
    OrderTask.CancelOldOrdersWithProcess = Reflection_1.registerSymbol({ Type: "SimpleTask", key: "OrderTask.CancelOldOrdersWithProcess" });
    OrderTask.CancelOldOrders = Reflection_1.registerSymbol({ Type: "SimpleTask", key: "OrderTask.CancelOldOrders" });
})(OrderTask = exports.OrderTask || (exports.OrderTask = {}));
exports.PersonEntity_Type = new Reflection_1.Type("Person");
exports.ProductEntity_Type = new Reflection_1.Type("Product");
var ProductOperation;
(function (ProductOperation) {
    ProductOperation.Save = Reflection_1.registerSymbol({ Type: "Operation", key: "ProductOperation.Save" });
})(ProductOperation = exports.ProductOperation || (exports.ProductOperation = {}));
var ProductQuery;
(function (ProductQuery) {
    ProductQuery.CurrentProducts = new Reflection_1.MessageKey("ProductQuery", "CurrentProducts");
})(ProductQuery = exports.ProductQuery || (exports.ProductQuery = {}));
exports.RegionEntity_Type = new Reflection_1.Type("Region");
var RegionOperation;
(function (RegionOperation) {
    RegionOperation.Save = Reflection_1.registerSymbol({ Type: "Operation", key: "RegionOperation.Save" });
})(RegionOperation = exports.RegionOperation || (exports.RegionOperation = {}));
exports.ShipperEntity_Type = new Reflection_1.Type("Shipper");
var ShipperOperation;
(function (ShipperOperation) {
    ShipperOperation.Save = Reflection_1.registerSymbol({ Type: "Operation", key: "ShipperOperation.Save" });
})(ShipperOperation = exports.ShipperOperation || (exports.ShipperOperation = {}));
var SouthwindGroup;
(function (SouthwindGroup) {
    SouthwindGroup.UserEntities = Reflection_1.registerSymbol({ Type: "TypeCondition", key: "SouthwindGroup.UserEntities" });
    SouthwindGroup.RoleEntities = Reflection_1.registerSymbol({ Type: "TypeCondition", key: "SouthwindGroup.RoleEntities" });
    SouthwindGroup.CurrentCustomer = Reflection_1.registerSymbol({ Type: "TypeCondition", key: "SouthwindGroup.CurrentCustomer" });
})(SouthwindGroup = exports.SouthwindGroup || (exports.SouthwindGroup = {}));
exports.SupplierEntity_Type = new Reflection_1.Type("Supplier");
var SupplierOperation;
(function (SupplierOperation) {
    SupplierOperation.Save = Reflection_1.registerSymbol({ Type: "Operation", key: "SupplierOperation.Save" });
})(SupplierOperation = exports.SupplierOperation || (exports.SupplierOperation = {}));
exports.TerritoryEntity_Type = new Reflection_1.Type("Territory");
var TerritoryOperation;
(function (TerritoryOperation) {
    TerritoryOperation.Save = Reflection_1.registerSymbol({ Type: "Operation", key: "TerritoryOperation.Save" });
})(TerritoryOperation = exports.TerritoryOperation || (exports.TerritoryOperation = {}));
exports.UserEmployeeMixin_Type = new Reflection_1.Type("UserEmployeeMixin");
//# sourceMappingURL=Southwind.Entities.js.map