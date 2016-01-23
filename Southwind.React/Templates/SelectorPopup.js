var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'react-bootstrap', 'Framework/Signum.React/Scripts/Modals', 'Framework/Signum.React/Scripts/Signum.Entities'], function (require, exports, React, react_bootstrap_1, Modals_1, Signum_Entities_1) {
    var SelectorPopup = (function (_super) {
        __extends(SelectorPopup, _super);
        function SelectorPopup(props) {
            var _this = this;
            _super.call(this, props);
            this.handleButtonClicked = function (val) {
                _this.selectedValue = val;
                _this.setState({ show: false });
            };
            this.handleCancelClicked = function () {
                _this.setState({ show: false });
            };
            this.handleOnExited = function () {
                _this.props.onExited(_this.selectedValue);
            };
            this.state = { show: true };
        }
        SelectorPopup.prototype.render = function () {
            var _this = this;
            return React.createElement(react_bootstrap_1.Modal, {"bsSize": "lg", "onHide": this.handleCancelClicked, "show": this.state.show, "onExited": this.handleOnExited}, React.createElement(react_bootstrap_1.Modal.Header, {"closeButton": true}, React.createElement("h4", {"className": "modal-title"}, this.props.title)), React.createElement(react_bootstrap_1.Modal.Body, null, React.createElement("div", null, this.props.options.map(function (o, i) {
                return React.createElement("button", {"key": i, "type": "button", "onClick": function () { return _this.handleButtonClicked(o.value); }, "className": "sf-chooser-button sf-close-button btn btn-default"}, o.displayName);
            }))));
        };
        SelectorPopup.chooseElement = function (options, display, title) {
            if (options.length == 1)
                return Promise.resolve(options.single());
            return Modals_1.openModal(React.createElement(SelectorPopup, {"options": options.map(function (a) { return ({ value: a, displayName: display(a) }); }), "title": title || Signum_Entities_1.SelectorMessage.PleaseSelectAnElement.niceToString()}));
        };
        SelectorPopup.chooseType = function (options, title) {
            return SelectorPopup.chooseElement(options, function (a) { return a.niceName; }, title || Signum_Entities_1.SelectorMessage.PleaseSelectAType.niceToString());
        };
        return SelectorPopup;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SelectorPopup;
});
//# sourceMappingURL=SelectorPopup.js.map