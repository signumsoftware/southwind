 /// <reference path="../../framework/signum.web/signum/scripts/globals.ts"/>

import Entities = require("Framework/Signum.Web/Signum/Scripts/Entities")
import Navigator = require("Framework/Signum.Web/Signum/Scripts/Navigator")
import Finder = require("Framework/Signum.Web/Signum/Scripts/Finder")
import Lines = require("Framework/Signum.Web/Signum/Scripts/Lines")
import Operations = require("Framework/Signum.Web/Signum/Scripts/Operations")


export function updateStockValue(prefix: string) {
    var sum = parseFloat(prefix.child("UnitPrice").get().val()) *
        parseFloat(prefix.child("UnitsInStock").get().val());

    prefix.child("ValueInStock").get().html(sum.toString());
}

