var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/QuerySettings', 'Framework/Signum.React/Scripts/Finder', 'Framework/Signum.React/Scripts/FindOptions', 'Framework/Signum.React/Scripts/Signum.Entities', 'Framework/Signum.React/Scripts/Reflection', 'Framework/Signum.React/Scripts/Navigator', 'react-bootstrap', 'Templates/SearchControl/SearchResult', 'Templates/SearchControl/PaginationSelector'], function (require, exports, React, QuerySettings_1, Finder, FindOptions_1, Signum_Entities_1, Reflection_1, Navigator, react_bootstrap_1, SearchResult_1, PaginationSelector_1) {
    var SearchControl = (function (_super) {
        __extends(SearchControl, _super);
        function SearchControl(props) {
            var _this = this;
            _super.call(this, props);
            this.handlePagination = function (p) {
                _this.state.findOptions.pagination = p;
                _this.setState({ resultTable: null });
                if (_this.state.findOptions.pagination.mode != FindOptions_1.PaginationMode.All)
                    _this.search();
            };
            this.state = {
                querySettings: Finder.getQuerySettings(props.findOptions.queryName),
                loading: false,
                selectedRows: []
            };
            Finder.getQueryDescription(props.findOptions.queryName).then(function (qd) {
                var ti = Reflection_1.typeInfos(qd.columns["Entity"].type);
                var findOptions = extend({
                    searchOnLoad: true,
                    showHeader: true,
                    showFilters: false,
                    showFilterButton: true,
                    showFooter: true,
                    create: ti.some(function (ti) { return Navigator.isCreable(ti, true); }),
                    navigate: ti.some(function (ti) { return Navigator.isNavigable(ti, null, true); }),
                    pagination: (_this.state.querySettings && _this.state.querySettings.pagination) || QuerySettings_1.defaultPagination,
                    columnOptionsMode: FindOptions_1.ColumnOptionsMode.Add,
                    columnOptions: [],
                    orderOptions: [],
                    filterOptions: []
                }, props.findOptions);
                findOptions.columnOptions = SearchControl.mergeColumns(Dic.getValues(qd.columns), findOptions.columnOptionsMode, findOptions.columnOptions);
                Finder.parseTokens(findOptions).then(function (fo) {
                    return _this.setState({
                        findOptions: fo,
                        queryDescription: qd,
                    });
                });
            });
        }
        SearchControl.mergeColumns = function (columns, mode, columnOptions) {
            switch (mode) {
                case FindOptions_1.ColumnOptionsMode.Add:
                    return columns.filter(function (cd) { return cd.name != "Entity"; }).map(function (cd) { return ({ columnName: cd.name, token: FindOptions_1.toQueryToken(cd), displayName: cd.displayName }); })
                        .concat(columnOptions);
                case FindOptions_1.ColumnOptionsMode.Remove:
                    return columns.filter(function (cd) { return cd.name != "Entity" && !columnOptions.some(function (a) { return a.token.fullKey == cd.name; }); })
                        .map(function (cd) { return ({ columnName: cd.name, token: FindOptions_1.toQueryToken(cd), displayName: cd.displayName }); });
                case FindOptions_1.ColumnOptionsMode.Replace:
                    return columnOptions;
            }
        };
        SearchControl.prototype.toggleFilters = function () {
            this.state.findOptions.showFilters = !this.state.findOptions.showFilters;
            this.forceUpdate();
        };
        SearchControl.prototype.search = function () {
            var _this = this;
            var fo = this.state.findOptions;
            this.setState({ loading: false });
            Finder.search({
                queryKey: Reflection_1.queryKey(fo.queryName),
                filters: fo.filterOptions.map(function (fo) { return ({ token: fo.token.fullKey, operation: fo.operation, value: fo.value }); }),
                columns: fo.columnOptions.map(function (co) { return ({ token: co.token.fullKey, displayName: co.displayName }); }),
                orders: fo.orderOptions.map(function (oo) { return ({ token: oo.token.fullKey, orderType: oo.orderType }); }),
                pagination: fo.pagination,
            }).then(function (rt) {
                _this.setState({ resultTable: rt, selectedRows: [], loading: false });
            });
        };
        SearchControl.prototype.render = function () {
            var SFB = this.props.simpleFilterBuilder;
            var fo = this.state.findOptions;
            if (!fo)
                return null;
            return (React.createElement("div", {"className": "sf-search-control SF-control-container"}, SFB && React.createElement("div", {"className": "simple-filter-builder"}, React.createElement(SFB, {"findOptions": fo})), fo.showHeader && fo.showFilters && React.createElement(FilterControl, {"queryName": fo.queryName, "filterOptions": fo.filterOptions}), fo.showHeader && this.renderToolBar(), React.createElement(SearchResult_1.default, {"allowSelection": true, "columnOptions": fo.columnOptions, "orderOptions": fo.orderOptions, "navigate": fo.navigate, "querySettings": this.state.querySettings, "results": this.state.resultTable, "selectedRows": this.state.selectedRows}), fo.showFooter && React.createElement(PaginationSelector_1.default, {"pagination": fo.pagination, "onPagination": this.handlePagination, "resultTable": this.state.resultTable})));
        };
        SearchControl.prototype.renderToolBar = function () {
            var _this = this;
            var fo = this.state.findOptions;
            return React.createElement("div", {"className": "sf-query-button-bar"}, fo.showFilterButton && React.createElement("a", {"className": "sf-query-button sf-filters-header btn btn-default" + (fo.showFilters ? " active" : ""), "onClick": function () { return _this.toggleFilters(); }, "title": fo.showFilters ? Signum_Entities_1.JavascriptMessage.hideFilters.niceToString() : Signum_Entities_1.JavascriptMessage.showFilters.niceToString()}, React.createElement("span", {"className": "glyphicon glyphicon glyphicon-filter"})), React.createElement("button", {"className": "sf-query-button sf-search btn btn-primary" + (this.state.loading ? " disabled" : ""), "onClick": function () { return _this.search(); }}, Signum_Entities_1.SearchMessage.Search.niceToString(), " "), fo.create && React.createElement("a", {"className": "sf-query-button btn btn-default sf-line-button sf-create", "title": this.createTitle()}, React.createElement("span", {"className": "glyphicon glyphicon-plus"})), this.props.showContextMenu != false && this.getSelectedButton(), Finder.ButtonBarQuery.getButtonBarElements(fo.queryName), this.props.avoidFullScreenButton != true &&
                React.createElement("a", {"className": "sf-query-button btn btn-default", "href": "#"}, React.createElement("span", {"className": "glyphicon glyphicon-new-window"})));
        };
        SearchControl.prototype.createTitle = function () {
            var entityColType = this.state.queryDescription.columns["Entity"].type;
            if (entityColType.name == Reflection_1.IsByAll)
                return Signum_Entities_1.SearchMessage.CreateNew0_G.niceToString().forGengerAndNumber("m", 1).formatWith("?");
            var types = Reflection_1.typeInfos(entityColType).map(function (ti) { return ti.niceName; }).join(", ");
            var gender = Reflection_1.typeInfos(entityColType).first().gender;
            return Signum_Entities_1.SearchMessage.CreateNew0_G.niceToString().forGengerAndNumber(gender).formatWith(types);
        };
        SearchControl.prototype.getSelectedButton = function () {
            return React.createElement(react_bootstrap_1.NavDropdown, {"id": "selectedButton", "className": "sf-query-button sf-tm-selected", "title": Signum_Entities_1.JavascriptMessage.Selected.niceToString()});
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