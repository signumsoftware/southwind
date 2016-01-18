var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'react-bootstrap', 'Framework/Signum.React/Scripts/Finder', 'Framework/Signum.React/Scripts/FindOptions', 'Framework/Signum.React/Scripts/Signum.Entities', 'Framework/Signum.React/Scripts/Reflection', 'Framework/Signum.React/Scripts/Navigator', 'Templates/SearchControl/PaginationSelector', 'Templates/SearchControl/FilterBuilder', 'Templates/SearchControl/ContextualItems'], function (require, exports, React, react_bootstrap_1, Finder, FindOptions_1, Signum_Entities_1, Reflection_1, Navigator, PaginationSelector_1, FilterBuilder_1, ContextualItems_1) {
    var SearchControl = (function (_super) {
        __extends(SearchControl, _super);
        // INIT
        function SearchControl(props) {
            var _this = this;
            _super.call(this, props);
            // MAIN
            this.handleSearch = function () {
                var fo = _this.state.findOptions;
                _this.setState({ loading: false });
                Finder.API.search({
                    queryKey: Reflection_1.getQueryKey(fo.queryName),
                    filters: fo.filterOptions.map(function (fo) { return ({ token: fo.token.fullKey, operation: fo.operation, value: fo.value }); }),
                    columns: fo.columnOptions.map(function (co) { return ({ token: co.token.fullKey, displayName: co.displayName }); }),
                    orders: fo.orderOptions.map(function (oo) { return ({ token: oo.token.fullKey, orderType: oo.orderType }); }),
                    pagination: fo.pagination,
                }).then(function (rt) {
                    _this.setState({ resultTable: rt, selectedRows: [], selectedMenuItems: null, usedRows: [], loading: false });
                    _this.notifySelectedRowsChanged();
                    _this.forceUpdate();
                });
            };
            this.handlePagination = function (p) {
                _this.state.findOptions.pagination = p;
                _this.setState({ resultTable: null });
                if (_this.state.findOptions.pagination.mode != FindOptions_1.PaginationMode.All)
                    _this.handleSearch();
            };
            this.handleOnContextMenu = function (event) {
                event.preventDefault();
                event.stopPropagation();
                var td = DomUtils.closest(event.target, "td, th");
                var columnIndex = td.getAttribute("data-column-index") && parseInt(td.getAttribute("data-column-index"));
                var tr = td.parentNode;
                var rowIndex = tr.getAttribute("data-row-index") && parseInt(tr.getAttribute("data-row-index"));
                _this.state.contextualMenu = {
                    position: { pageX: event.pageX, pageY: event.pageY },
                    columnIndex: columnIndex,
                    rowIndex: rowIndex,
                    columnOffset: td.tagName == "th" ? _this.getOffset(event.pageX, td.getBoundingClientRect()) : null
                };
                if (rowIndex != null) {
                    var row = _this.state.resultTable.rows[rowIndex];
                    if (!_this.state.selectedRows.contains(row)) {
                        _this.state.selectedRows = [row];
                        _this.state.selectedMenuItems = null;
                    }
                    if (_this.state.selectedMenuItems = null)
                        _this.loadMenuItems();
                }
                _this.forceUpdate();
            };
            // TOOLBAR
            this.handleToggleFilters = function () {
                _this.state.findOptions.showFilters = !_this.state.findOptions.showFilters;
                _this.forceUpdate();
            };
            // SELECT BUTTON
            this.handleSelectedToggle = function (isOpen) {
                if (isOpen && _this.state.selectedMenuItems == null)
                    _this.loadMenuItems();
            };
            // CONTEXT MENU
            this.handleContextOnHide = function () {
                _this.setState({ contextualMenu: null });
            };
            this.handleQuickFilter = function () {
                var cm = _this.state.contextualMenu;
                var fo = _this.state.findOptions;
                var token = fo.columnOptions[cm.columnIndex].token;
                var fops = FindOptions_1.filterOperations[token.filterType];
                var resultColumnIndex = _this.state.resultTable.columns.indexOf(token.fullKey);
                fo.filterOptions.push({
                    token: token,
                    columnName: token.fullKey,
                    operation: fops && fops.firstOrNull(),
                    value: cm.rowIndex == null || resultColumnIndex == -1 ? null : _this.state.resultTable.rows[cm.rowIndex].columns[resultColumnIndex]
                });
                if (!fo.showFilters)
                    fo.showFilters = true;
                _this.forceUpdate();
            };
            this.handleToggleAll = function () {
                if (!_this.state.resultTable)
                    return;
                _this.setState({ selectedRows: !_this.allSelected() ? _this.state.resultTable.rows.clone() : [] });
                _this.notifySelectedRowsChanged();
                _this.forceUpdate();
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
            //HEADER DRAG AND DROP
            this.handleHeaderDragStart = function (de) {
                de.dataTransfer.effectAllowed = "move";
                var dragIndex = parseInt(de.currentTarget.getAttribute("data-column-index"));
                _this.setState({ dragColumnIndex: dragIndex });
            };
            this.handleHeaderDragEnd = function (de) {
                _this.setState({ dragColumnIndex: null, dropBorderIndex: null });
            };
            this.handlerHeaderDragOver = function (de) {
                de.preventDefault();
                var th = de.currentTarget;
                var size = th.scrollWidth;
                var columnIndex = parseInt(th.getAttribute("data-column-index"));
                var offset = _this.getOffset(de.nativeEvent.pageX, th.getBoundingClientRect());
                var dropBorderIndex = offset == null ? null : columnIndex + offset;
                if (dropBorderIndex == _this.state.dragColumnIndex || dropBorderIndex == _this.state.dragColumnIndex + 1)
                    dropBorderIndex = null;
                de.dataTransfer.dropEffect = dropBorderIndex == null ? "none" : "move";
                if (_this.state.dropBorderIndex != dropBorderIndex)
                    _this.setState({ dropBorderIndex: dropBorderIndex });
            };
            this.handleHeaderDrop = function (de) {
                console.log(JSON.stringify({
                    dragIndex: _this.state.dragColumnIndex,
                    dropIndex: _this.state.dropBorderIndex
                }));
                var columns = _this.state.findOptions.columnOptions;
                var temp = columns[_this.state.dragColumnIndex];
                columns.removeAt(_this.state.dragColumnIndex);
                var rebasedDropIndex = _this.state.dropBorderIndex > _this.state.dragColumnIndex ?
                    _this.state.dropBorderIndex - 1 :
                    _this.state.dropBorderIndex;
                columns.insertAt(rebasedDropIndex, temp);
                _this.setState({
                    dropBorderIndex: null,
                    dragColumnIndex: null
                });
            };
            //ROWS
            this.handleChecked = function (event) {
                var cb = (event.currentTarget);
                var index = parseInt(cb.getAttribute("data-index"));
                var row = _this.state.resultTable.rows[index];
                if (cb.checked) {
                    if (!_this.state.selectedRows.contains(row))
                        _this.state.selectedRows.push(row);
                }
                else {
                    _this.state.selectedRows.remove(row);
                }
                _this.state.selectedMenuItems = null;
                _this.notifySelectedRowsChanged();
                _this.forceUpdate();
            };
            this.state = {
                resultTable: null,
                findOptions: null,
                querySettings: Finder.getQuerySettings(props.findOptions.queryName),
                queryDescription: null,
                loading: false,
                selectedRows: [],
                selectedMenuItems: null,
                usedRows: [],
            };
            this.initialLoad(this.props.findOptions);
        }
        SearchControl.prototype.componentWillReceiveProps = function (newProps) {
            if (JSON.stringify(this.props.findOptions) == JSON.stringify(newProps.findOptions))
                return;
            if (this.props.findOptions.queryName != newProps.findOptions.queryName)
                this.initialLoad(newProps.findOptions);
            else
                this.resetFindOptions(newProps.findOptions);
        };
        SearchControl.prototype.initialLoad = function (propsFindOptions) {
            var _this = this;
            Finder.API.getQueryDescription(propsFindOptions.queryName).then(function (qd) {
                _this.setState({
                    queryDescription: qd,
                });
                _this.resetFindOptions(propsFindOptions);
            });
        };
        SearchControl.prototype.resetFindOptions = function (propsFindOptions) {
            var _this = this;
            var qd = this.state.queryDescription;
            var ti = Reflection_1.getTypeInfos(qd.columns["Entity"].type);
            var findOptions = Dic.extend({
                searchOnLoad: true,
                showHeader: true,
                showFilters: false,
                showFilterButton: true,
                showFooter: true,
                allowChangeColumn: true,
                create: ti.some(function (ti) { return Navigator.isCreable(ti, true); }),
                navigate: ti.some(function (ti) { return Navigator.isNavigable(ti, null, true); }),
                pagination: (this.state.querySettings && this.state.querySettings.pagination) || Finder.defaultPagination,
                columnOptionsMode: FindOptions_1.ColumnOptionsMode.Add,
                columnOptions: [],
                orderOptions: [],
                filterOptions: []
            }, propsFindOptions);
            findOptions.columnOptions = SearchControl.mergeColumns(Dic.getValues(qd.columns), findOptions.columnOptionsMode, findOptions.columnOptions);
            if (!findOptions.orderOptions.length) {
                var defaultOrder = this.state.querySettings && this.state.querySettings.defaultOrderColumn || Finder.defaultOrderColumn;
                var info = this.entityColumnTypeInfos().firstOrNull();
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
        };
        SearchControl.prototype.entityColumn = function () {
            return this.state.queryDescription.columns["Entity"];
        };
        SearchControl.prototype.entityColumnTypeInfos = function () {
            return Reflection_1.getTypeInfos(this.entityColumn().type);
        };
        SearchControl.prototype.canFilter = function () {
            var fo = this.state.findOptions;
            return fo.showHeader && (fo.showFilterButton || fo.showFilters);
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
        SearchControl.prototype.render = function () {
            var fo = this.state.findOptions;
            if (!fo)
                return null;
            var SFB = this.props.simpleFilterBuilder;
            return (React.createElement("div", {"className": "sf-search-control SF-control-container"}, SFB && React.createElement("div", {"className": "simple-filter-builder"}, React.createElement(SFB, {"findOptions": fo})), fo.showHeader && fo.showFilters && React.createElement(FilterBuilder_1.default, {"queryDescription": this.state.queryDescription, "filterOptions": fo.filterOptions, "subTokensOptions": FindOptions_1.SubTokensOptions.CanAnyAll | FindOptions_1.SubTokensOptions.CanElement}), fo.showHeader && this.renderToolBar(), React.createElement("div", {"className": "sf-search-results-container table-responsive"}, React.createElement("table", {"className": "sf-search-results table table-hover table-condensed", "onContextMenu": this.handleOnContextMenu}, React.createElement("thead", null, this.renderHeaders()), React.createElement("tbody", null, this.renderRows()))), fo.showFooter && React.createElement(PaginationSelector_1.default, {"pagination": fo.pagination, "onPagination": this.handlePagination, "resultTable": this.state.resultTable}), this.state.contextualMenu && this.renderContextualMenu()));
        };
        SearchControl.prototype.renderToolBar = function () {
            var fo = this.state.findOptions;
            return React.createElement("div", {"className": "sf-query-button-bar btn-toolbar"}, fo.showFilterButton && React.createElement("a", {"className": "sf-query-button sf-filters-header btn btn-default" + (fo.showFilters ? " active" : ""), "onClick": this.handleToggleFilters, "title": fo.showFilters ? Signum_Entities_1.JavascriptMessage.hideFilters.niceToString() : Signum_Entities_1.JavascriptMessage.showFilters.niceToString()}, React.createElement("span", {"className": "glyphicon glyphicon glyphicon-filter"})), React.createElement("button", {"className": "sf-query-button sf-search btn btn-primary" + (this.state.loading ? " disabled" : ""), "onClick": this.handleSearch}, Signum_Entities_1.SearchMessage.Search.niceToString(), " "), fo.create && React.createElement("a", {"className": "sf-query-button btn btn-default sf-line-button sf-create", "title": this.createTitle()}, React.createElement("span", {"className": "glyphicon glyphicon-plus"})), this.props.showContextMenu != false && this.renderSelecterButton(), Finder.ButtonBarQuery.getButtonBarElements(fo.queryName), this.props.avoidFullScreenButton != true &&
                React.createElement("a", {"className": "sf-query-button btn btn-default", "href": "#"}, React.createElement("span", {"className": "glyphicon glyphicon-new-window"})));
        };
        SearchControl.prototype.createTitle = function () {
            var tis = this.entityColumnTypeInfos();
            var types = tis.map(function (ti) { return ti.niceName; }).join(", ");
            var gender = tis.first().gender;
            return Signum_Entities_1.SearchMessage.CreateNew0_G.niceToString().forGenderAndNumber(gender).formatWith(types);
        };
        SearchControl.prototype.loadMenuItems = function () {
            var _this = this;
            ContextualItems_1.getContextualItems({ lites: this.state.selectedRows.map(function (a) { return a.entity; }), queryDescription: this.state.queryDescription })
                .then(function (menuItems) { return _this.setState({ selectedMenuItems: menuItems }); });
        };
        SearchControl.prototype.renderSelecterButton = function () {
            var title = Signum_Entities_1.JavascriptMessage.Selected.niceToString() + " (" + this.state.selectedRows.length + ")";
            return React.createElement(react_bootstrap_1.DropdownButton, {"id": "selectedButton", "className": "sf-query-button sf-tm-selected", "title": title, "onToggle": this.handleSelectedToggle, "disabled": this.state.selectedRows.length == 0}, this.state.selectedMenuItems == null ? React.createElement(react_bootstrap_1.MenuItem, {"className": "sf-tm-selected-loading"}, Signum_Entities_1.JavascriptMessage.loading.niceToString()) :
                this.state.selectedMenuItems.length == 0 ? React.createElement(react_bootstrap_1.MenuItem, {"className": "sf-search-ctxitem-no-results"}, Signum_Entities_1.JavascriptMessage.noActionsFound.niceToString()) :
                    this.state.selectedMenuItems.map(function (e, i) { return React.cloneElement(e, { key: i }); }));
        };
        SearchControl.prototype.renderContextualMenu = function () {
            var cm = this.state.contextualMenu;
            var fo = this.state.findOptions;
            var menuItems = [];
            if (this.canFilter() && cm.columnIndex != null)
                menuItems.push(React.createElement(react_bootstrap_1.MenuItem, {"className": "sf-quickfilter-header", "onClick": this.handleQuickFilter}, Signum_Entities_1.JavascriptMessage.addFilter.niceToString()));
            if (cm.rowIndex == null || fo.allowChangeColumns) {
                menuItems.push(React.createElement(react_bootstrap_1.MenuItem, {"className": "sf-edit-header", "onClick": this.handleQuickFilter}, Signum_Entities_1.JavascriptMessage.editColumn.niceToString()));
                menuItems.push(React.createElement(react_bootstrap_1.MenuItem, {"className": "sf-remove-header", "onClick": this.handleQuickFilter}, Signum_Entities_1.JavascriptMessage.removeColumn.niceToString()));
            }
            if (cm.rowIndex != null && this.state.selectedMenuItems) {
                if (menuItems.length && this.state.selectedMenuItems.length)
                    menuItems.push(React.createElement(react_bootstrap_1.MenuItem, {"divider": true}));
                menuItems.splice.apply(menuItems, [menuItems.length, 0].concat(this.state.selectedMenuItems));
            }
            return React.createElement(ContextualItems_1.ContextMenu, {"position": cm.position, "onHide": this.handleContextOnHide}, menuItems.map(function (e, i) { return React.cloneElement(e, { key: i }); }));
        };
        //SELECTED ROWS
        SearchControl.prototype.allSelected = function () {
            return this.state.resultTable && this.state.resultTable.rows.length && this.state.resultTable.rows.length == this.state.selectedRows.length;
        };
        SearchControl.prototype.notifySelectedRowsChanged = function () {
            if (this.props.onSelectionChanged)
                this.props.onSelectionChanged(this.state.selectedRows.map(function (a) { return a.entity; }));
        };
        SearchControl.prototype.getOffset = function (pageX, rect) {
            var width = rect.width;
            var offsetX = pageX - rect.left;
            if (width < 100 ? (offsetX < (width / 2)) : (offsetX < 50))
                return 0;
            if (width < 100 ? (offsetX > (width / 2)) : (offsetX > (width - 50)))
                return 1;
            return null;
        };
        SearchControl.prototype.renderHeaders = function () {
            var _this = this;
            return React.createElement("tr", null, this.props.allowSelection && React.createElement("th", {"className": "sf-th-selection"}, React.createElement("input", {"type": "checkbox", "id": "cbSelectAll", "onClick": this.handleToggleAll, "checked": this.allSelected()})), this.state.findOptions.navigate && React.createElement("th", {"className": "sf-th-entity"}), this.state.findOptions.columnOptions.map(function (co, i) {
                return React.createElement("th", {"draggable": true, "style": i == _this.state.dragColumnIndex ? { opacity: 0.5 } : null, "className": (i == _this.state.dropBorderIndex ? "drag-left " : i == _this.state.dropBorderIndex - 1 ? "drag-right " : ""), "data-column-name": co.token.fullKey, "data-column-index": i, "key": i, "onClick": _this.handleHeaderClick, "onDragStart": _this.handleHeaderDragStart, "onDragEnd": _this.handleHeaderDragEnd, "onDragOver": _this.handlerHeaderDragOver, "onDragEnter": _this.handlerHeaderDragOver, "onDrop": _this.handleHeaderDrop}, React.createElement("span", {"className": "sf-header-sort " + _this.orderClassName(co)}), React.createElement("span", null, " ", co.displayName));
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
            var columns = this.state.findOptions.columnOptions.map(function (co) { return ({
                columnOption: co,
                cellFormatter: (qs && qs.formatters && qs.formatters[co.token.fullKey]) || Finder.formatRules.filter(function (a) { return a.isApplicable(co); }).last("FormatRules").formatter(co),
                resultIndex: _this.state.resultTable.columns.indexOf(co.token.fullKey)
            }); });
            var rowAttributes = qs && qs.rowAttributes;
            return this.state.resultTable.rows.map(function (row, i) {
                return React.createElement("tr", React.__spread({"key": i, "data-row-index": i, "data-entity": Signum_Entities_1.liteKey(row.entity)}, rowAttributes ? rowAttributes(row, _this.state.resultTable.columns) : null, {"style": { opacity: _this.state.usedRows.some(function (s) { return row === s; }) ? 0.5 : 1 }}), _this.props.allowSelection &&
                    React.createElement("td", {"style": { textAlign: "center" }}, React.createElement("input", {"type": "checkbox", "className": "sf-td-selection", "checked": _this.state.selectedRows.contains(row), "onChange": _this.handleChecked, "data-index": i})), _this.state.findOptions.navigate &&
                    React.createElement("td", null, ((qs && qs.entityFormatter) || Finder.entityFormatRules.filter(function (a) { return a.isApplicable(row); }).last("EntityFormatRules").formatter)(row)), columns.map(function (c, j) {
                    return React.createElement("td", {"key": j, "data-column-index": j, "style": { textAlign: c.cellFormatter.textAllign }}, c.resultIndex == -1 ? null : c.cellFormatter.formatter(row.columns[c.resultIndex]));
                }));
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
});
//# sourceMappingURL=SearchControl.js.map