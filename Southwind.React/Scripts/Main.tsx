/// <reference path="../../framework/signum.react/scripts/globals.ts" />
/// <reference path="../../extensions/signum.react.extensions/authorization/authclient.tsx" />

import * as React from "react"
import { render } from "react-dom"
import { Router, Route, Redirect, IndexRoute } from "react-router"

import * as AuthClient from "Extensions/Signum.React.Extensions/Authorization/AuthClient"
import * as Reflection from "Framework/Signum.React/Scripts/Reflection"
import * as Navigator from "Framework/Signum.React/Scripts/Navigator"
import * as Finder from "Framework/Signum.React/Scripts/Finder"

import * as History from 'history'

import Index from 'Templates/Index'
import About from 'Templates/About'
import Home from 'Templates/Home'
import View from 'Templates/View'
import Person from 'Templates/Person'
import Company from 'Templates/Company'
import NotFound from 'Templates/NotFound'

Reflection.loadTypes().then(() => {
    var routes: JSX.Element[] = [];

    routes.push(<IndexRoute component={Home} />);
    routes.push(<Route path="home" component={Home} />);

    Navigator.start({ routes });
    Finder.start({ routes });

    AuthClient.start({ routes, userTicket: true, resetPassword: true });

    routes.push(<Route path="about" component={About} />);
    routes.push(<Route path="view" component={View}>
    <Route path="company/:id" component={Company} />
    <Route path="person/:id" component={Person} />
    <Route path="*" component={NotFound}/>
        </Route>);
    routes.push(<Route path="*" component={NotFound}/>);
    routes.push(<Redirect from="company" to="about" />);

    var history = History.useQueries(History.useBasename(History.createHistory))({
        basename: window["__baseUrl"]
    });

    Navigator.currentHistory = history;

    var mainRoute = React.createElement(Route as any, { component: Index }, ...routes);

    render(
        <Router history={history}>
        <Route component={Index} path="/" > { routes }</Route>
            </Router>, document.getElementById("wrap"));
});


