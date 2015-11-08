/// <reference path="../../framework/signum.react/typings/react-router/react-router.d.ts" />
/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'react-router'], function (require, exports, React, react_router_1) {
    var Index = (function (_super) {
        __extends(Index, _super);
        function Index() {
            _super.apply(this, arguments);
        }
        Index.prototype.render = function () {
            return (React.createElement("body", null, React.createElement("div", {"id": "wrap"}, React.createElement("header", {"className": "navbar navbar-default navbar-static"}, React.createElement("div", {"className": "container"}, React.createElement("div", {"className": "navbar-header"}, React.createElement("button", {"type": "button", "className": "navbar-toggle", "data-toggle": "collapse", "data-target": ".navbar-collapse"}, React.createElement("span", {"className": "sr-only"}, "Toggle navigation"), React.createElement("span", {"className": "icon-bar"}), React.createElement("span", {"className": "icon-bar"}), React.createElement("span", {"className": "icon-bar"}))), React.createElement("div", {"className": "navbar-collapse collapse"}, React.createElement("ul", {"className": "nav navbar-nav"}, React.createElement("li", null, React.createElement(react_router_1.Link, {"to": "/"}, "Home")), React.createElement("li", null, React.createElement(react_router_1.Link, {"to": "/about"}, "About")), React.createElement("li", null, React.createElement(react_router_1.Link, {"to": "/view/company", "params": { id: "123" }}, "Company")), React.createElement("li", null, React.createElement(react_router_1.Link, {"to": "/view/person", "params": { id: "ABC" }}, "Person"))), React.createElement("ul", {"className": "nav navbar-nav navbar-right"})))), React.createElement("div", {"className": "container"}, React.createElement(react_router_1.RouteHandler, null)), React.createElement("div", {"id": "push"})), React.createElement("div", {"id": "footer"}, React.createElement("div", {"className": "container"}, React.createElement("p", {"className": "text-muted"}, "Made by ", React.createElement("a", {"href": "http://signumsoftware.com/"}, "Signum Software"), "  using ", React.createElement("a", {"href": "http://signumframework.com/"}, "Signum Framework"), ".")))));
        };
        return Index;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Index;
});
//# sourceMappingURL=Index.js.map