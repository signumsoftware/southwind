//Auto-generated from Southwind.Entities.csproj. Do not modify!
define(["require", "exports"], function (require, exports) {
    exports.AddressEntity = "AddressEntity";
    (function (AllowLogin) {
        AllowLogin[AllowLogin["WindowsAndWeb"] = 0] = "WindowsAndWeb";
        AllowLogin[AllowLogin["WindowsOnly"] = 1] = "WindowsOnly";
        AllowLogin[AllowLogin["WebOnly"] = 2] = "WebOnly";
    })(exports.AllowLogin || (exports.AllowLogin = {}));
    var AllowLogin = exports.AllowLogin;
    exports.ApplicationConfigurationEntity = "ApplicationConfigurationEntity";
    var ApplicationConfigurationOperation;
    (function (ApplicationConfigurationOperation) {
        ApplicationConfigurationOperation.Save = { key: "ApplicationConfigurationOperation.Save" };
    })(ApplicationConfigurationOperation = exports.ApplicationConfigurationOperation || (exports.ApplicationConfigurationOperation = {}));
    exports.CategoryEntity = "CategoryEntity";
    var CategoryOperation;
    (function (CategoryOperation) {
        CategoryOperation.Save = { key: "CategoryOperation.Save" };
    })(CategoryOperation = exports.CategoryOperation || (exports.CategoryOperation = {}));
    exports.CompanyEntity = "CompanyEntity";
    var CustomerOperation;
    (function (CustomerOperation) {
        CustomerOperation.Save = { key: "CustomerOperation.Save" };
    })(CustomerOperation = exports.CustomerOperation || (exports.CustomerOperation = {}));
    exports.EmployeeEntity = "EmployeeEntity";
    var EmployeeOperation;
    (function (EmployeeOperation) {
        EmployeeOperation.Save = { key: "EmployeeOperation.Save" };
    })(EmployeeOperation = exports.EmployeeOperation || (exports.EmployeeOperation = {}));
    exports.OrderDetailsEntity = "OrderDetailsEntity";
    exports.OrderEntity = "OrderEntity";
    exports.OrderFilterModel = "OrderFilterModel";
    var OrderMessage;
    (function (OrderMessage) {
        OrderMessage.DiscountShouldBeMultpleOf5 = "OrderMessage.DiscountShouldBeMultpleOf5";
        OrderMessage.CancelShippedOrder0 = "OrderMessage.CancelShippedOrder0";
        OrderMessage.SelectAShipper = "OrderMessage.SelectAShipper";
    })(OrderMessage = exports.OrderMessage || (exports.OrderMessage = {}));
    var OrderOperation;
    (function (OrderOperation) {
        OrderOperation.Create = { key: "OrderOperation.Create" };
        OrderOperation.SaveNew = { key: "OrderOperation.SaveNew" };
        OrderOperation.Save = { key: "OrderOperation.Save" };
        OrderOperation.Ship = { key: "OrderOperation.Ship" };
        OrderOperation.Cancel = { key: "OrderOperation.Cancel" };
        OrderOperation.CreateOrderFromCustomer = { key: "OrderOperation.CreateOrderFromCustomer" };
        OrderOperation.CreateOrderFromProducts = { key: "OrderOperation.CreateOrderFromProducts" };
        OrderOperation.Delete = { key: "OrderOperation.Delete" };
        OrderOperation.CancelWithProcess = { key: "OrderOperation.CancelWithProcess" };
    })(OrderOperation = exports.OrderOperation || (exports.OrderOperation = {}));
    var OrderProcess;
    (function (OrderProcess) {
        OrderProcess.CancelOrders = { key: "OrderProcess.CancelOrders" };
    })(OrderProcess = exports.OrderProcess || (exports.OrderProcess = {}));
    (function (OrderState) {
        OrderState[OrderState["New"] = 0] = "New";
        OrderState[OrderState["Ordered"] = 1] = "Ordered";
        OrderState[OrderState["Shipped"] = 2] = "Shipped";
        OrderState[OrderState["Canceled"] = 3] = "Canceled";
    })(exports.OrderState || (exports.OrderState = {}));
    var OrderState = exports.OrderState;
    var OrderTask;
    (function (OrderTask) {
        OrderTask.CancelOldOrdersWithProcess = { key: "OrderTask.CancelOldOrdersWithProcess" };
        OrderTask.CancelOldOrders = { key: "OrderTask.CancelOldOrders" };
    })(OrderTask = exports.OrderTask || (exports.OrderTask = {}));
    exports.PersonEntity = "PersonEntity";
    exports.ProductEntity = "ProductEntity";
    var ProductOperation;
    (function (ProductOperation) {
        ProductOperation.Save = { key: "ProductOperation.Save" };
    })(ProductOperation = exports.ProductOperation || (exports.ProductOperation = {}));
    exports.RegionEntity = "RegionEntity";
    var RegionOperation;
    (function (RegionOperation) {
        RegionOperation.Save = { key: "RegionOperation.Save" };
    })(RegionOperation = exports.RegionOperation || (exports.RegionOperation = {}));
    exports.ShipperEntity = "ShipperEntity";
    var ShipperOperation;
    (function (ShipperOperation) {
        ShipperOperation.Save = { key: "ShipperOperation.Save" };
    })(ShipperOperation = exports.ShipperOperation || (exports.ShipperOperation = {}));
    var SouthwindGroup;
    (function (SouthwindGroup) {
        SouthwindGroup.UserEntities = { key: "SouthwindGroup.UserEntities" };
        SouthwindGroup.RoleEntities = { key: "SouthwindGroup.RoleEntities" };
        SouthwindGroup.CurrentCustomer = { key: "SouthwindGroup.CurrentCustomer" };
    })(SouthwindGroup = exports.SouthwindGroup || (exports.SouthwindGroup = {}));
    exports.SupplierEntity = "SupplierEntity";
    var SupplierOperation;
    (function (SupplierOperation) {
        SupplierOperation.Save = { key: "SupplierOperation.Save" };
    })(SupplierOperation = exports.SupplierOperation || (exports.SupplierOperation = {}));
    exports.TerritoryEntity = "TerritoryEntity";
    var TerritoryOperation;
    (function (TerritoryOperation) {
        TerritoryOperation.Save = { key: "TerritoryOperation.Save" };
    })(TerritoryOperation = exports.TerritoryOperation || (exports.TerritoryOperation = {}));
    exports.UserEmployeeMixin = "UserEmployeeMixin";
});
//# sourceMappingURL=Southwind.Entities.js.map