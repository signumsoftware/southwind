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

    function attachProductLine(el, fo) {
        el.entityChanged = function () {
            el.getOrRequestEntityHtml().then(function (e) {
                var root = el.prefix.parent("Product");

                root.child("UnitPrice").get().val(e.getChild("UnitPrice").val() || e.getChild("UnitPrice").text());
                root.child("Quantity").get().val("1");
                root.child("Quantity").get().trigger("change");
            });
        };
    }
    exports.attachProductLine = attachProductLine;

    function attachDetails(el, comma) {
        el.element.on("change", "div.recalculate input", function (e) {
            reCalculate(el, comma);
        });

        el.entityChanged = function () {
            return reCalculate(el, comma);
        };
    }
    exports.attachDetails = attachDetails;

    function reCalculate(ed, comma) {
        var total = 0;
        ed.element.find(".sf-repeater-element").each(function (i, e) {
            var prefix = e.id.parent("sfRepeaterItem");

            var unitPrice = parseFloatLoc(prefix.child("UnitPrice").get().val(), comma);
            var quantity = parseFloatLoc(prefix.child("Quantity").get().val(), comma);
            var discount = parseFloatLoc(prefix.child("Discount").get().val().replace("%", ""), comma);

            var subTotalPrice = unitPrice * quantity * (1 - discount / 100);

            if (!isNaN(subTotalPrice))
                prefix.child("SubTotalPrice").get().text(toStringLoc(subTotalPrice, comma));

            total += subTotalPrice;
        });

        ed.prefix.parent().child("TotalPrice").get().text(toStringLoc(total, comma));
    }

    function parseFloatLoc(str, comma) {
        return parseFloat(str.replace(comma, "."));
    }

    function toStringLoc(val, comma) {
        return Number(val).toFixed(2).replace(".", comma);
    }

    function updateStockValue(prefix) {
        var sum = parseFloat(prefix.child("UnitPrice").get().val()) * parseFloat(prefix.child("UnitsInStock").get().val());

        prefix.child("ValueInStock").get().html(sum.toString());
    }
    exports.updateStockValue = updateStockValue;
});
//# sourceMappingURL=Order.js.map
