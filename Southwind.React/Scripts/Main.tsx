require("../node_modules/bootstrap/dist/css/bootstrap.css");
require("../node_modules/font-awesome/css/font-awesome.css");
require("../Content/site.css");
require("../../Framework/Signum.React/Scripts/Frames/Frames.css");


import * as React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { Router, Route, Redirect, IndexRoute, useRouterHistory } from "react-router"
import * as ReactRouter from "react-router"

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
import * as WordClient from "../../Extensions/Signum.React.Extensions/Word/WordClient"
import * as ExcelClient from "../../Extensions/Signum.React.Extensions/Excel/ExcelClient"
import * as SchedulerClient from "../../Extensions/Signum.React.Extensions/Scheduler/SchedulerClient"
import * as TranslationClient from "../../Extensions/Signum.React.Extensions/Translation/TranslationClient"
import * as DiffLogClient from "../../Extensions/Signum.React.Extensions/DiffLog/DiffLogClient"
import * as CultureClient from "../../Extensions/Signum.React.Extensions/Translation/CultureClient"
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


numbro.culture("en-GB", require<any>("numbro/languages/en-GB"));
numbro.culture("es-ES", require<any>("numbro/languages/es-ES"));

declare let __webpack_public_path__: string;

__webpack_public_path__ = window.__baseUrl + "dist/";

ConfigureReactWidgets.asumeGlobalUtcMode(moment, false);
ConfigureReactWidgets.configure();

Services.NotifyPendingFilter.notifyPendingRequests = pending => {
    if (Notify.singletone)
        Notify.singletone.notifyPendingRequest(pending);
}

CultureClient.onCultureLoaded.push(ci => {
    const culture = ci.name!;
    moment.locale((culture.tryBefore("-") || culture).toLowerCase());
    numbro.culture(culture == "en" ? "en-GB" :
        culture == "es" ? "es-ES" : "Unkwnown");
});

window.onerror = (message: string, filename?: string, lineno?: number, colno?: number, error?: Error) => ErrorModal.showError(error);

let loaded = false;

function reload() {
    return AuthClient.autoLogin()
        .then(() => reloadTypes())
        .then(() => CultureClient.loadCurrentCulture())
        .then(() => {
            const isFull = !!AuthClient.currentUser();

            if (loaded)
                return;

            const routes: JSX.Element[] = [];

            routes.push(<IndexRoute component={Home} />);
            routes.push(<Route path="publicCatalog" component={PublicCatalog} />);
            AuthClient.startPublic({ routes, userTicket: true, resetPassword: true });

            if (isFull) {
                Operations.start();
                Navigator.start({ routes });
                Finder.start({ routes });
                QuickLinks.start();

                AuthClient.start({ routes, types: true, properties: true, operations: true, queries: true, permissions: true });

                ExceptionClient.start({ routes });

                UserQueryClient.start({ routes });
                CacheClient.start({ routes });
                ProcessClient.start({ routes, packages: true, packageOperations: true });
                MailingClient.start({ routes, smtpConfig: true, newsletter: false, pop3Config: false, sendEmailTask: false, quickLinksFrom: undefined });
                WordClient.start({ routes });
                ExcelClient.start({ routes, plainExcel: true, excelReport: true });
                SchedulerClient.start({ routes });
                TranslationClient.start({ routes });
                DiffLogClient.start({ routes });
                ProfilerClient.start({ routes });
                ChartClient.start({ routes });
                DashboardClient.start({ routes });
                MapClient.start({ routes, auth: true, cache: true, disconnected: true, isolation: false });

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
                );
            }
            
            routes.push(<Route path="*" component={NotFound}/>);

            const baseName = window.__baseUrl

            const history = useRouterHistory(History.createHistory)({
                //basename: baseName,
            });

            Navigator.useAppRelativeBasename(history, baseName);

            Navigator.setCurrentHistory(history);

            const mainRoute = React.createElement(Route as any, { component: Layout }, ...routes);
            const wrap = document.getElementById("wrap")!;
            unmountComponentAtNode(wrap);
            render(
                <Router history={history}>
                    <Route component={Layout} path={baseName.beforeLast("/") || "/"} > 
                        { routes }
                    </Route>
                </Router>, wrap);

            if (isFull)
                loaded = true;

            return isFull;
        });
}

AuthClient.Options.onLogin = () => {
    reload().then(() => {
        Navigator.currentHistory.push("~/");
    }).done();
};

reload();


