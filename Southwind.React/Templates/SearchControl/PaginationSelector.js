var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/QuerySettings', 'Framework/Signum.React/Scripts/FindOptions', 'Framework/Signum.React/Scripts/Signum.Entities', 'react-bootstrap'], function (require, exports, React, QuerySettings_1, FindOptions_1, Signum_Entities_1, react_bootstrap_1) {
    var PaginationSelector = (function (_super) {
        __extends(PaginationSelector, _super);
        function PaginationSelector(props) {
            var _this = this;
            _super.call(this, props);
            this.handleMode = function (e) {
                var mode = e.currentTarget.value;
                var p = {
                    mode: mode,
                    elementsPerPage: mode != FindOptions_1.PaginationMode.All ? QuerySettings_1.defaultPagination.elementsPerPage : null,
                    currentPage: mode == FindOptions_1.PaginationMode.Paginate ? 1 : null
                };
                _this.props.onPagination(p);
            };
            this.handleElementsPerPage = function (e) {
                var p = extend({}, _this.props.pagination, { elementsPerPage: parseInt(e.currentTarget.value) });
                _this.props.onPagination(p);
            };
            this.handlePageClick = function (e, page) {
                var p = extend({}, _this.props.pagination, { currentPage: page.eventKey });
                _this.props.onPagination(p);
            };
            this.state = {};
        }
        PaginationSelector.prototype.render = function () {
            if (!this.props.pagination)
                return null;
            return (React.createElement("div", {"className": "sf-search-footer"}, React.createElement("div", {"className": "sf-pagination-left"}, this.renderLeft()), this.renderCenter(), React.createElement("div", {"className": "sf-pagination-right"}, this.renderRight())));
        };
        PaginationSelector.prototype.renderLeft = function () {
            var resultTable = this.props.resultTable;
            if (!resultTable)
                return null;
            var pagination = this.props.pagination;
            switch (pagination.mode) {
                case FindOptions_1.PaginationMode.All:
                    return React.createElement("span", null, Signum_Entities_1.SearchMessage._0Results_N.niceToString().forGenderAndNumber(resultTable.totalElements).formatHtml(React.createElement("span", {"className": "sf-pagination-strong"}, resultTable.totalElements)));
                case FindOptions_1.PaginationMode.Firsts:
                    return React.createElement("span", null, Signum_Entities_1.SearchMessage.First0Results_N.niceToString().forGenderAndNumber(resultTable.rows.length).formatHtml(React.createElement("span", {"className": "sf-pagination-strong" + (resultTable.rows.length == resultTable.pagination.elementsPerPage ? " sf-pagination-overflow" : "")}, resultTable.rows.length)));
                case FindOptions_1.PaginationMode.Paginate:
                    return React.createElement("span", null, Signum_Entities_1.SearchMessage._01of2Results_N.niceToString().forGenderAndNumber(resultTable.totalElements).formatHtml(React.createElement("span", {"className": "sf-pagination-strong"}, FindOptions_1.PaginateMath.startElementIndex(pagination)), React.createElement("span", {"className": "sf-pagination-strong"}, FindOptions_1.PaginateMath.endElementIndex(pagination, resultTable.rows.length)), React.createElement("span", {"className": "sf-pagination-strong"}, resultTable.totalElements)));
            }
        };
        PaginationSelector.prototype.renderCenter = function () {
            return React.createElement("div", {"className": "sf-pagination-center form-inline form-xs"}, React.createElement(react_bootstrap_1.Input, {"type": "select", "value": this.props.pagination.mode, "onChange": this.handleMode, "ref": "mode", "standalone": true}, [FindOptions_1.PaginationMode.Paginate, FindOptions_1.PaginationMode.Firsts, FindOptions_1.PaginationMode.All].map(function (mode) {
                return React.createElement("option", {"key": mode, "value": mode.toString()}, Signum_Entities_1.DynamicQuery.PaginationMode_Type.niceName(mode));
            })), React.createElement(react_bootstrap_1.Input, {"type": "select", "value": this.props.pagination.elementsPerPage, "onChange": this.handleElementsPerPage, "ref": "elementsPerPage", "standalone": true}, [5, 10, 20, 50, 100, 200].map(function (elem) {
                return React.createElement("option", {"key": elem, "value": elem.toString()}, elem);
            })));
        };
        PaginationSelector.prototype.renderRight = function () {
            var resultTable = this.props.resultTable;
            if (!resultTable || resultTable.pagination.mode != FindOptions_1.PaginationMode.Paginate)
                return null;
            var totalPages = FindOptions_1.PaginateMath.totalPages(resultTable.pagination, resultTable.totalElements);
            return React.createElement(react_bootstrap_1.Pagination, {"activePage": resultTable.pagination.currentPage, "items": totalPages, "ellipsis": true, "maxButtons": 8, "first": true, "last": true, "onSelect": this.handlePageClick});
        };
        return PaginationSelector;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = PaginationSelector;
});
//# sourceMappingURL=PaginationSelector.js.map