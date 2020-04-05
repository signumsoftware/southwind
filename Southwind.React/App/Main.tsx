import "../node_modules/bootstrap/dist/css/bootstrap.css";
import "./site.css";
import "@framework/Frames/Frames.css";


import * as React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { Router, Route, Redirect } from "react-router-dom"
import { Switch } from "react-router"

import * as moment from "moment"
import numbro from "numbro"

import { reloadTypes } from "@framework/Reflection"
import * as Navigator from "@framework/Navigator"
import * as Operations from "@framework/Operations"
import * as Finder from "@framework/Finder"
import * as Services from "@framework/Services"
import * as QuickLinks from "@framework/QuickLinks"
import * as SouthwindClient from "./Southwind/SouthwindClient"
import Notify from "@framework/Frames/Notify"
import ErrorModal from "@framework/Modals/ErrorModal"

import * as ExceptionClient from "@framework/Exceptions/ExceptionClient"
import * as AuthClient from "@extensions/Authorization/AuthClient"
import * as UserQueryClient from "@extensions/UserQueries/UserQueryClient"
import * as OmniboxClient from "@extensions/Omnibox/OmniboxClient"
import * as ChartClient from "@extensions/Chart/ChartClient"
import * as DashboardClient from "@extensions/Dashboard/DashboardClient"
import * as MapClient from "@extensions/Map/MapClient"
import * as CacheClient from "@extensions/Cache/CacheClient"
import * as ProcessClient from "@extensions/Processes/ProcessClient"
import * as MailingClient from "@extensions/Mailing/MailingClient"
import * as ProfilerClient from "@extensions/Profiler/ProfilerClient"
import * as FilesClient from "@extensions/Files/FilesClient"
import * as WordClient from "@extensions/Word/WordClient"
import * as ExcelClient from "@extensions/Excel/ExcelClient"
import * as SchedulerClient from "@extensions/Scheduler/SchedulerClient"
import * as TranslationClient from "@extensions/Translation/TranslationClient"
import * as DiffLogClient from "@extensions/DiffLog/DiffLogClient"
import * as CultureClient from "@extensions/Translation/CultureClient"
import * as WorkflowClient from "@extensions/Workflow/WorkflowClient"
import * as PredictorClient from "@extensions/MachineLearning/PredictorClient"
import * as RestClient from "@extensions/Rest/RestClient"

import * as ToolbarClient from "@extensions/Toolbar/ToolbarClient"
import QueryToolbarConfig from "@extensions/Toolbar/QueryToolbarConfig"
import UserQueryToolbarConfig from "@extensions/UserQueries/UserQueryToolbarConfig"
import UserChartToolbarConfig from "@extensions/Chart/UserChartToolbarConfig"
import DashboardToolbarConfig from "@extensions/Dashboard/DashboardToolbarConfig"

import * as DynamicClient from "@extensions/Dynamic/DynamicClient"
import * as DynamicExpressionClient from "@extensions/Dynamic/DynamicExpressionClient"
import * as DynamicTypeClient from "@extensions/Dynamic/DynamicTypeClient"
import * as DynamicTypeConditionClient from "@extensions/Dynamic/DynamicTypeConditionClient"
import * as DynamicValidationClient from "@extensions/Dynamic/DynamicValidationClient"
import * as DynamicViewClient from "@extensions/Dynamic/DynamicViewClient"

import DynamicQueryOmniboxProvider from "@extensions/Omnibox/DynamicQueryOmniboxProvider"
import EntityOmniboxProvider from "@extensions/Omnibox/EntityOmniboxProvider"
import SpecialOmniboxProvider from "@extensions/Omnibox/SpecialOmniboxProvider"
import ChartOmniboxProvider from "@extensions/Chart/ChartOmniboxProvider"
import UserChartOmniboxProvider from "@extensions/Chart/UserChartOmniboxProvider"
import UserQueryOmniboxProvider from "@extensions/UserQueries/UserQueryOmniboxProvider"
import DashboardOmniboxProvider from "@extensions/Dashboard/DashboardOmniboxProvider"
import MapOmniboxProvider from "@extensions/Map/MapOmniboxProvider"

import * as History from 'history'

import Layout from './Layout'
import PublicCatalog from './PublicCatalog'
import Home from './Home'
import NotFound from './NotFound'

import * as ConfigureReactWidgets from "@framework/ConfigureReactWidgets"
import { ImportRoute } from "@framework/AsyncImport";
import VersionChangedAlert from "@framework/Frames/VersionChangedAlert";

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

library.add(fas, far);

Navigator.setTitleFunction(pageTitle => document.title = pageTitle ? pageTitle + " - Southwind" : "Southwind");
Navigator.setTitle();

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

      Navigator.clearAllSettings();

      const routes: JSX.Element[] = [];

      routes.push(<Route exact path="~/" component={Home} />);
      routes.push(<Route path="~/publicCatalog" component={PublicCatalog} />);
      AuthClient.startPublic({ routes, userTicket: true, windowsAuthentication: false, resetPassword: true, notifyLogout: true,  });

      const isFull = !!AuthClient.currentUser(); //true;
      if (isFull) {
        Operations.start();
        Navigator.start({ routes });
        Finder.start({ routes });
        QuickLinks.start();

        AuthClient.start({ routes, types: true, properties: true, operations: true, queries: true, permissions: true });

        ExceptionClient.start({ routes });

        FilesClient.start({ routes });
        UserQueryClient.start({ routes });
        CacheClient.start({ routes });
        ProcessClient.start({ routes, packages: true, packageOperations: true });
        MailingClient.start({ routes, newsletter: false, pop3Config: false, sendEmailTask: false, contextual: true, queryButton: true });
        WordClient.start({ routes, contextual: true, queryButton: true, entityButton: false });
        ExcelClient.start({ routes, plainExcel: true, excelReport: true });
        SchedulerClient.start({ routes });
        TranslationClient.start({ routes });
        DiffLogClient.start({ routes, timeMachine: true });
        ProfilerClient.start({ routes });
        ChartClient.start({ routes });
        DashboardClient.start({ routes });
        MapClient.start({ routes, auth: true, cache: true, disconnected: false, isolation: false });
        WorkflowClient.start({ routes });
        PredictorClient.start({ routes });
        ToolbarClient.start({ routes },
          new QueryToolbarConfig(),
          new UserQueryToolbarConfig(),
          new UserChartToolbarConfig(),
          new DashboardToolbarConfig(),
        );
        RestClient.start({ routes });

        DynamicClient.start({ routes });
        DynamicExpressionClient.start({ routes });
        DynamicTypeClient.start({ routes });
        DynamicTypeConditionClient.start({ routes });
        DynamicValidationClient.start({ routes });
        DynamicViewClient.start({ routes });

        SouthwindClient.start({ routes });

        OmniboxClient.start(
          new DynamicQueryOmniboxProvider(),
          new EntityOmniboxProvider(),
          new ChartOmniboxProvider(),
          new UserChartOmniboxProvider(),
          new UserQueryOmniboxProvider(),
          new DashboardOmniboxProvider(),
          new MapOmniboxProvider(),
          new SpecialOmniboxProvider()
        );//Omnibox
      }

      routes.push(<Route component={NotFound} />);

      Layout.switch = React.createElement(Switch, undefined, ...routes);
      const reactDiv = document.getElementById("reactDiv")!;
      unmountComponentAtNode(reactDiv);

      var h = Navigator.createAppRelativeHistory();

      render(
        <Router history={h}>
          <Layout />
        </Router>, reactDiv);

      return isFull;
    });
}

AuthClient.Options.onLogin = (url?: string) => {
  reload().then(() => {
    var loc = Navigator.history.location;

    var back: History.Location = loc && loc.state && (loc.state as any).back;

    Navigator.history.push(back ?? url ?? "~/");
  }).done();
};

AuthClient.Options.onLogout = () => {
  Navigator.history.push("~/");
  reload().done();
};

reload();


