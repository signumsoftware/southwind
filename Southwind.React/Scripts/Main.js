/// <reference path="../../framework/signum.react/scripts/globals.ts" />
var React = require("react");
var react_dom_1 = require("react-dom");
var react_router_1 = require("react-router");
var moment = require("moment");
var Reflection = require("../../Framework/Signum.React/Scripts/Reflection");
var Navigator = require("../../Framework/Signum.React/Scripts/Navigator");
var Finder = require("../../Framework/Signum.React/Scripts/Finder");
var ExceptionClient = require("../../Framework/Signum.React/Scripts/Exceptions/ExceptionClient");
var AuthClient = require("../../Extensions/Signum.React.Extensions/Authorization/AuthClient");
var History = require('history');
var Index_1 = require('../Templates/Index');
var About_1 = require('../Templates/About');
var Home_1 = require('../Templates/Home');
var NotFound_1 = require('../Templates/NotFound');
var ConfigureReactWidgets = require("../../Framework/Signum.React/Scripts/ConfigureReactWidgets");
require("!style!css!less!../node_modules/bootstrap/less/bootstrap.less");
require("../Content/site.css");
__webpack_public_path__ = window["__baseUrl"] + "/dist/";
ConfigureReactWidgets.asumeGlobalUtcMode(moment, false);
ConfigureReactWidgets.configure();
Reflection.loadTypes().then(function () {
    var routes = [];
    routes.push(React.createElement(react_router_1.IndexRoute, {"component": Home_1.default}));
    routes.push(React.createElement(react_router_1.Route, {"path": "home", "component": Home_1.default}));
    routes.push(React.createElement(react_router_1.Route, {"path": "about", "component": About_1.default}));
    Navigator.start({ routes: routes });
    Finder.start({ routes: routes });
    ExceptionClient.start({ routes: routes });
    AuthClient.start({ routes: routes, userTicket: true, resetPassword: true });
    routes.push(React.createElement(react_router_1.Route, {"path": "*", "component": NotFound_1.default}));
    var history = react_router_1.useRouterHistory(History.createHistory)({
        basename: window["__baseUrl"]
    });
    Navigator.currentHistory = history;
    var mainRoute = React.createElement.apply(React, [react_router_1.Route, { component: Index_1.default }].concat(routes));
    react_dom_1.render(React.createElement(react_router_1.Router, {"history": history}, React.createElement(react_router_1.Route, {"component": Index_1.default, "path": "/"}, " ", routes)), document.getElementById("wrap"));
});
//# sourceMappingURL=Main.js.map