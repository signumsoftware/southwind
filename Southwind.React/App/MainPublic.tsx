import "./SCSS/custom.scss";
import "../node_modules/react-widgets/scss/styles.scss"
import "./site.css"
import "@framework/Frames/Frames.css"

import * as React from "react"
import { RouteObject } from 'react-router'
import { Localization } from "react-widgets"
import { createRoot, Root } from "react-dom/client"
import { createBrowserRouter, RouterProvider, Location } from "react-router-dom"

import * as luxon from "luxon"

import { NumberFormatSettings, reloadTypes } from "@framework/Reflection"
import * as AppContext from "@framework/AppContext"
import * as Services from "@framework/Services"
import Notify from "@framework/Frames/Notify"
import ErrorModal from "@framework/Modals/ErrorModal"

import * as AuthClient from "@extensions/Authorization/AuthClient"
import * as CultureClient from "@extensions/Translation/CultureClient"


import Layout from './Layout'
import PublicCatalog from './PublicCatalog'
import Home from './Home'
import NotFound from './NotFound'
import LoginPage from '@extensions/Authorization/Login/LoginPage'
import * as AzureAD from '@extensions/Authorization/AzureAD/AzureAD'

import * as PublicClient from './Public/PublicClient'

import * as ConfigureReactWidgets from "@framework/ConfigureReactWidgets"
import { VersionChangedAlert } from "@framework/Frames/VersionChangedAlert"

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

library.add(fas, far);

AppContext.setTitleFunction(pageTitle => document.title = pageTitle ? pageTitle + " - Southwind" : "Southwind");
AppContext.setTitle();


declare let __webpack_public_path__: string;

__webpack_public_path__ = window.__baseName + "/dist/";

const dateLocalizer = ConfigureReactWidgets.getDateLocalizer();
const numberLocalizer = ConfigureReactWidgets.getNumberLocalizer();

Services.NotifyPendingFilter.notifyPendingRequests = pending => {
  Notify.singleton && Notify.singleton.notifyPendingRequest(pending);
}

CultureClient.onCultureLoaded.push(ci => {
  const culture = ci.name!; //"en";

  luxon.Settings.defaultLocale = culture;
  NumberFormatSettings.defaultNumberFormatLocale = culture;
}); //Culture

Services.VersionFilter.versionHasChanged = () => {
  VersionChangedAlert.forceUpdateSingletone && VersionChangedAlert.forceUpdateSingletone();
}

Services.SessionSharing.setAppNameAndRequestSessionStorage("Southwind");

AuthClient.registerUserTicketAuthenticator();
if (window.__azureApplicationId) {
  LoginPage.customLoginButtons = ctx =>
    <>
      <AzureAD.MicrosoftSignIn ctx={ctx} />
    </>;
  LoginPage.showLoginForm = "initially_not";
  AuthClient.authenticators.push(AzureAD.loginWithAzureAD);
}//__azureApplicationId

ErrorModal.register();


let root: Root | undefined = undefined;
async function reload() {
  await AuthClient.autoLogin();
  await reloadTypes();
  await CultureClient.loadCurrentCulture();

  AppContext.clearAllSettings();

  const routes: RouteObject[] = [];

  routes.push({ path: "/publicCatalog", element: <PublicCatalog /> });
  AuthClient.startPublic({ routes, userTicket: true, windowsAuthentication: false, resetPassword: true, notifyLogout: true });
  PublicClient.start({ routes });

  const isFull = Boolean(AuthClient.currentUser()) && AuthClient.currentUser().userName != "Anonymous"; //true;

  if (isFull)
    (await import("./MainAdmin")).startFull(routes);


  const reactDiv = document.getElementById("reactDiv")!;
  if (root)
    root.unmount();

  root = createRoot(reactDiv);

  const mainRoute: RouteObject = {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      ...routes,
      {
        path: "*",
        element: <NotFound />
      },
    ]
  };

  const router = createBrowserRouter([mainRoute], { basename: window.__baseName });

  AppContext.setRouter(router);

  const messages = ConfigureReactWidgets.getMessages();

  root.render(
    <Localization date={dateLocalizer} number={numberLocalizer} messages={messages} >
      <RouterProvider router={router} />
    </Localization>);

  return true;
}

AuthClient.Options.onLogin = (url?: string) => {
  reload().then(() => {
    const back: Location = AppContext.location().state?.back;

    AppContext.navigate(back ?? url ?? "/");
  });
};

AuthClient.Options.onLogout = () => {
  AppContext.navigate("/");
  reload();
};

reload();


