/// <reference path="../../framework/signum.web/signum/scripts/globals.ts"/>
define(["require", "exports", "Framework/Signum.Web/Signum/Scripts/Finder"], function(require, exports, Finder) {
    function attachCustomerEntityLine(el, fo) {
        el.finding = function (prefix) {
            return Finder.find(fo);
        };

        el.entityChanged = function () {
            el.getOrRequestEntityHtml().then(function (e) {
                var shipAddress = el.prefix.parent("Customer").child("ShipAddress");

                var copy = function (part) {
                    return shipAddress.child(part).get().val(e == null ? "" : e.getChild("Address_" + part).val());
                };

                copy("Address");
                copy("City");
                copy("Region");
                copy("PostalCode");
                copy("Country");
            });
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
