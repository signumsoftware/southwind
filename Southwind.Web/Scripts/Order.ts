/// <reference path="../../framework/signum.web/signum/scripts/globals.ts"/>

import Entities = require("Framework/Signum.Web/Signum/Scripts/Entities")
import Navigator = require("Framework/Signum.Web/Signum/Scripts/Navigator")
import Finder = require("Framework/Signum.Web/Signum/Scripts/Finder")
import Lines = require("Framework/Signum.Web/Signum/Scripts/Lines")


export function attachCustomerEntityLine(el: Lines.EntityLine, fo: Finder.FindOptions) {
    el.finding = (prefix) => Finder.find(fo);

    el.entityChanged = () =>
    {
        el.getOrRequestEntityHtml().then(e=> {

            var shipAddress = el.prefix.parent("Customer").child("ShipAddress"); 

            var copy = (part: string) =>
                shipAddress.child(part).get().val(e == null ? "" : e.getChild("Address_" + part).val());

            copy("Address");
            copy("City");
            copy("Region");
            copy("PostalCode");
            copy("Country");
        }); 
    };
}

export function updateStockValue(prefix: string) {
    var sum = parseFloat(prefix.child("UnitPrice").get().val()) *
              parseFloat(prefix.child("UnitsInStock").get().val());

    prefix.child("ValueInStock_sfStaticValue").get().html(sum.toString());
}