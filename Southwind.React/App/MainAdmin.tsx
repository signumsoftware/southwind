import * as Operations from "@framework/Operations"
import * as Navigator from "@framework/Navigator"
import * as Finder from "@framework/Finder"
import * as QuickLinks from "@framework/QuickLinks"


import * as ExceptionClient from "@framework/Exceptions/ExceptionClient"
import * as AuthAdminClient from "@extensions/Authorization/AuthAdminClient"
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
import * as TranslatedInstanceClient from "@extensions/Translation/TranslatedInstanceClient"
import * as DiffLogClient from "@extensions/DiffLog/DiffLogClient"
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

import * as SouthwindClient from "./Southwind/SouthwindClient"

export function startFull(routes: JSX.Element[]) {
  Operations.start();
  Navigator.start({ routes });
  Finder.start({ routes });
  QuickLinks.start();

  AuthAdminClient.start({ routes, types: true, properties: true, operations: true, queries: true, permissions: true });

  ExceptionClient.start({ routes });

  FilesClient.start({ routes });
  UserQueryClient.start({ routes });
  CacheClient.start({ routes });
  ProcessClient.start({ routes, packages: true, packageOperations: true });
  MailingClient.start({ routes, pop3Config: false, sendEmailTask: false, contextual: true, queryButton: true });
  WordClient.start({ routes, contextual: true, queryButton: true, entityButton: false });
  ExcelClient.start({ routes, plainExcel: true, excelReport: true });
  SchedulerClient.start({ routes });
  TranslationClient.start({ routes });
  TranslatedInstanceClient.start({ routes });
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
