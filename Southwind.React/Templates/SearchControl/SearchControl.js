var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/QuerySettings', 'Framework/Signum.React/Scripts/Finder', 'Framework/Signum.React/Scripts/Signum.Entities', 'Framework/Signum.React/Scripts/Reflection'], function (require, exports, React, QuerySettings_1, Finder, Signum_Entities_1, Reflection) {
    var a = QuerySettings_1.QuerySettings;
    var SearchControl = (function (_super) {
        __extends(SearchControl, _super);
        function SearchControl(props) {
            _super.call(this, props);
            this.state = {
                findOptions: props.findOptions,
                querySettings: Finder.getQuerySettings(props.findOptions.queryName),
                loading: false,
            };
            //Finder.getQueryDescription(props.findOptions.queryName).then(
        }
        SearchControl.prototype.toggleFilters = function () {
            this.props.findOptions.showFilters = !this.props.findOptions.showFilters;
            this.forceUpdate();
        };
        SearchControl.prototype.search = function () {
        };
        SearchControl.prototype.render = function () {
            var fo = this.props.findOptions;
            var SFB = this.props.simpleFilterBuilder;
            return (React.createElement("div", {"className": "sf-search-control SF-control-container"}, SFB && React.createElement("div", {"className": "simple-filter-builder"}, React.createElement(SFB, {"findOptions": fo})), fo.showHeader && fo.showFilters && React.createElement(FilterControl, {"queryName": fo.queryName, "filterOptions": fo.filterOptions}), fo.showHeader && this.renderToolBar()));
        };
        SearchControl.prototype.renderToolBar = function () {
            var _this = this;
            var fo = this.props.findOptions;
            return React.createElement("div", {"className": "sf-query-button-bar"}, fo.showFilterButton && React.createElement("a", {"className": "sf-query-button sf-filters-header btn btn-default" + (fo.showFilters ? " active" : ""), "onClick": function () { return _this.toggleFilters(); }, "title": fo.showFilters ? Signum_Entities_1.JavascriptMessage.hideFilters.niceToString() : Signum_Entities_1.JavascriptMessage.showFilters.niceToString()}, React.createElement("span", {"className": "glyphicon glyphicon glyphicon-filter"})), React.createElement("button", {"className": "sf-query-button sf-search btn btn-primary" + (this.state.loading ? " disabled" : ""), "onClick": function () { return _this.search(); }}, Signum_Entities_1.SearchMessage.Search.niceToString(), " "), fo.create && React.createElement("a", {"className": "sf-query-button btn btn-default sf-line-button sf-create", "title": this.createTitle()}, React.createElement("span", {"className": "glyphicon glyphicon-plus"})));
        };
        SearchControl.prototype.createTitle = function () {
            var entityColType = this.state.queryDescription.columns["Entity"].type;
            if (entityColType.name == Reflection.IsByAll)
                return Signum_Entities_1.SearchMessage.CreateNew0_G.niceToString().forGengerAndNumber("m", 1).formatWith("?");
            var types = entityColType.name.split(",").map(function (name) { return Reflection.typeInfo(name).niceName; }).join();
            var gender = Reflection.typeInfo(entityColType.name.split(",").first()).gender;
            return Signum_Entities_1.SearchMessage.CreateNew0_G.niceToString().forGengerAndNumber(gender).formatWith(types);
        };
        return SearchControl;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SearchControl;
    var FilterControl = (function (_super) {
        __extends(FilterControl, _super);
        function FilterControl() {
            _super.apply(this, arguments);
        }
        FilterControl.prototype.render = function () {
            return React.createElement("div", null);
        };
        return FilterControl;
    })(React.Component);
    exports.FilterControl = FilterControl;
});
//# sourceMappingURL=SearchControl.js.map