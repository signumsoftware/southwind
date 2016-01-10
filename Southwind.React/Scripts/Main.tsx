/// <reference path="../../framework/signum.react/scripts/globals.ts" />
/// <reference path="../../extensions/signum.react.extensions/authorization/authclient.tsx" />

import * as React from "react"
import { render } from "react-dom"
import { Router, Route, Redirect, IndexRoute } from "react-router"

import  * as moment from "moment"

import * as Reflection from "Framework/Signum.React/Scripts/Reflection"
import * as Navigator from "Framework/Signum.React/Scripts/Navigator"
import * as Finder from "Framework/Signum.React/Scripts/Finder"


import * as ExceptionClient from "Framework/Signum.React/Exceptions/ExceptionClient"
import * as AuthClient from "Extensions/Signum.React.Extensions/Authorization/AuthClient"

import * as History from 'history'

import Index from 'Templates/Index'
import About from 'Templates/About'
import Home from 'Templates/Home'
import NotFound from 'Templates/NotFound'

asumeGlobalUtcMode(moment, false);

Reflection.loadTypes().then(() => {

    var routes: JSX.Element[] = [];

    routes.push(<IndexRoute component={Home} />);
    routes.push(<Route path="home" component={Home} />);
    routes.push(<Route path="about" component={About} />);

    Navigator.start({ routes });
    Finder.start({ routes });

    ExceptionClient.start({ routes });

    AuthClient.start({ routes, userTicket: true, resetPassword: true });
    
    routes.push(<Route path="*" component={NotFound}/>);
    
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


