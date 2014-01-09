/// <reference path="../../framework/signum.web/signum/headers/jquery/jquery.d.ts"/>
/// <reference path="../../framework/signum.web/signum/scripts/references.ts"/>

$(function () {
    $("body").bind("sf-new-content", function (e) {
        var $newContent = $(e.target);

        SF.NewContentProcessor.defaultButtons($newContent);
        SF.NewContentProcessor.defaultDatepicker($newContent);
        SF.NewContentProcessor.defaultDropdown($newContent);
        SF.NewContentProcessor.defaultPlaceholder($newContent);
        SF.NewContentProcessor.defaultTabs($newContent);
        SF.NewContentProcessor.defaultModifiedChecker($newContent);
    });

    $("body").trigger("sf-new-content");
});