/// <reference path="../../framework/signum.react/scripts/globals.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var react_bootstrap_1 = require('react-bootstrap');
var react_router_bootstrap_1 = require('react-router-bootstrap');
var react_router_1 = require('react-router');
var LoginUserControl_1 = require('../../Extensions/Signum.React.Extensions/Authorization/Login/LoginUserControl');
var Modals_1 = require("../../Framework/Signum.React/Scripts/Modals");
var Index = (function (_super) {
    __extends(Index, _super);
    function Index() {
        _super.apply(this, arguments);
    }
    Index.prototype.render = function () {
        return (React.createElement("div", {"id": "main"}, React.createElement(react_bootstrap_1.Navbar, {"inverse": true}, React.createElement(react_bootstrap_1.Navbar.Header, null, React.createElement(react_bootstrap_1.Navbar.Brand, null, React.createElement(react_router_1.Link, {"to": "/"}, "Southwind")), React.createElement(react_bootstrap_1.Navbar.Toggle, null)), React.createElement(react_bootstrap_1.Navbar.Collapse, null, React.createElement(react_bootstrap_1.Nav, null, React.createElement(react_bootstrap_1.NavDropdown, {"eventKey": 3, "title": "Dropdown", "id": "basic-nav-dropdown"}, React.createElement(react_router_bootstrap_1.IndexLinkContainer, {"to": "/"}, React.createElement(react_bootstrap_1.MenuItem, null, "Home")), React.createElement(react_router_bootstrap_1.LinkContainer, {"to": "/find/order"}, React.createElement(react_bootstrap_1.MenuItem, null, "Orders")), React.createElement(react_bootstrap_1.MenuItem, {"divider": true}), React.createElement(react_router_bootstrap_1.LinkContainer, {"to": "/find/exception"}, React.createElement(react_bootstrap_1.MenuItem, null, "Exceptions")))), React.createElement(react_bootstrap_1.Nav, {"pullRight": true}, React.createElement(LoginUserControl_1.default, null)))), React.createElement("div", {"className": "container"}, this.props.children), React.createElement(Modals_1.GlobalModalContainer, null), React.createElement("div", {"id": "push"})));
    };
    return Index;
})(React.Component);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Index;
//# sourceMappingURL=Index.js.map