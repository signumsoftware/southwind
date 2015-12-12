define(["require", "exports", 'Framework/Signum.React/Scripts/Reflection'], function (require, exports, Reflection_1) {
    exports.AddressEntity_Type = new Reflection_1.Type("AddressEntity");
    (function (AllowLogin) {
        AllowLogin[AllowLogin["WindowsAndWeb"] = 0] = "WindowsAndWeb";
        AllowLogin[AllowLogin["WindowsOnly"] = 1] = "WindowsOnly";
        AllowLogin[AllowLogin["WebOnly"] = 2] = "WebOnly";
    })(exports.AllowLogin || (exports.AllowLogin = {}));
    var AllowLogin = exports.AllowLogin;
    exports.AllowLogin_Type = new Reflection_1.EnumType("AllowLogin", AllowLogin);
    exports.ApplicationConfigurationEntity_Type = new Reflection_1.Type("ApplicationConfigurationEntity");
    var ApplicationConfigurationOperation;
    (function (ApplicationConfigurationOperation) {
        ApplicationConfigurationOperation.Save = Reflection_1.registerSymbol({ key: "ApplicationConfigurationOperation.Save" });
    })(ApplicationConfigurationOperation = exports.ApplicationConfigurationOperation || (exports.ApplicationConfigurationOperation = {}));
    exports.CategoryEntity_Type = new Reflection_1.Type("CategoryEntity");
    var CategoryOperation;
    (function (CategoryOperation) {
        CategoryOperation.Save = Reflection_1.registerSymbol({ key: "CategoryOperation.Save" });
    })(CategoryOperation = exports.CategoryOperation || (exports.CategoryOperation = {}));
    exports.CompanyEntity_Type = new Reflection_1.Type("CompanyEntity");
    var CustomerOperation;
    (function (CustomerOperation) {
        CustomerOperation.Save = Reflection_1.registerSymbol({ key: "CustomerOperation.Save" });
    })(CustomerOperation = exports.CustomerOperation || (exports.CustomerOperation = {}));
    exports.EmployeeEntity_Type = new Reflection_1.Type("EmployeeEntity");
    var EmployeeOperation;
    (function (EmployeeOperation) {
        EmployeeOperation.Save = Reflection_1.registerSymbol({ key: "EmployeeOperation.Save" });
    })(EmployeeOperation = exports.EmployeeOperation || (exports.EmployeeOperation = {}));
    var EmployeeQuery;
    (function (EmployeeQuery) {
        EmployeeQuery.EmployeesByTerritory = new Reflection_1.MessageKey("EmployeeQuery", "EmployeesByTerritory");
    })(EmployeeQuery = exports.EmployeeQuery || (exports.EmployeeQuery = {}));
    exports.OrderDetailsEntity_Type = new Reflection_1.Type("OrderDetailsEntity");
    exports.OrderEntity_Type = new Reflection_1.Type("OrderEntity");
    exports.OrderFilterModel_Type = new Reflection_1.Type("OrderFilterModel");
    var OrderMessage;
    (function (OrderMessage) {
        OrderMessage.DiscountShouldBeMultpleOf5 = new Reflection_1.MessageKey("OrderMessage", "DiscountShouldBeMultpleOf5");
        OrderMessage.CancelShippedOrder0 = new Reflection_1.MessageKey("OrderMessage", "CancelShippedOrder0");
        OrderMessage.SelectAShipper = new Reflection_1.MessageKey("OrderMessage", "SelectAShipper");
    })(OrderMessage = exports.OrderMessage || (exports.OrderMessage = {}));
    var OrderOperation;
    (function (OrderOperation) {
        OrderOperation.Create = Reflection_1.registerSymbol({ key: "OrderOperation.Create" });
        OrderOperation.SaveNew = Reflection_1.registerSymbol({ key: "OrderOperation.SaveNew" });
        OrderOperation.Save = Reflection_1.registerSymbol({ key: "OrderOperation.Save" });
        OrderOperation.Ship = Reflection_1.registerSymbol({ key: "OrderOperation.Ship" });
        OrderOperation.Cancel = Reflection_1.registerSymbol({ key: "OrderOperation.Cancel" });
        OrderOperation.CreateOrderFromCustomer = Reflection_1.registerSymbol({ key: "OrderOperation.CreateOrderFromCustomer" });
        OrderOperation.CreateOrderFromProducts = Reflection_1.registerSymbol({ key: "OrderOperation.CreateOrderFromProducts" });
        OrderOperation.Delete = Reflection_1.registerSymbol({ key: "OrderOperation.Delete" });
        OrderOperation.CancelWithProcess = Reflection_1.registerSymbol({ key: "OrderOperation.CancelWithProcess" });
    })(OrderOperation = exports.OrderOperation || (exports.OrderOperation = {}));
    var OrderProcess;
    (function (OrderProcess) {
        OrderProcess.CancelOrders = Reflection_1.registerSymbol({ key: "OrderProcess.CancelOrders" });
    })(OrderProcess = exports.OrderProcess || (exports.OrderProcess = {}));
    var OrderQuery;
    (function (OrderQuery) {
        OrderQuery.OrderLines = new Reflection_1.MessageKey("OrderQuery", "OrderLines");
        OrderQuery.OrderSimple = new Reflection_1.MessageKey("OrderQuery", "OrderSimple");
    })(OrderQuery = exports.OrderQuery || (exports.OrderQuery = {}));
    (function (OrderState) {
        OrderState[OrderState["New"] = 0] = "New";
        OrderState[OrderState["Ordered"] = 1] = "Ordered";
        OrderState[OrderState["Shipped"] = 2] = "Shipped";
        OrderState[OrderState["Canceled"] = 3] = "Canceled";
    })(exports.OrderState || (exports.OrderState = {}));
    var OrderState = exports.OrderState;
    exports.OrderState_Type = new Reflection_1.EnumType("OrderState", OrderState);
    var OrderTask;
    (function (OrderTask) {
        OrderTask.CancelOldOrdersWithProcess = Reflection_1.registerSymbol({ key: "OrderTask.CancelOldOrdersWithProcess" });
        OrderTask.CancelOldOrders = Reflection_1.registerSymbol({ key: "OrderTask.CancelOldOrders" });
    })(OrderTask = exports.OrderTask || (exports.OrderTask = {}));
    exports.PersonEntity_Type = new Reflection_1.Type("PersonEntity");
    exports.ProductEntity_Type = new Reflection_1.Type("ProductEntity");
    var ProductOperation;
    (function (ProductOperation) {
        ProductOperation.Save = Reflection_1.registerSymbol({ key: "ProductOperation.Save" });
    })(ProductOperation = exports.ProductOperation || (exports.ProductOperation = {}));
    var ProductQuery;
    (function (ProductQuery) {
        ProductQuery.CurrentProducts = new Reflection_1.MessageKey("ProductQuery", "CurrentProducts");
    })(ProductQuery = exports.ProductQuery || (exports.ProductQuery = {}));
    exports.RegionEntity_Type = new Reflection_1.Type("RegionEntity");
    var RegionOperation;
    (function (RegionOperation) {
        RegionOperation.Save = Reflection_1.registerSymbol({ key: "RegionOperation.Save" });
    })(RegionOperation = exports.RegionOperation || (exports.RegionOperation = {}));
    exports.ShipperEntity_Type = new Reflection_1.Type("ShipperEntity");
    var ShipperOperation;
    (function (ShipperOperation) {
        ShipperOperation.Save = Reflection_1.registerSymbol({ key: "ShipperOperation.Save" });
    })(ShipperOperation = exports.ShipperOperation || (exports.ShipperOperation = {}));
    var SouthwindGroup;
    (function (SouthwindGroup) {
        SouthwindGroup.UserEntities = Reflection_1.registerSymbol({ key: "SouthwindGroup.UserEntities" });
        SouthwindGroup.RoleEntities = Reflection_1.registerSymbol({ key: "SouthwindGroup.RoleEntities" });
        SouthwindGroup.CurrentCustomer = Reflection_1.registerSymbol({ key: "SouthwindGroup.CurrentCustomer" });
    })(SouthwindGroup = exports.SouthwindGroup || (exports.SouthwindGroup = {}));
    exports.SupplierEntity_Type = new Reflection_1.Type("SupplierEntity");
    var SupplierOperation;
    (function (SupplierOperation) {
        SupplierOperation.Save = Reflection_1.registerSymbol({ key: "SupplierOperation.Save" });
    })(SupplierOperation = exports.SupplierOperation || (exports.SupplierOperation = {}));
    exports.TerritoryEntity_Type = new Reflection_1.Type("TerritoryEntity");
    var TerritoryOperation;
    (function (TerritoryOperation) {
        TerritoryOperation.Save = Reflection_1.registerSymbol({ key: "TerritoryOperation.Save" });
    })(TerritoryOperation = exports.TerritoryOperation || (exports.TerritoryOperation = {}));
    exports.UserEmployeeMixin_Type = new Reflection_1.Type("UserEmployeeMixin");
});
//# sourceMappingURL=Southwind.Entities.js.map