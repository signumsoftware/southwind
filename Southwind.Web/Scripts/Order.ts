/// <reference path="../../framework/signum.web/signum/scripts/globals.ts"/>

import Entities = require("Framework/Signum.Web/Signum/Scripts/Entities")
import Navigator = require("Framework/Signum.Web/Signum/Scripts/Navigator")
import Finder = require("Framework/Signum.Web/Signum/Scripts/Finder")
import Lines = require("Framework/Signum.Web/Signum/Scripts/Lines")
import Operations = require("Framework/Signum.Web/Signum/Scripts/Operations")


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

export function attachProductLine(el: Lines.EntityLine, fo: Finder.FindOptions) {
    el.entityChanged = () => {

        el.getOrRequestEntityHtml().then(e=> {

            var root = el.prefix.parent("Product");

            root.child("UnitPrice").get().val(e.getChild("UnitPrice").val() || e.getChild("UnitPrice").text());
            root.child("Quantity").get().val("1");
            root.child("Quantity").get().trigger("change");
        });
    };
}

export function attachDetails(el: Lines.EntityRepeater, comma: string) {
    el.element.on("change", "div.recalculate input", e=> {
        reCalculate(el, comma);
    }); 

    el.entityChanged = () => reCalculate(el, comma);
}

function reCalculate(ed: Lines.EntityRepeater, comma: string) {
    var total = 0;
    ed.element.find(".sf-repeater-element").each((i, e) => {
        var prefix = (<HTMLElement>e).id.parent("sfRepeaterItem");

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

function parseFloatLoc(str: string, comma: string) {
    return parseFloat(str.replace(comma, "."));
}

function toStringLoc(val: number, comma: string) {
    return Number(val).toFixed(2).replace(".", comma);
}


export function shipOrder(options: Operations.EntityOperationOptions, url: string,
    valueLineOptions: Navigator.ValueLineBoxOptions, contextual: boolean) : Promise<void> {

    return Navigator.valueLineBox(valueLineOptions).then(shipDate =>
    {
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


export function createOrderFromProducts(options: Operations.OperationOptions, findOptions: Finder.FindOptions, url: string, openNewWindowOrEvent: any): Promise<void> {

    options.controllerUrl = url;

    return Finder.find(findOptions).then(cust=> {

        if (cust)// could return null, but we let it continue 
            options.requestExtraJsonData = { customer: cust.key() };

        return Operations.constructFromManyDefault(options, openNewWindowOrEvent);
    });
}


export function createOrder(extraJsonArgs: FormObject, findOptions: Finder.FindOptions): Promise<FormObject> {

    return Finder.find(findOptions).then(cust=> {

        if (cust)// could return null, but we let it continue 
            extraJsonArgs = $.extend(extraJsonArgs, { customer: cust.key() });

        return extraJsonArgs;
    });
}

