var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/QuerySettings', 'Framework/Signum.React/Scripts/FindOptions', 'Framework/Signum.React/Scripts/Signum.Entities'], function (require, exports, React, QuerySettings_1, FindOptions_1, Signum_Entities_1) {
    var SearchResult = (function (_super) {
        __extends(SearchResult, _super);
        function SearchResult(props) {
            _super.call(this, props);
            this.state = { usedRows: [] };
        }
        SearchResult.prototype.handleTogleAll = function () {
        };
        SearchResult.prototype.render = function () {
            var _this = this;
            var orders = this.props.orderOptions.toObjectDistinct(function (a) { return a.token.fullKey; }, function (a) { return a.orderType; });
            return (React.createElement("div", {"className": "sf-search-results-container table-responsive"}, React.createElement("table", {"className": "sf-search-results table table-hover table-condensed"}, React.createElement("thead", null, React.createElement("tr", null, this.props.allowSelection &&
                React.createElement("th", {"className": "sf-th-selection"}, React.createElement("input", {"type": "checkbox", "id": "cbSelectAll", "onClick": function () { return _this.handleTogleAll(); }})), this.props.navigate && React.createElement("th", {"className": "sf-th-entity"}), this.props.columnOptions.map(function (a) {
                return React.createElement("th", {"draggable": true, "data-column-name": a.token.fullKey, "data-column-nicename": a.token.niceName, "key": a.token.fullKey}, React.createElement("span", {"className": "sf-header-sort " +
                    (orders[a.token.fullKey] == FindOptions_1.OrderType.Ascending ? "asc" :
                        orders[a.token.fullKey] == FindOptions_1.OrderType.Descending ? "desc" : "")}), React.createElement("span", null, a.displayName));
            }))), React.createElement("tbody", null, this.renderRows()))));
        };
        SearchResult.prototype.renderRows = function () {
            var _this = this;
            var columnsCount = this.props.columnOptions.length +
                (this.props.allowSelection ? 1 : 0) +
                (this.props.navigate ? 1 : 0);
            if (!this.props.results) {
                return React.createElement("tr", null, React.createElement("td", {"colSpan": columnsCount}, Signum_Entities_1.JavascriptMessage.searchForResults.niceToString()));
            }
            if (this.props.results.rows.length == 0) {
                return React.createElement("tr", null, React.createElement("td", {"colSpan": columnsCount}, Signum_Entities_1.SearchMessage.NoResultsFound.niceToString()));
            }
            var qs = this.props.querySettings;
            var formatters = this.props.columnOptions.map(function (c) {
                return (qs && qs.formatters && qs.formatters[c.token.fullKey]) ||
                    QuerySettings_1.FormatRules.filter(function (a) { return a.isApplicable(c); }).last("FormatRules").formatter(c);
            });
            var rowAttributes = qs && qs.rowAttributes;
            return this.props.results.rows.map(function (row, i) {
                return React.createElement("tr", React.__spread({"key": i, "data-entity": Signum_Entities_1.liteKey(row)}, rowAttributes ? rowAttributes(row, _this.props.results.columns) : null, {"style": { opacity: _this.props.selectedRows.some(function (s) { return Signum_Entities_1.is(row.entity, s); }) ? 0.5 : 1 }}), _this.props.allowSelection && React.createElement("td", {"style": { textAlign: "center" }}, React.createElement("input", {"type": "checkbox", "className": "sf-td-selection"})), _this.props.navigate && React.createElement("td", null, ((qs && qs.entityFormatter) || QuerySettings_1.EntityFormatRules.filter(function (a) { return a.isApplicable(row); }).last("EntityFormatRules").formatter)(row)), _this.props.columnOptions.map(function (c, i) { return React.createElement("td", {"key": i, "style": { textAlign: formatters[i].textAllign }}, formatters[i].formatter(row.columns[i])); }));
            });
        };
        return SearchResult;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SearchResult;
});
//# sourceMappingURL=SearchResult.js.map