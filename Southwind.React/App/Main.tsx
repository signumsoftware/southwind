import "../node_modules/bootstrap/dist/css/bootstrap.css";
import "../node_modules/font-awesome/css/font-awesome.css";
import "./site.css";
import "../../Framework/Signum.React/Scripts/Frames/Frames.css";


import * as React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { Router, Route, Redirect } from "react-router-dom"
import { Switch } from "react-router"

import * as moment from "moment"
import * as numbro from "numbro"

import { reloadTypes } from "../../Framework/Signum.React/Scripts/Reflection"
import * as Navigator from "../../Framework/Signum.React/Scripts/Navigator"
import * as Operations from "../../Framework/Signum.React/Scripts/Operations"
import * as Finder from "../../Framework/Signum.React/Scripts/Finder"
import * as Services from "../../Framework/Signum.React/Scripts/Services"
import * as QuickLinks from "../../Framework/Signum.React/Scripts/QuickLinks"
import * as SouthwindClient from "./Southwind/SouthwindClient"
import Notify from "../../Framework/Signum.React/Scripts/Frames/Notify"
import ErrorModal from "../../Framework/Signum.React/Scripts/Modals/ErrorModal"

import * as ExceptionClient from "../../Framework/Signum.React/Scripts/Exceptions/ExceptionClient"
import * as AuthClient from "../../Extensions/Signum.React.Extensions/Authorization/AuthClient"
import * as UserQueryClient from "../../Extensions/Signum.React.Extensions/UserQueries/UserQueryClient"
import * as OmniboxClient from "../../Extensions/Signum.React.Extensions/Omnibox/OmniboxClient"
import * as ChartClient from "../../Extensions/Signum.React.Extensions/Chart/ChartClient"
import * as DashboardClient from "../../Extensions/Signum.React.Extensions/Dashboard/DashboardClient"
import * as MapClient from "../../Extensions/Signum.React.Extensions/Map/MapClient"
import * as CacheClient from "../../Extensions/Signum.React.Extensions/Cache/CacheClient"
import * as ProcessClient from "../../Extensions/Signum.React.Extensions/Processes/ProcessClient"
import * as MailingClient from "../../Extensions/Signum.React.Extensions/Mailing/MailingClient"
import * as ProfilerClient from "../../Extensions/Signum.React.Extensions/Profiler/ProfilerClient"
import * as FilesClient from "../../Extensions/Signum.React.Extensions/Files/FilesClient"
import * as WordClient from "../../Extensions/Signum.React.Extensions/Word/WordClient"
import * as ExcelClient from "../../Extensions/Signum.React.Extensions/Excel/ExcelClient"
import * as SchedulerClient from "../../Extensions/Signum.React.Extensions/Scheduler/SchedulerClient"
import * as TranslationClient from "../../Extensions/Signum.React.Extensions/Translation/TranslationClient"
import * as DiffLogClient from "../../Extensions/Signum.React.Extensions/DiffLog/DiffLogClient"
import * as CultureClient from "../../Extensions/Signum.React.Extensions/Translation/CultureClient"
import * as WorkflowClient from "../../Extensions/Signum.React.Extensions/Workflow/WorkflowClient"
import * as PredictorClient from "../../Extensions/Signum.React.Extensions/MachineLearning/PredictorClient"

import * as ToolbarClient from "../../Extensions/Signum.React.Extensions/Toolbar/ToolbarClient"
import QueryToolbarConfig from "../../Extensions/Signum.React.Extensions/Toolbar/QueryToolbarConfig"
import UserQueryToolbarConfig from "../../Extensions/Signum.React.Extensions/UserQueries/UserQueryToolbarConfig"
import UserChartToolbarConfig from "../../Extensions/Signum.React.Extensions/Chart/UserChartToolbarConfig"
import DashboardToolbarConfig from "../../Extensions/Signum.React.Extensions/Dashboard/DashboardToolbarConfig"

import * as DynamicClient from "../../Extensions/Signum.React.Extensions/Dynamic/DynamicClient"
import * as DynamicExpressionClient from "../../Extensions/Signum.React.Extensions/Dynamic/DynamicExpressionClient"
import * as DynamicTypeClient from "../../Extensions/Signum.React.Extensions/Dynamic/DynamicTypeClient"
import * as DynamicTypeConditionClient from "../../Extensions/Signum.React.Extensions/Dynamic/DynamicTypeConditionClient"
import * as DynamicValidationClient from "../../Extensions/Signum.React.Extensions/Dynamic/DynamicValidationClient"
import * as DynamicViewClient from "../../Extensions/Signum.React.Extensions/Dynamic/DynamicViewClient"

import DynamicQueryOmniboxProvider from "../../Extensions/Signum.React.Extensions/Omnibox/DynamicQueryOmniboxProvider"
import EntityOmniboxProvider from "../../Extensions/Signum.React.Extensions/Omnibox/EntityOmniboxProvider"
import SpecialOmniboxProvider from "../../Extensions/Signum.React.Extensions/Omnibox/SpecialOmniboxProvider"
import ChartOmniboxProvider from "../../Extensions/Signum.React.Extensions/Chart/ChartOmniboxProvider"
import UserChartOmniboxProvider from "../../Extensions/Signum.React.Extensions/Chart/UserChartOmniboxProvider"
import UserQueryOmniboxProvider from "../../Extensions/Signum.React.Extensions/UserQueries/UserQueryOmniboxProvider"
import DashboardOmniboxProvider from "../../Extensions/Signum.React.Extensions/Dashboard/DashboardOmniboxProvider"
import MapOmniboxProvider from "../../Extensions/Signum.React.Extensions/Map/MapOmniboxProvider"

import * as History from 'history'

import Layout from './Layout'
import PublicCatalog from './PublicCatalog'
import Home from './Home'
import NotFound from './NotFound'

import * as ConfigureReactWidgets from "../../Framework/Signum.React/Scripts/ConfigureReactWidgets"
import { ImportRoute } from "../../Framework/Signum.React/Scripts/AsyncImport";

Navigator.setTitleFunction(pageTitle => document.title = pageTitle ? pageTitle + " - Southwind" : "Southwind");
Navigator.setTitle();

numbro.registerLanguage(require<any>("numbro/languages/en-GB"));
numbro.registerLanguage(require<any>("numbro/languages/es-ES"));

declare let __webpack_public_path__: string;

__webpack_public_path__ = window.__baseUrl + "dist/";

ConfigureReactWidgets.asumeGlobalUtcMode(moment, false);
ConfigureReactWidgets.configure();

Services.NotifyPendingFilter.notifyPendingRequests = pending => {
    if (Notify.singletone)
        Notify.singletone.notifyPendingRequest(pending);
}

CultureClient.onCultureLoaded.push(ci => {
    const culture = ci.name!; //"en";
    moment.locale((culture.tryBefore("-") || culture).toLowerCase());
    numbro.setLanguage(culture == "en" ? "en-GB" :
        culture == "es" ? "es-ES" : "Unkwnown");
}); //Culture

Services.VersionFilter.versionChanged = () => {
    Navigator.resetUI();
}

Services.SessionSharing.setAppNameAndRequestSessionStorage("Southwind");

AuthClient.registerUserTicketAuthenticator();

window.onerror = (message: string, filename?: string, lineno?: number, colno?: number, error?: Error) => ErrorModal.showError(error);

let loaded = false;

function reload() {
    return AuthClient.autoLogin() //Promise.resolve()
        .then(() => reloadTypes())
        .then(() => CultureClient.loadCurrentCulture())
        .then(() => {
            const isFull = !!AuthClient.currentUser(); //true;

            if (loaded)
                return;

            const routes: JSX.Element[] = [];

            routes.push(<Route exact path="~/" component={Home} />);
            routes.push(<Route path="~/publicCatalog" component={PublicCatalog} />);
            AuthClient.startPublic({ routes, userTicket: true, resetPassword: true, notifyLogout: true });

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
                MailingClient.start({ routes, smtpConfig: true, newsletter: false, pop3Config: false, sendEmailTask: false, contextual: true, queryButton: true, quickLinksFrom: undefined });
                WordClient.start({ routes, contextual: true, queryButton: true, entityButton: false });
                ExcelClient.start({ routes, plainExcel: true, excelReport: true });
                SchedulerClient.start({ routes });
                TranslationClient.start({ routes });
                DiffLogClient.start({ routes, timeMachine: true });
                ProfilerClient.start({ routes });
                ChartClient.start({ routes });
                DashboardClient.start({ routes });
                MapClient.start({ routes, auth: true, cache: true, disconnected: true, isolation: false });
                WorkflowClient.start({ routes });
                PredictorClient.start({ routes });
                ToolbarClient.start({ routes },
                    new QueryToolbarConfig(),
                    new UserQueryToolbarConfig(),
                    new UserChartToolbarConfig(),
                    new DashboardToolbarConfig(),
                );

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

            routes.push(<Route component={NotFound}/>);
            
            Layout.switch = React.createElement(Switch, undefined, ...routes);
            const reactDiv = document.getElementById("reactDiv")!;
            unmountComponentAtNode(reactDiv);

            var h = Navigator.createAppRelativeHistory();

            render(
                <Router history={h}>
                    <Layout />
                </Router>, reactDiv);

            if (isFull)
                loaded = true;

            return isFull;
        });
}

AuthClient.Options.onLogin = () => {
    reload().then(() => {
        var loc = Navigator.history.location;

        var back: History.Location = loc && loc.state && loc.state.back;

        Navigator.history.push(back || "~/");
    }).done();
};

reload();


