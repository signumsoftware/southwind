/// <reference path="../../framework/signum.react/scripts/globals.ts" />
/// <reference path="../../extensions/signum.react.extensions/authorization/authclient.tsx" />
define(["require", "exports", "react", "react-dom", "react-router", "moment", "Framework/Signum.React/Scripts/Reflection", "Framework/Signum.React/Scripts/Navigator", "Framework/Signum.React/Scripts/Finder", "Framework/Signum.React/Exceptions/ExceptionClient", "Extensions/Signum.React.Extensions/Authorization/AuthClient", 'history', 'Templates/Index', 'Templates/About', 'Templates/Home', 'Templates/NotFound'], function (require, exports, React, react_dom_1, react_router_1, moment, Reflection, Navigator, Finder, ExceptionClient, AuthClient, History, Index_1, About_1, Home_1, NotFound_1) {
    asumeGlobalUtcMode(moment, false);
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
        var history = History.useQueries(History.useBasename(History.createHistory))({
            basename: window["__baseUrl"]
        });
        Navigator.currentHistory = history;
        var mainRoute = React.createElement.apply(React, [react_router_1.Route, { component: Index_1.default }].concat(routes));
        react_dom_1.render(React.createElement(react_router_1.Router, {"history": history}, React.createElement(react_router_1.Route, {"component": Index_1.default, "path": "/"}, " ", routes)), document.getElementById("wrap"));
    });
});
//# sourceMappingURL=Main.js.map