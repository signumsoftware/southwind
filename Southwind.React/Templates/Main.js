/// <reference path="../../framework/signum.react/typings/react-router/react-router.d.ts" />
define(["require", "exports", 'react', 'react-router', 'Templates/Index', 'Templates/About', 'Templates/Home', 'Templates/View', 'Templates/Person', 'Templates/Company', 'Templates/NotFound'], function (require, exports, React, Router, Index_1, About_1, Home_1, View_1, Person_1, Company_1, NotFound_1) {
    var Route = Router.Route, DefaultRoute = Router.DefaultRoute, NotFoundRoute = Router.NotFoundRoute, Redirect = Router.Redirect;
    var routes = [];
    routes.push(React.createElement(DefaultRoute, {"handler": Home_1.default}));
    var mainRoute = (React.createElement(Route, {"handler": Index_1.default, "path": "/Southwind.React/"}, routes, React.createElement(Route, {"name": "about", "handler": About_1.default}), React.createElement(Route, {"name": "view", "handler": View_1.default}, React.createElement(Route, {"name": "company", "path": "company/:id", "handler": Company_1.default}), React.createElement(Route, {"name": "person", "path": "person/:id", "handler": Person_1.default}), React.createElement(NotFoundRoute, {"handler": NotFound_1.default})), React.createElement(NotFoundRoute, {"handler": NotFound_1.default}), React.createElement(Redirect, {"from": "company", "to": "about"})));
    Router.run(mainRoute, Router.HistoryLocation, function (Root, s) { return React.render(React.createElement(Root, null), document.body); });
});
//# sourceMappingURL=Main.js.map