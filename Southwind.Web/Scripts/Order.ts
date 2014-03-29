/// <reference path="../../framework/signum.web/signum/scripts/globals.ts"/>

import Entities = require("Framework/Signum.Web/Signum/Scripts/Entities")
import Navigator = require("Framework/Signum.Web/Signum/Scripts/Navigator")
import Finder = require("Framework/Signum.Web/Signum/Scripts/Finder")
import Lines = require("Framework/Signum.Web/Signum/Scripts/Lines")


export function attachCustomerEntityLine(el: Lines.EntityLine, fo: Finder.FindOptions) {
    el.finding = (prefix) => Finder.find(fo);
}

export function updateStockValue(prefix) {
    var sum = parseFloat($("#" + SF.compose(prefix, "UnitPrice")).val()) *
        parseFloat($("#" + SF.compose(prefix, "UnitsInStock")).val());
    $("#" + SF.compose(prefix, "ValueInStock_sfStaticValue")).html(sum.toString());
}