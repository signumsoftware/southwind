/// <reference path="../../framework/signum.web/signum/scripts/globals.ts"/>
define(["require", "exports", "Framework/Signum.Web/Signum/Scripts/Finder"], function(require, exports, Finder) {
    function attachCustomerEntityLine(el, fo) {
        el.finding = function (prefix) {
            return Finder.find(fo);
        };
    }
    exports.attachCustomerEntityLine = attachCustomerEntityLine;

    function updateStockValue(prefix) {
        var sum = parseFloat(prefix.child("UnitPrice").get().val()) * parseFloat(prefix.child("UnitsInStock").get().val());

        prefix.child("ValueInStock_sfStaticValue").get().html(sum.toString());
    }
    exports.updateStockValue = updateStockValue;
});
//# sourceMappingURL=Order.js.map
