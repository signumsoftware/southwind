/// <reference path="../../framework/signum.react/scripts/globals.ts" />
/// <reference path="../../extensions/signum.react.extensions/authorization/authclient.tsx" />
define(["require", "exports", "react", "react-dom", "react-router", "Extensions/Signum.React.Extensions/Authorization/AuthClient", "Framework/Signum.React/Scripts/Reflection", "Framework/Signum.React/Scripts/Navigator", "Framework/Signum.React/Scripts/Finder", 'history', 'Templates/Index', 'Templates/About', 'Templates/Home', 'Templates/View', 'Templates/Person', 'Templates/Company', 'Templates/NotFound'], function (require, exports, React, react_dom_1, react_router_1, AuthClient, Reflection, Navigator, Finder, History, Index_1, About_1, Home_1, View_1, Person_1, Company_1, NotFound_1) {
    Reflection.loadTypes().then(function () {
        var routes = [];
        routes.push(React.createElement(react_router_1.IndexRoute, {"component": Home_1.default}));
        routes.push(React.createElement(react_router_1.Route, {"path": "home", "component": Home_1.default}));
        Navigator.start({ routes: routes });
        Finder.start({ routes: routes });
        AuthClient.start({ routes: routes, userTicket: true, resetPassword: true });
        routes.push(React.createElement(react_router_1.Route, {"path": "about", "component": About_1.default}));
        routes.push(React.createElement(react_router_1.Route, {"path": "view", "component": View_1.default}, React.createElement(react_router_1.Route, {"path": "company/:id", "component": Company_1.default}), React.createElement(react_router_1.Route, {"path": "person/:id", "component": Person_1.default}), React.createElement(react_router_1.Route, {"path": "*", "component": NotFound_1.default})));
        routes.push(React.createElement(react_router_1.Route, {"path": "*", "component": NotFound_1.default}));
        routes.push(React.createElement(react_router_1.Redirect, {"from": "company", "to": "about"}));
        var history = History.useQueries(History.useBasename(History.createHistory))({
            basename: window["__baseUrl"]
        });
        Navigator.currentHistory = history;
        var mainRoute = React.createElement.apply(React, [react_router_1.Route, { component: Index_1.default }].concat(routes));
        react_dom_1.render(React.createElement(react_router_1.Router, {"history": history}, React.createElement(react_router_1.Route, {"component": Index_1.default, "path": "/"}, " ", routes)), document.getElementById("wrap"));
    });
});
//# sourceMappingURL=Main.js.map