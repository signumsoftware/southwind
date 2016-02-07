﻿/// <reference path="../../framework/signum.react/scripts/globals.ts" />
import * as React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { Router, Route, Redirect, IndexRoute, useRouterHistory } from "react-router"


import * as moment from "moment"

import * as Reflection from "../../Framework/Signum.React/Scripts/Reflection"
import * as Navigator from "../../Framework/Signum.React/Scripts/Navigator"
import * as Operations from "../../Framework/Signum.React/Scripts/Operations"
import * as Finder from "../../Framework/Signum.React/Scripts/Finder"
import * as Servs from "../../Framework/Signum.React/Scripts/Services"
import Notify from "../../Framework/Signum.React/Scripts/Frames/Notify"

import * as ExceptionClient from "../../Framework/Signum.React/Scripts/Exceptions/ExceptionClient"
import * as AuthClient from "../../Extensions/Signum.React.Extensions/Authorization/AuthClient"

import * as History from 'history'

import Index from '../Templates/Index'
import PublicCatalog from '../Templates/PublicCatalog'
import Home from '../Templates/Home'
import NotFound from '../Templates/NotFound'

import * as ConfigureReactWidgets from "../../Framework/Signum.React/Scripts/ConfigureReactWidgets"

require("!style!css!less!../node_modules/bootstrap/less/bootstrap.less");
require("../Content/site.css");

declare var __webpack_public_path__;

__webpack_public_path__ = window["__baseUrl"] + "/dist/";



ConfigureReactWidgets.asumeGlobalUtcMode(moment, false);
ConfigureReactWidgets.configure();


function reload() {

    Servs.notifyPendingRequests = pending => {
        if (Notify.singletone)
            Notify.singletone.notifyPendingRequest(pending);
    }

    Reflection.requestTypes().then(types => {
        Reflection.setTypes(types);
        
        return AuthClient.Api.retrieveCurrentUser();
    }).then(user => {

        AuthClient.setCurrentUser(user);

        const isFull = !!AuthClient.currentUser();

        var routes: JSX.Element[] = [];

        routes.push(<IndexRoute component={PublicCatalog} />);
        routes.push(<Route path="home" component={Home} />);
        routes.push(<Route path="publicCatalog" component={PublicCatalog} />);
        AuthClient.startPublic({ routes, userTicket: true, resetPassword: true });

        if (isFull) {
            Operations.start();

            Navigator.start({ routes });
            
            Finder.start({ routes });

            ExceptionClient.start({ routes });

            AuthClient.startAdmin();
        }

        routes.push(<Route path="*" component={NotFound}/>);

        var history = useRouterHistory(History.createHistory)({
            basename: window["__baseUrl"]
        });
        
        Navigator.currentHistory = history;

        var mainRoute = React.createElement(Route as any, { component: Index }, ...routes);

        var wrap = document.getElementById("wrap");
        unmountComponentAtNode(wrap);
        render(
            <Router history={history}>
                <Route component={Index} path="/" > { routes }</Route>
            </Router>, wrap);
    });

}

AuthClient.onLogin = () => {

    reload();
    Navigator.currentHistory.push("/home");
};

reload();


