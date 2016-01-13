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
                if (typeof value == "string")
                    _this.setState({ value: value });
                else
                    _this.props.onTokenSelected(value || _this.props.parentToken);
            };
            this.state = { data: null, value: null };
            if (!props.readOnly)
                this.requestSubTokens();
        }
        QueryTokenPart.prototype.componentWillReceiveProps = function (newProps) {
            this.setState({ data: null, value: null });
            if (!newProps.readOnly)
                this.requestSubTokens();
        };
        QueryTokenPart.prototype.requestSubTokens = function () {
            var _this = this;
            Finder.API.subTokens(this.props.queryKey, this.props.parentToken, this.props.subTokenOptions).then(function (tokens) {
                return _this.setState({ data: tokens });
            });
        };
        QueryTokenPart.prototype.render = function () {
            if (this.state.data == null || this.state.data.length == 0)
                return null;
            return React.createElement(react_widgets_1.Combobox, {"className": "juas", "disabled": this.props.readOnly, "filter": "contains", "data": this.state.data, "value": this.state.value || this.props.selectedToken, "onChange": this.handleOnChange, "valueField": "fullKey", "textField": "toString"});
        };
        return QueryTokenPart;
    })(React.Component);
    exports.QueryTokenPart = QueryTokenPart;
});
//# sourceMappingURL=QueryTokenBuilder.js.map