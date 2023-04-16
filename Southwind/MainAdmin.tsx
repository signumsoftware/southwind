import { RouteObject } from "react-router"
import * as Operations from "@framework/Operations"
import * as Navigator from "@framework/Navigator"
import * as Finder from "@framework/Finder"
import * as QuickLinks from "@framework/QuickLinks"


import * as ExceptionClient from "@framework/Exceptions/ExceptionClient"
import * as AuthAdminClient from "@extensions/Signum.Authorization/AuthAdminClient"
import * as ActiveDirectoryClient from "@extensions/Signum.Authorization.ActiveDirectory/ActiveDirectoryClient"
import * as UserQueryClient from "@extensions/Signum.UserQueries/UserQueryClient"
import * as OmniboxClient from "@extensions/Signum.Omnibox/OmniboxClient"
import * as ChartClient from "@extensions/Signum.Chart/ChartClient"
import * as DashboardClient from "@extensions/Signum.Dashboard/DashboardClient"
import * as MapClient from "@extensions/Signum.Map/MapClient"
import * as CacheClient from "@extensions/Signum.Caching/CacheClient"
import * as ProcessClient from "@extensions/Signum.Processes/ProcessClient"
import * as MailingClient from "@extensions/Signum.Mailing/MailingClient"
import * as ProfilerClient from "@extensions/Signum.Profiler/ProfilerClient"
import * as FilesClient from "@extensions/Signum.Files/FilesClient"
import * as WordClient from "@extensions/Signum.Word/WordClient"
import * as ExcelClient from "@extensions/Signum.Excel/ExcelClient"
import * as SchedulerClient from "@extensions/Signum.Scheduler/SchedulerClient"
import * as TranslationClient from "@extensions/Signum.Translation/TranslationClient"
import * as TranslatedInstanceClient from "@extensions/Signum.Translation/TranslatedInstanceClient"
import * as DiffLogClient from "@extensions/Signum.DiffLog/DiffLogClient"
import * as WorkflowClient from "@extensions/Signum.Workflow/WorkflowClient"
import * as PredictorClient from "@extensions/Signum.MachineLearning/PredictorClient"
import * as RestClient from "@extensions/Signum.Rest/RestClient"
import * as AlertsClient from "@extensions/Signum.Alerts/AlertsClient"
import * as ConcurrentUserClient from "@extensions/Signum.ConcurrentUser/ConcurrentUserClient"

import * as ToolbarClient from "@extensions/Signum.Toolbar/ToolbarClient"
import QueryToolbarConfig from "@extensions/Signum.Toolbar/QueryToolbarConfig"
import UserQueryToolbarConfig from "@extensions/Signum.UserQueries/UserQueryToolbarConfig"
import UserChartToolbarConfig from "@extensions/Signum.Chart/UserChartToolbarConfig"
import DashboardToolbarConfig from "@extensions/Signum.Dashboard/DashboardToolbarConfig"
import WorkflowToolbarConfig from "@extensions/Signum.Workflow/WorkflowToolbarConfig"
import WorkflowToolbarMenuConfig from "@extensions/Signum.Workflow/WorkflowToolbarMenuConfig"

import * as DynamicClient from "@extensions/Signum.Dynamic/DynamicClient"
import * as DynamicExpressionClient from "@extensions/Signum.Dynamic/DynamicExpressionClient"
import * as DynamicTypeClient from "@extensions/Signum.Dynamic/DynamicTypeClient"
import * as DynamicTypeConditionClient from "@extensions/Signum.Dynamic/DynamicTypeConditionClient"
import * as DynamicValidationClient from "@extensions/Signum.Dynamic/DynamicValidationClient"
import * as DynamicViewClient from "@extensions/Signum.Dynamic/DynamicViewClient"

import DynamicQueryOmniboxProvider from "@extensions/Signum.Omnibox/DynamicQueryOmniboxProvider"
import EntityOmniboxProvider from "@extensions/Signum.Omnibox/EntityOmniboxProvider"
import SpecialOmniboxProvider from "@extensions/Signum.Omnibox/SpecialOmniboxProvider"
import ChartOmniboxProvider from "@extensions/Signum.Chart/ChartOmniboxProvider"
import UserChartOmniboxProvider from "@extensions/Signum.Chart/UserChartOmniboxProvider"
import UserQueryOmniboxProvider from "@extensions/Signum.UserQueries/UserQueryOmniboxProvider"
import DashboardOmniboxProvider from "@extensions/Signum.Dashboard/DashboardOmniboxProvider"
import MapOmniboxProvider from "@extensions/Signum.Map/MapOmniboxProvider"

import * as CustomersClient from "./Customers/CustomersClient"
import * as EmployersClient from "./Employees/EmployersClient"
import * as GlobalsClient from "./Globals/GlobalsClient"
import * as OrdersClient from "./Orders/OrdersClient"
import * as ProductsClient from "./Products/ProductsClient"
import * as PublicClient from "./Public/PublicClient"
import * as ShippersClient from "./Shippers/ShippersClient"

export function startFull(routes: RouteObject[]) {
  Operations.start();
  Navigator.start({ routes });
  Finder.start({ routes });
  QuickLinks.start();

  AuthAdminClient.start({ routes, types: true, properties: true, operations: true, queries: true, permissions: true });
  ActiveDirectoryClient.start({ routes, adGroups: false });

  ExceptionClient.start({ routes });

  FilesClient.start({ routes });
  UserQueryClient.start({ routes });
  CacheClient.start({ routes });
  ProcessClient.start({ routes, packages: true, packageOperations: true });
  MailingClient.start({ routes, pop3Config: false, sendEmailTask: false, contextual: true, queryButton: true });
  WordClient.start({ routes, contextual: true, queryButton: true, entityButton: false });
  ExcelClient.start({ routes, plainExcel: true, importFromExcel: true, excelReport: true });
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
    new WorkflowToolbarConfig(),
    new WorkflowToolbarMenuConfig(),
  );
  RestClient.start({ routes });
  AlertsClient.start({ routes });
  ConcurrentUserClient.start({ routes });

  /* LightDynamic
  DynamicClient.start({ routes, withCodeGen: false });
  LightDynamic */
  DynamicClient.start({ routes, withCodeGen: true });
  DynamicExpressionClient.start({ routes });
  DynamicTypeClient.start({ routes });
  DynamicTypeConditionClient.start({ routes });
  DynamicValidationClient.start({ routes });
  DynamicViewClient.start({ routes });

  CustomersClient.start({ routes });
  EmployersClient.start({ routes });
  GlobalsClient.start({ routes });
  OrdersClient.start({ routes });
  ProductsClient.start({ routes });
  ShippersClient.start({ routes });

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
