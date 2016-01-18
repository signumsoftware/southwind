var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Templates/SearchControl/QueryTokenBuilder'], function (require, exports, React, QueryTokenBuilder_1) {
    var ColumnEditor = (function (_super) {
        __extends(ColumnEditor, _super);
        function ColumnEditor() {
            var _this = this;
            _super.apply(this, arguments);
            this.handleTokenChanged = function (newToken) {
                _this.props.columnOption.token = newToken;
                _this.props.onChange();
            };
            this.handleOnChange = function (event) {
                _this.props.columnOption.displayName = event.currentTarget.value;
                _this.props.onChange();
            };
        }
        ColumnEditor.prototype.render = function () {
            return React.createElement("div", {"className": "sf-column-editor"}, React.createElement(QueryTokenBuilder_1.default, {"queryToken": this.props.columnOption.token, "onTokenChange": this.handleTokenChanged, "queryKey": this.props.queryDescription.queryKey, "subTokenOptions": this.props.subTokensOptions, "readOnly": false}), React.createElement("input", {"className": "form-control", "value": this.props.columnOption.displayName, "placeholder": this.props.columnOption.token.niceName, "onChange": this.handleOnChange}));
        };
        return ColumnEditor;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ColumnEditor;
});
//# sourceMappingURL=ColumnEditor.js.map