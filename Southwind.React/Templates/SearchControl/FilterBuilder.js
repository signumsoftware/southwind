var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/FindOptions', 'Framework/Signum.React/Scripts/Signum.Entities', 'Framework/Signum.React/Scripts/Lines', 'Framework/Signum.React/Scripts/Reflection', 'Framework/Signum.React/Scripts/TypeContext', 'Templates/SearchControl/QueryTokenBuilder'], function (require, exports, React, FindOptions_1, Signum_Entities_1, Lines_1, Reflection_1, TypeContext_1, QueryTokenBuilder_1) {
    var FilterBuilder = (function (_super) {
        __extends(FilterBuilder, _super);
        function FilterBuilder() {
            var _this = this;
            _super.apply(this, arguments);
            this.handlerNewFilter = function () {
                _this.props.filterOptions.push({
                    token: null,
                    columnName: null,
                    operation: null,
                    value: null,
                });
                _this.forceUpdate();
            };
            this.handlerDeleteFilter = function (filter) {
                _this.props.filterOptions.remove(filter);
                _this.forceUpdate();
            };
        }
        FilterBuilder.prototype.render = function () {
            var _this = this;
            return (React.createElement("div", {"className": "panel panel-default sf-filters form-xs"}, React.createElement("div", {"className": "panel-body sf-filters-list table-responsive", "style": { overflowX: "visible" }}, React.createElement("table", {"className": "table table-condensed"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null), React.createElement("th", {"className": "sf-filter-field-header"}, Signum_Entities_1.SearchMessage.Field.niceToString()), React.createElement("th", null, Signum_Entities_1.SearchMessage.Operation.niceToString()), React.createElement("th", null, Signum_Entities_1.SearchMessage.Value.niceToString()))), React.createElement("tbody", null, this.props.filterOptions.map(function (f, i) { return React.createElement(FilterComponent, {"filter": f, "key": i, "onDeleteFilter": _this.handlerDeleteFilter, "subTokenOptions": _this.props.subTokensOptions, "queryDescription": _this.props.queryDescription}); }), React.createElement("tr", null, React.createElement("td", {"colSpan": 4}, React.createElement("a", {"title": Signum_Entities_1.SearchMessage.AddFilter.niceToString(), "className": "sf-line-button sf-create", "onClick": this.handlerNewFilter}, React.createElement("span", {"className": "glyphicon glyphicon-plus"}), " ", Signum_Entities_1.SearchMessage.AddFilter.niceToString()))))))));
        };
        return FilterBuilder;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FilterBuilder;
    var FilterComponent = (function (_super) {
        __extends(FilterComponent, _super);
        function FilterComponent() {
            var _this = this;
            _super.apply(this, arguments);
            this.handleDeleteFilter = function () {
                _this.props.onDeleteFilter(_this.props.filter);
            };
            this.handleTokenChanged = function (newToken) {
                var f = _this.props.filter;
                if (newToken == null) {
                    f.operation = null;
                    f.value = null;
                }
                else {
                    if (!areEqual(f.token, newToken, function (a) { return a.filterType; })) {
                        var operations = FindOptions_1.filterOperations[newToken.filterType];
                        f.operation = operations && operations.firstOrNull();
                        f.value = null;
                    }
                }
                f.token = newToken;
                _this.forceUpdate();
            };
            this.handleChangeOperation = function (event) {
                _this.props.filter.operation = event.currentTarget.value;
                _this.forceUpdate();
            };
        }
        FilterComponent.prototype.render = function () {
            var f = this.props.filter;
            return React.createElement("tr", null, React.createElement("td", null, !f.frozen &&
                React.createElement("a", {"title": Signum_Entities_1.SearchMessage.DeleteFilter.niceToString(), "className": "sf-line-button sf-remove", "onClick": this.handleDeleteFilter}, React.createElement("span", {"className": "glyphicon glyphicon-remove"}))), React.createElement("td", null, React.createElement(QueryTokenBuilder_1.default, {"queryToken": f.token, "onTokenChange": this.handleTokenChanged, "queryKey": this.props.queryDescription.queryKey, "subTokenOptions": this.props.subTokenOptions, "readOnly": f.frozen})), React.createElement("td", null, f.token && f.operation &&
                React.createElement("select", {"className": "form-control", "value": f.operation, "disabled": f.frozen, "onChange": this.handleChangeOperation}, FindOptions_1.filterOperations[f.token.filterType]
                    .map(function (ft, i) { return React.createElement("option", {"key": i, "value": ft}, Signum_Entities_1.DynamicQuery.FilterOperation_Type.niceName(ft)); }))), React.createElement("td", null, f.token && f.operation && this.renderValue()));
        };
        FilterComponent.prototype.renderValue = function () {
            var f = this.props.filter;
            var ctx = new TypeContext_1.TypeContext(null, { formGroupStyle: TypeContext_1.FormGroupStyle.None, readOnly: f.frozen }, null, new Reflection_1.Binding("value", f));
            switch (f.token.filterType) {
                case FindOptions_1.FilterType.Lite:
                    if (f.token.type.name == Reflection_1.IsByAll || Reflection_1.getTypeInfos(f.token.type).some(function (ti) { return !ti.isLowPopupation; }))
                        return React.createElement(Lines_1.EntityLine, {"ctx": ctx, "type": f.token.type, "create": false});
                    else
                        return React.createElement(Lines_1.EntityCombo, {"ctx": ctx, "type": f.token.type, "create": false});
                case FindOptions_1.FilterType.Embedded:
                    return React.createElement(Lines_1.EntityLine, {"ctx": ctx, "type": f.token.type, "create": false, "autoComplete": false});
                case FindOptions_1.FilterType.Enum:
                    var ti = Reflection_1.getTypeInfos(f.token.type).single();
                    if (!ti)
                        throw new Error("EnumType " + f.token.type.name + " not found");
                    var members = Dic.getValues(ti.members).filter(function (a) { return !a.isIgnored; });
                    return React.createElement(Lines_1.ValueLine, {"ctx": ctx, "type": f.token.type, "formatText": f.token.format, "unitText": f.token.unit, "comboBoxItems": members});
                default:
                    return React.createElement(Lines_1.ValueLine, {"ctx": ctx, "type": f.token.type, "formatText": f.token.format, "unitText": f.token.unit});
            }
        };
        return FilterComponent;
    })(React.Component);
    exports.FilterComponent = FilterComponent;
});
//# sourceMappingURL=FilterBuilder.js.map