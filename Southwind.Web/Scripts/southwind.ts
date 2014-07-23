/// <reference path="../../framework/signum.web/signum/scripts/globals.ts"/>

$(function () { 
    $("#themeSelector").bind("change", function () {
        var $this = $(this);
        SF.submitOnly($this.attr("data-url"), { themeSelector: $this.val() });
    });

    $("#languageSelector").bind("change", function () {
        var $this = $(this);
        SF.submitOnly($this.attr("data-url"), { culture: $this.val() });
    });
});