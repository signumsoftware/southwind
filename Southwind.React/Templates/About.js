/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'react-bootstrap', "Framework/Signum.React/Scripts/Modals"], function (require, exports, React, react_bootstrap_1, Modals_1) {
    var About = (function (_super) {
        __extends(About, _super);
        function About() {
            _super.call(this, {});
            this.state = { modals: [] };
        }
        About.prototype.handleClick = function () {
            var _this = this;
            Modals_1.openPopup(React.createElement(react_bootstrap_1.Modal, {"onHide": null}, React.createElement(react_bootstrap_1.Modal.Header, {"closeButton": true}, React.createElement(react_bootstrap_1.Modal.Title, null, "Modal heading")), React.createElement(react_bootstrap_1.Modal.Body, null, React.createElement("h4", null, "Overflowing text to show scroll behavior"), React.createElement("p", null, "Cras mattis consectetur purus sit amet fermentum.Cras justo odio, dapibus ac facilisis in, egestas eget quam.Morbi leo risus, porta ac consectetur ac, vestibulum at eros."), React.createElement(react_bootstrap_1.Button, {"onClick": function () { return _this.handleClick(); }}, "Open Modal"))));
        };
        About.prototype.render = function () {
            var _this = this;
            return (React.createElement("div", null, React.createElement("p", null, "Click to get the full Modal experience!"), React.createElement(react_bootstrap_1.Button, {"bsStyle": "primary", "bsSize": "large", "onClick": function () { return _this.handleClick(); }}, "Launch demo modal")));
        };
        return About;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = About;
});
//# sourceMappingURL=About.js.map