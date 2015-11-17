/// <reference path="../../framework/signum.react/scripts/globals.ts" />

import * as React from 'react'
import {render} from 'react-dom'
import { Router, Route, Redirect, IndexRoute } from 'react-router'

import * as History from 'history'

import Index from 'Templates/Index'
import About from 'Templates/About'
import Home from 'Templates/Home'
import View from 'Templates/View'
import Person from 'Templates/Person'
import Company from 'Templates/Company'
import NotFound from 'Templates/NotFound'

var routes = [];

routes.push(<IndexRoute component={Home} />);
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

var mainRoute = React.createElement(Route, { component: Index }, ...routes);

render(
    <Router history={history}>
        <Route component={Index} > { routes }</Route>
        </Router>, document.getElementById("wrap"));


