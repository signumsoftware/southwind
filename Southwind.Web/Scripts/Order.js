/// <reference path="../../framework/signum.web/signum/scripts/globals.ts"/>
define(["require", "exports", "Framework/Signum.Web/Signum/Scripts/Navigator", "Framework/Signum.Web/Signum/Scripts/Finder", "Framework/Signum.Web/Signum/Scripts/Operations"], function(require, exports, Navigator, Finder, Operations) {
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

    function shipOrder(options, url, valueLineOptions, contextual) {
        return Navigator.valueLineBox(valueLineOptions).then(function (shipDate) {
            if (!shipDate)
                return null;

            options.requestExtraJsonData = { shipDate: shipDate };

            options.controllerUrl = url;

            if (contextual)
                return Operations.executeDefaultContextual(options);
            else
                return Operations.executeDefault(options);
        });
    }
    exports.shipOrder = shipOrder;

    function createOrderFromProducts(options, findOptions, url, openNewWindowOrEvent) {
        options.controllerUrl = url;

        return Finder.find(findOptions).then(function (cust) {
            if (cust)
                options.requestExtraJsonData = { customer: cust.key() };

            return Operations.constructFromManyDefault(options, openNewWindowOrEvent);
        });
    }
    exports.createOrderFromProducts = createOrderFromProducts;

    function createOrder(extraJsonArgs, findOptions) {
        return Finder.find(findOptions).then(function (cust) {
            if (cust)
                extraJsonArgs = $.extend(extraJsonArgs, { customer: cust.key() });

            return extraJsonArgs;
        });
    }
    exports.createOrder = createOrder;
});
//# sourceMappingURL=Order.js.map
