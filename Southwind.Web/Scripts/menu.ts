/// <reference path="../../framework/signum.web/signum/scripts/globals.ts"/>


$(function () {

    $("#menu .l1 > span").addClass("ui-widget-header");

    var cache, limit = 8;
    var search = function (input) {
        if (!cache) {

            cache = [];
            $.map($("#menu ul a"), function (a) {
                var $this = $(a);
                cache.push({ url: $this.attr("href"), name: $this.text() });
            });
        }
        // make case-insensitive regexp
        var stregexp = new RegExp(input, "i");

        var result = [], count = 0;
        // remove appropriate item(s)
        for (var i = 0, l = cache.length; i < l && count < limit; i++) {
            if (cache[i].name.match(stregexp) != null) {
                result.push(cache[i]);
                count++;
            }
        }
        return result;
    };

    var $search_filter = jQuery("#menu_filter");

    $search_filter.autocomplete({
        delay: 0,
        source: function (request, response) {
            var data = search($search_filter.val());
            response($.map(data, function (item) {
                return {
                    label: item.name,
                    value: item
                };
            }));
        },
        select: function (event, ui) {
            window.location = ui.item.value.url;
            $search_filter.val(ui.item.label);
            return false;
        },
        focus: function (event, ui) {
            return false;
        }
    }).bind("autocompleteselect", function (event, ui) {
        $search_filter.val(ui.item.label);
        return false;
    });
});


