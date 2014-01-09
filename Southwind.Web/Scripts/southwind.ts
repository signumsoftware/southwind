/// <reference path="../../framework/signum.web/signum/headers/jquery/jquery.d.ts"/>
/// <reference path="../../framework/signum.web/signum/scripts/references.ts"/>

$(function () {
    $("#themeSelector").bind("change", function () {
        var $this = $(this);
        SF.submitOnly($this.attr("data-url"), { themeSelector: $this.val() });
    });
});