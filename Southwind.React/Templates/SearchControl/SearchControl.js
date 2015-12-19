var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/QuerySettings', 'Framework/Signum.React/Scripts/Finder', 'Framework/Signum.React/Scripts/FindOptions', 'Framework/Signum.React/Scripts/Signum.Entities', 'Framework/Signum.React/Scripts/Reflection', 'Framework/Signum.React/Scripts/Navigator', 'react-bootstrap', 'Templates/SearchControl/PaginationSelector'], function (require, exports, React, QuerySettings_1, Finder, FindOptions_1, Signum_Entities_1, Reflection_1, Navigator, react_bootstrap_1, PaginationSelector_1) {
    var SearchControl = (function (_super) {
        __extends(SearchControl, _super);
        function SearchControl(props) {
            var _this = this;
            _super.call(this, props);
            ////
            // HANDLERs
            ////
            this.handleToggleFilters = function () {
                _this.state.findOptions.showFilters = !_this.state.findOptions.showFilters;
                _this.forceUpdate();
            };
            this.handleSearch = function () {
                var fo = _this.state.findOptions;
                _this.setState({ loading: false });
                Finder.search({
                    queryKey: Reflection_1.getQueryKey(fo.queryName),
                    filters: fo.filterOptions.map(function (fo) { return ({ token: fo.token.fullKey, operation: fo.operation, value: fo.value }); }),
                    columns: fo.columnOptions.map(function (co) { return ({ token: co.token.fullKey, displayName: co.displayName }); }),
                    orders: fo.orderOptions.map(function (oo) { return ({ token: oo.token.fullKey, orderType: oo.orderType }); }),
                    pagination: fo.pagination,
                }).then(function (rt) {
                    _this.setState({ resultTable: rt, selectedRows: [], loading: false });
                });
            };
            this.handlePagination = function (p) {
                _this.state.findOptions.pagination = p;
                _this.setState({ resultTable: null });
                if (_this.state.findOptions.pagination.mode != FindOptions_1.PaginationMode.All)
                    _this.handleSearch();
            };
            this.handleTogleAll = function () {
                if (!_this.state.resultTable)
                    return;
                _this.setState({ selectedRows: _this.state.selectedRows.length ? _this.state.resultTable.rows.slice(0) : [] });
            };
            this.handleHeaderClick = function (e) {
                var token = e.currentTarget.getAttribute("data-column-name");
                var prev = _this.state.findOptions.orderOptions.filter(function (a) { return a.token.fullKey == token; }).firstOrNull();
                if (prev != null) {
                    prev.orderType = prev.orderType == FindOptions_1.OrderType.Ascending ? FindOptions_1.OrderType.Descending : FindOptions_1.OrderType.Ascending;
                    if (!e.shiftKey)
                        _this.state.findOptions.orderOptions = [prev];
                }
                else {
                    var column = _this.state.findOptions.columnOptions.filter(function (a) { return a.token.fullKey == token; }).first("Column");
                    var newOrder = { token: column.token, orderType: FindOptions_1.OrderType.Ascending, columnName: column.token.fullKey };
                    if (e.shiftKey)
                        _this.state.findOptions.orderOptions.push(newOrder);
                    else
                        _this.state.findOptions.orderOptions = [newOrder];
                }
                //this.setState({ resultTable: null });
                if (_this.state.findOptions.pagination.mode != FindOptions_1.PaginationMode.All)
                    _this.handleSearch();
            };
            this.state = {
                querySettings: Finder.getQuerySettings(props.findOptions.queryName),
                loading: false,
                selectedRows: []
            };
            Finder.getQueryDescription(props.findOptions.queryName).then(function (qd) {
                _this.setState({
                    queryDescription: qd,
                });
                var ti = Reflection_1.getTypeInfos(qd.columns["Entity"].type);
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
                if (!findOptions.orderOptions.length) {
                    var defaultOrder = _this.state.querySettings && _this.state.querySettings.defaultOrderColumn || QuerySettings_1.defaultOrderColumn;
                    var info = _this.entityColumnTypeInfos().firstOrNull();
                    findOptions.orderOptions = [{
                            columnName: defaultOrder,
                            orderType: info.entityData == Reflection_1.EntityData.Transactional ? FindOptions_1.OrderType.Descending : FindOptions_1.OrderType.Ascending
                        }];
                }
                Finder.parseTokens(findOptions).then(function (fo) {
                    _this.setState({
                        findOptions: fo,
                    });
                    if (_this.state.findOptions.searchOnLoad)
                        _this.handleSearch();
                });
            });
        }
        SearchControl.prototype.entityColumn = function () {
            return this.state.queryDescription.columns["Entity"];
        };
        SearchControl.prototype.entityColumnTypeInfos = function () {
            return Reflection_1.getTypeInfos(this.entityColumn().type);
        };
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
        ////
        // RENDERs
        ////
        SearchControl.prototype.render = function () {
            var SFB = this.props.simpleFilterBuilder;
            var fo = this.state.findOptions;
            if (!fo)
                return null;
            return (React.createElement("div", {"className": "sf-search-control SF-control-container"}, SFB && React.createElement("div", {"className": "simple-filter-builder"}, React.createElement(SFB, {"findOptions": fo})), fo.showHeader && fo.showFilters && React.createElement(FilterControl, {"queryName": fo.queryName, "filterOptions": fo.filterOptions}), fo.showHeader && this.renderToolBar(), React.createElement("div", {"className": "sf-search-results-container table-responsive"}, React.createElement("table", {"className": "sf-search-results table table-hover table-condensed"}, React.createElement("thead", null, this.renderHeaders()), React.createElement("tbody", null, this.renderRows()))), fo.showFooter && React.createElement(PaginationSelector_1.default, {"pagination": fo.pagination, "onPagination": this.handlePagination, "resultTable": this.state.resultTable})));
        };
        SearchControl.prototype.renderToolBar = function () {
            var fo = this.state.findOptions;
            return React.createElement("div", {"className": "sf-query-button-bar btn-toolbar"}, fo.showFilterButton && React.createElement("a", {"className": "sf-query-button sf-filters-header btn btn-default" + (fo.showFilters ? " active" : ""), "onClick": this.handleToggleFilters, "title": fo.showFilters ? Signum_Entities_1.JavascriptMessage.hideFilters.niceToString() : Signum_Entities_1.JavascriptMessage.showFilters.niceToString()}, React.createElement("span", {"className": "glyphicon glyphicon glyphicon-filter"})), React.createElement("button", {"className": "sf-query-button sf-search btn btn-primary" + (this.state.loading ? " disabled" : ""), "onClick": this.handleSearch}, Signum_Entities_1.SearchMessage.Search.niceToString(), " "), fo.create && React.createElement("a", {"className": "sf-query-button btn btn-default sf-line-button sf-create", "title": this.createTitle()}, React.createElement("span", {"className": "glyphicon glyphicon-plus"})), this.props.showContextMenu != false && this.getSelectedButton(), Finder.ButtonBarQuery.getButtonBarElements(fo.queryName), this.props.avoidFullScreenButton != true &&
                React.createElement("a", {"className": "sf-query-button btn btn-default", "href": "#"}, React.createElement("span", {"className": "glyphicon glyphicon-new-window"})));
        };
        SearchControl.prototype.createTitle = function () {
            var tis = this.entityColumnTypeInfos();
            var types = tis.map(function (ti) { return ti.niceName; }).join(", ");
            var gender = tis.first().gender;
            return Signum_Entities_1.SearchMessage.CreateNew0_G.niceToString().forGenderAndNumber(gender).formatWith(types);
        };
        SearchControl.prototype.getSelectedButton = function () {
            return React.createElement(react_bootstrap_1.DropdownButton, {"id": "selectedButton", "className": "sf-query-button sf-tm-selected", "title": Signum_Entities_1.JavascriptMessage.Selected.niceToString()});
        };
        SearchControl.prototype.renderHeaders = function () {
            var _this = this;
            return React.createElement("tr", null, this.props.allowSelection && React.createElement("th", {"className": "sf-th-selection"}, React.createElement("input", {"type": "checkbox", "id": "cbSelectAll", "onClick": this.handleTogleAll})), this.state.findOptions.navigate && React.createElement("th", {"className": "sf-th-entity"}), this.state.findOptions.columnOptions.map(function (co) {
                return React.createElement("th", {"draggable": true, "data-column-name": co.token.fullKey, "key": co.token.fullKey, "onClick": _this.handleHeaderClick}, React.createElement("span", {"className": "sf-header-sort " + _this.orderClassName(co)}), React.createElement("span", null, " ", co.displayName));
            }));
        };
        SearchControl.prototype.orderClassName = function (column) {
            var orders = this.state.findOptions.orderOptions;
            var o = orders.filter(function (a) { return a.token.fullKey == column.token.fullKey; }).firstOrNull();
            if (o == null)
                return "";
            var asc = (o.orderType == FindOptions_1.OrderType.Ascending ? "asc" : "desc");
            if (orders.indexOf(o))
                asc += " l" + orders.indexOf(o);
            return asc;
        };
        SearchControl.prototype.renderRows = function () {
            var _this = this;
            var columnsCount = this.state.findOptions.columnOptions.length +
                (this.props.allowSelection ? 1 : 0) +
                (this.state.findOptions.navigate ? 1 : 0);
            if (!this.state.resultTable) {
                return React.createElement("tr", null, React.createElement("td", {"colSpan": columnsCount}, Signum_Entities_1.JavascriptMessage.searchForResults.niceToString()));
            }
            if (this.state.resultTable.rows.length == 0) {
                return React.createElement("tr", null, React.createElement("td", {"colSpan": columnsCount}, Signum_Entities_1.SearchMessage.NoResultsFound.niceToString()));
            }
            var qs = this.state.querySettings;
            var formatters = this.state.findOptions.columnOptions.map(function (c) {
                return (qs && qs.formatters && qs.formatters[c.token.fullKey]) ||
                    QuerySettings_1.FormatRules.filter(function (a) { return a.isApplicable(c); }).last("FormatRules").formatter(c);
            });
            var rowAttributes = qs && qs.rowAttributes;
            return this.state.resultTable.rows.map(function (row, i) {
                return React.createElement("tr", React.__spread({"key": i, "data-entity": Signum_Entities_1.liteKey(row)}, rowAttributes ? rowAttributes(row, _this.state.resultTable.columns) : null, {"style": { opacity: _this.state.selectedRows.some(function (s) { return row === s; }) ? 0.5 : 1 }}), _this.props.allowSelection && React.createElement("td", {"style": { textAlign: "center" }}, React.createElement("input", {"type": "checkbox", "className": "sf-td-selection"})), _this.state.findOptions.navigate && React.createElement("td", null, ((qs && qs.entityFormatter) || QuerySettings_1.EntityFormatRules.filter(function (a) { return a.isApplicable(row); }).last("EntityFormatRules").formatter)(row)), _this.state.findOptions.columnOptions.map(function (c, i) { return React.createElement("td", {"key": i, "style": { textAlign: formatters[i].textAllign }}, formatters[i].formatter(row.columns[i])); }));
            });
        };
        SearchControl.defaultProps = {
            allowSelection: true,
            avoidFullScreenButton: false
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