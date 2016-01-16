var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'react-widgets', 'Framework/Signum.React/Scripts/Finder'], function (require, exports, React, react_widgets_1, Finder) {
    var QueryTokenBuilder = (function (_super) {
        __extends(QueryTokenBuilder, _super);
        function QueryTokenBuilder() {
            _super.apply(this, arguments);
        }
        QueryTokenBuilder.prototype.render = function () {
            var _this = this;
            var tokenList = getTokenList(this.props.queryToken);
            tokenList.push(null);
            return (React.createElement("div", null, tokenList.map(function (a, i) { return React.createElement(QueryTokenPart, {"key": i, "queryKey": _this.props.queryKey, "readOnly": _this.props.readOnly, "onTokenSelected": _this.props.onTokenChange, "subTokenOptions": _this.props.subTokenOptions, "parentToken": i == 0 ? null : tokenList[i - 1], "selectedToken": a}); })));
        };
        return QueryTokenBuilder;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QueryTokenBuilder;
    function getTokenList(token) {
        var result = [];
        while (token != null) {
            result.insertAt(0, token);
            token = token.parent;
        }
        return result;
    }
    var QueryTokenPart = (function (_super) {
        __extends(QueryTokenPart, _super);
        function QueryTokenPart(props) {
            var _this = this;
            _super.call(this, props);
            this.handleOnChange = function (value) {
                _this.props.onTokenSelected(value || _this.props.parentToken);
            };
            this.state = { data: null };
            if (!props.readOnly)
                this.requestSubTokens(props);
        }
        QueryTokenPart.prototype.componentWillReceiveProps = function (newProps) {
            if (!newProps.readOnly && !areEqual(this.props.parentToken, newProps.parentToken, function (a) { return a.fullKey; })) {
                this.setState({ data: null });
                this.requestSubTokens(newProps);
            }
        };
        QueryTokenPart.prototype.requestSubTokens = function (props) {
            var _this = this;
            Finder.API.subTokens(props.queryKey, props.parentToken, props.subTokenOptions).then(function (tokens) {
                return _this.setState({ data: tokens.length == 0 ? tokens : [null].concat(tokens) });
            });
        };
        QueryTokenPart.prototype.render = function () {
            if (this.state.data != null && this.state.data.length == 0)
                return null;
            return React.createElement("div", {"className": "sf-query-token-part"}, React.createElement(react_widgets_1.DropdownList, {"disabled": this.props.readOnly, "filter": "contains", "data": this.state.data || [], "value": this.props.selectedToken, "onChange": this.handleOnChange, "valueField": "fullKey", "textField": "toString", "valueComponent": QueryTokenItem, "itemComponent": QueryTokenOptionalItem, "busy": !this.props.readOnly && this.state.data == null}));
        };
        return QueryTokenPart;
    })(React.Component);
    exports.QueryTokenPart = QueryTokenPart;
    var QueryTokenItem = (function (_super) {
        __extends(QueryTokenItem, _super);
        function QueryTokenItem() {
            _super.apply(this, arguments);
        }
        QueryTokenItem.prototype.render = function () {
            if (this.props.item == null)
                return null;
            return React.createElement("span", {"style": { color: this.props.item.typeColor }, "title": this.props.item.niceTypeName}, this.props.item.toString);
        };
        return QueryTokenItem;
    })(React.Component);
    exports.QueryTokenItem = QueryTokenItem;
    var QueryTokenOptionalItem = (function (_super) {
        __extends(QueryTokenOptionalItem, _super);
        function QueryTokenOptionalItem() {
            _super.apply(this, arguments);
        }
        QueryTokenOptionalItem.prototype.render = function () {
            if (this.props.item == null)
                return React.createElement("span", null, " - ");
            return React.createElement(QueryTokenItem, React.__spread({}, this.props));
        };
        return QueryTokenOptionalItem;
    })(React.Component);
    exports.QueryTokenOptionalItem = QueryTokenOptionalItem;
});
//# sourceMappingURL=QueryTokenBuilder.js.map