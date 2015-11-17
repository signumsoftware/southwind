/// <reference path="../../framework/signum.react/scripts/globals.ts" />
define(["require", "exports", 'react', 'react-dom', 'react-router', 'history', 'Templates/Index', 'Templates/About', 'Templates/Home', 'Templates/View', 'Templates/Person', 'Templates/Company', 'Templates/NotFound'], function (require, exports, React, react_dom_1, react_router_1, History, Index_1, About_1, Home_1, View_1, Person_1, Company_1, NotFound_1) {
    var routes = [];
    routes.push(React.createElement(react_router_1.IndexRoute, {"component": Home_1.default}));
    routes.push(React.createElement(react_router_1.Route, {"path": "about", "component": About_1.default}));
    routes.push(React.createElement(react_router_1.Route, {"path": "view", "component": View_1.default}, React.createElement(react_router_1.Route, {"path": "company/:id", "component": Company_1.default}), React.createElement(react_router_1.Route, {"path": "person/:id", "component": Person_1.default}), React.createElement(react_router_1.Route, {"path": "*", "component": NotFound_1.default})));
    routes.push(React.createElement(react_router_1.Route, {"path": "*", "component": NotFound_1.default}));
    routes.push(React.createElement(react_router_1.Redirect, {"from": "company", "to": "about"}));
    var history = History.useQueries(History.useBasename(History.createHistory))({
        basename: window["__baseUrl"]
    });
    var mainRoute = React.createElement.apply(React, [react_router_1.Route, { component: Index_1.default }].concat(routes));
    react_dom_1.render(React.createElement(react_router_1.Router, {"history": history}, React.createElement(react_router_1.Route, {"component": Index_1.default}, " ", routes)), document.getElementById("wrap"));
});
//# sourceMappingURL=Main.js.map