import "../node_modules/bootstrap/dist/css/bootstrap.css"
import "./site.css"
import "@framework/Frames/Frames.css"

import * as React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { Router, Route, Redirect } from "react-router-dom"
import { Switch } from "react-router"

import * as moment from "moment"
import numbro from "numbro"

import { reloadTypes } from "@framework/Reflection"
import * as AppContext from "@framework/AppContext"
import * as Services from "@framework/Services"
import Notify from "@framework/Frames/Notify"
import ErrorModal from "@framework/Modals/ErrorModal"

import * as AuthClient from "@extensions/Authorization/AuthClient"
import * as CultureClient from "@extensions/Translation/CultureClient"

import * as History from 'history'

import Layout from './Layout'
import PublicCatalog from './PublicCatalog'
import Home from './Home'
import NotFound from './NotFound'

import * as ConfigureReactWidgets from "@framework/ConfigureReactWidgets"
import { VersionChangedAlert } from "@framework/Frames/VersionChangedAlert"

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

library.add(fas, far);

AppContext.setTitleFunction(pageTitle => document.title = pageTitle ? pageTitle + " - Southwind" : "Southwind");
AppContext.setTitle();

//require('moment/locale/en');
require('moment/locale/es');

numbro.registerLanguage(require<any>("numbro/dist/languages/en-GB.min"));
numbro.registerLanguage(require<any>("numbro/dist/languages/es-ES.min"));

declare let __webpack_public_path__: string;

__webpack_public_path__ = window.__baseUrl + "dist/";

ConfigureReactWidgets.asumeGlobalUtcMode(moment, false);
ConfigureReactWidgets.configure();

Services.NotifyPendingFilter.notifyPendingRequests = pending => {
  Notify.singleton && Notify.singleton.notifyPendingRequest(pending);
}

CultureClient.onCultureLoaded.push(ci => {
  const culture = ci.name!; //"en";
  moment.locale((culture.tryBefore("-") || culture).toLowerCase());
  numbro.setLanguage(culture == "en" ? "en-GB" :
    culture == "es" ? "es-ES" : "Unkwnown");
}); //Culture

Services.VersionFilter.versionHasChanged = () => {
  VersionChangedAlert.forceUpdateSingletone && VersionChangedAlert.forceUpdateSingletone();
}

Services.SessionSharing.setAppNameAndRequestSessionStorage("Southwind");

AuthClient.registerUserTicketAuthenticator();

window.onerror = (message: Event | string, filename?: string, lineno?: number, colno?: number, error?: Error) => ErrorModal.showAppropriateError(error);


function reload() {
  return AuthClient.autoLogin() //Promise.resolve()
    .then(() => reloadTypes())
    .then(() => CultureClient.loadCurrentCulture())
    .then(() => {

      AppContext.clearAllSettings();

      const routes: JSX.Element[] = [];

      routes.push(<Route exact path="~/" component={Home} />);
      routes.push(<Route path="~/publicCatalog" component={PublicCatalog} />);
      AuthClient.startPublic({ routes, userTicket: true, windowsAuthentication: false, resetPassword: true, notifyLogout: true });

      const isFull = Boolean(AuthClient.currentUser()) && AuthClient.currentUser().userName != "Anonymous"; //true;

      var promise = isFull ?
        import("./MainAdmin").then(main => main.startFull(routes)) :
        Promise.resolve(undefined);

      promise.then(() => {

        routes.push(<Route component={NotFound} />);

        Layout.switch = React.createElement(Switch, undefined, ...routes);
        const reactDiv = document.getElementById("reactDiv")!;
        unmountComponentAtNode(reactDiv);

        var h = AppContext.createAppRelativeHistory();

        render(
          <Router history={h}>
            <Layout />
          </Router>, reactDiv);

        return isFull;
      });
    });
}

AuthClient.Options.onLogin = (url?: string) => {
  reload().then(() => {
    var loc = AppContext.history.location;

    var back: History.Location = loc && loc.state && (loc.state as any).back;

    AppContext.history.push(back ?? url ?? "~/");
  }).done();
};

AuthClient.Options.onLogout = () => {
  AppContext.history.push("~/");
  reload().done();
};

reload();


