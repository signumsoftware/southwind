/// <reference path="../../framework/signum.react/typings/react-router/react-router.d.ts" />

import * as React from 'react'
import * as Router from 'react-router'
var { Route, DefaultRoute, NotFoundRoute, Redirect } = Router;

import Index from 'Templates/Index'
import About from 'Templates/About'
import Home from 'Templates/Home'
import View from 'Templates/View'
import Person from 'Templates/Person'
import Company from 'Templates/Company'
import NotFound from 'Templates/NotFound'


var routes = []; 

routes.push(<DefaultRoute  handler={Home} />);

var mainRoute = (
    <Route handler={Index} path="/Southwind.React/" >
        {routes}
        <Route name="about" handler={About} />
        <Route name="view" handler={View}>
          <Route name="company"  path="company/:id" handler={Company} />
          <Route name="person" path="person/:id" handler={Person} />
          <NotFoundRoute handler={NotFound}/>
        </Route>
        <NotFoundRoute handler={NotFound}/>
        <Redirect from="company" to="about" />
    </Route>
);



Router.run(mainRoute, Router.HistoryLocation, (Root, s) => React.render(<Root/>, document.body));