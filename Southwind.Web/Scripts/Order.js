/// <reference path="../../framework/signum.web/signum/scripts/globals.ts"/>
define(["require", "exports", "Framework/Signum.Web/Signum/Scripts/Finder"], function(require, exports, Finder) {
    function attachCustomerEntityLine(el, fo) {
        el.finding = function (prefix) {
            return Finder.find(fo);
        };
    }
    exports.attachCustomerEntityLine = attachCustomerEntityLine;

    function updateStockValue(prefix) {
        var sum = parseFloat($("#" + SF.compose(prefix, "UnitPrice")).val()) * parseFloat($("#" + SF.compose(prefix, "UnitsInStock")).val());
        $("#" + SF.compose(prefix, "StockValue")).html(sum.toString());
    }
    exports.updateStockValue = updateStockValue;
});
//# sourceMappingURL=Order.js.map
