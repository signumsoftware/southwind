/// <reference path="../../framework/signum.web/signum/scripts/globals.ts"/>
define(["require", "exports", "Framework/Signum.Web/Signum/Scripts/Entities", "Framework/Signum.Web/Signum/Scripts/Navigator"], function(require, exports, Entities, Navigator) {
    function updateStockValue(prefix) {
        var sum = parseFloat(prefix.child("UnitPrice").get().val()) * parseFloat(prefix.child("UnitsInStock").get().val());

        prefix.child("ValueInStock").get().html(sum.toString());
    }
    exports.updateStockValue = updateStockValue;

    function attachCategory(ec) {
        ec.creating = function (prefix) {
            var newEntity = new Entities.EntityHtml(prefix, new Entities.RuntimeInfo(ec.singleType(), null, true), lang.signum.newEntity);

            var productName = ec.prefix.parent().child("ProductName").get().val();

            var options = ec.defaultViewOptions(null);

            options.onPopupLoaded = function (div) {
                return prefix.child("CategoryName").get(div).val(productName);
            };

            return Navigator.viewPopup(newEntity, options);
        };
    }
    exports.attachCategory = attachCategory;
});
//# sourceMappingURL=Product.js.map
