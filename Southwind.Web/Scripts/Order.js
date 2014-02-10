/// <reference path="../../framework/signum.web/signum/scripts/globals.ts"/>
define(["require", "exports", "Framework/Signum.Web/Signum/Scripts/Finder"], function(require, exports, Finder) {
    function attachCustomerEntityLine(el, fo) {
        el.finding = function (prefix) {
            return Finder.find(fo);
        };
    }
    exports.attachCustomerEntityLine = attachCustomerEntityLine;
});
//# sourceMappingURL=Order.js.map
