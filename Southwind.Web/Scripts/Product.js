/// <reference path="../../framework/signum.web/signum/scripts/globals.ts"/>
define(["require", "exports"], function(require, exports) {
    function updateStockValue(prefix) {
        var sum = parseFloat(prefix.child("UnitPrice").get().val()) * parseFloat(prefix.child("UnitsInStock").get().val());

        prefix.child("ValueInStock").get().html(sum.toString());
    }
    exports.updateStockValue = updateStockValue;
});
//# sourceMappingURL=Product.js.map
