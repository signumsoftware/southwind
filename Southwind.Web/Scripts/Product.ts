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

export function attachCategory(ec: Lines.EntityCombo)
{
    ec.creating = prefix =>
    {
        var newEntity = new Entities.EntityHtml(prefix, new Entities.RuntimeInfo(ec.singleType(), null, true), lang.signum.newEntity);

        var productName = ec.prefix.parent().child("ProductName").get().val(); 

        var options = ec.defaultViewOptions(null);

        options.onPopupLoaded = div => prefix.child("CategoryName").get(div).val(productName); 

        return Navigator.viewPopup(newEntity, options);
    };
}


