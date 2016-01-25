/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var react_bootstrap_1 = require('react-bootstrap');
var Modals_1 = require("../../Framework/Signum.React/Scripts/Modals");
var About = (function (_super) {
    __extends(About, _super);
    function About(props) {
        var _this = this;
        _super.call(this, props);
        //handleOnExited = () => {
        //    this.state.modals.pop();
        //    console.log(this.state.modals.length);
        //    this.forceUpdate();
        //};
        this.handleClick = function () {
            Modals_1.openModal(React.createElement(ModalTest, {"onClick": _this.handleClick})).then(function (val) {
                _this.setState({ str: _this.state.str + " " + val });
            });
            //this.state.modals.push();
            //console.log(this.state.modals.length);
            //this.forceUpdate();
        };
        this.state = { str: "hola" };
    }
    About.prototype.render = function () {
        return (React.createElement("div", null, React.createElement("p", null, "Click to get the full Modal experience!"), React.createElement(react_bootstrap_1.Button, {"bsStyle": "primary", "bsSize": "large", "onClick": this.handleClick}, "Launch demo modal ", this.state.str)));
    };
    return About;
})(React.Component);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = About;
var ModalTest = (function (_super) {
    __extends(ModalTest, _super);
    function ModalTest(props) {
        var _this = this;
        _super.call(this, props);
        this.onHide = function () {
            _this.setState({ shown: false });
        };
        this.state = { shown: true };
    }
    ModalTest.prototype.render = function () {
        var _this = this;
        return React.createElement(react_bootstrap_1.Modal, {"onHide": this.onHide, "show": this.state.shown, "onExited": function () { return _this.props.onExited("hi"); }}, React.createElement(react_bootstrap_1.Modal.Header, {"closeButton": true}, React.createElement(react_bootstrap_1.Modal.Title, null, "Modal heading")), React.createElement(react_bootstrap_1.Modal.Body, null, React.createElement("h4", null, "Overflowing text to show scroll behavior"), React.createElement("p", null, "Cras mattis consectetur purus sit amet fermentum.Cras justo odio, dapibus ac facilisis in, egestas eget quam.Morbi leo risus, porta ac consectetur ac, vestibulum at eros."), React.createElement(react_bootstrap_1.Button, {"bsStyle": "primary", "bsSize": "large", "onClick": this.props.onClick}, "Launch demo modal")));
    };
    return ModalTest;
})(React.Component);
exports.ModalTest = ModalTest;
//# sourceMappingURL=About.js.map