$(function () {
    $("#themeSelector").bind("change", function () {
        var $this = $(this);
        SF.submitOnly($this.attr("data-url"), { themeSelector: $this.val() });
    });
});