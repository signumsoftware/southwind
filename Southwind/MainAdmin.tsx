import { RouteObject } from "react-router"
import * as Operations from "@framework/Operations"
import * as Navigator from "@framework/Navigator"
import * as Finder from "@framework/Finder"
import * as QuickLinks from "@framework/QuickLinks"


import * as ExceptionClient from "@framework/Exceptions/ExceptionClient"
import * as ChangeLogClient from "@framework/Basics/ChangeLogClient"
import * as VisualTipClient from "@framework/Basics/VisualTipClient"
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
import * as HelpClient from "@extensions/Signum.Help/HelpClient"
import * as DiffLogClient from "@extensions/Signum.DiffLog/DiffLogClient"
import * as TimeMachineClient from "@extensions/Signum.TimeMachine/TimeMachineClient"
import * as WorkflowClient from "@extensions/Signum.Workflow/WorkflowClient"
import * as PredictorClient from "@extensions/Signum.MachineLearning/PredictorClient"
import * as RestClient from "@extensions/Signum.Rest/RestClient"
import * as AlertsClient from "@extensions/Signum.Alerts/AlertsClient"
import * as NotesClient from "@extensions/Signum.Notes/NotesClient"
import * as ConcurrentUserClient from "@extensions/Signum.ConcurrentUser/ConcurrentUserClient"

import * as ToolbarClient from "@extensions/Signum.Toolbar/ToolbarClient"

import * as EvalClient from "@extensions/Signum.Eval/EvalClient"
import * as DynamicClient from "@extensions/Signum.Dynamic/DynamicClient"
import * as DynamicExpressionClient from "@extensions/Signum.Dynamic/DynamicExpressionClient"
import * as DynamicTypeClient from "@extensions/Signum.Dynamic/DynamicTypeClient"
import * as DynamicTypeConditionClient from "@extensions/Signum.Dynamic/DynamicTypeConditionClient"
import * as DynamicValidationClient from "@extensions/Signum.Dynamic/DynamicValidationClient"
import * as DynamicViewClient from "@extensions/Signum.Dynamic/DynamicViewClient"


import * as CustomersClient from "./Customers/CustomersClient"
import * as EmployeesClient from "./Employees/EmployeesClient"
import * as GlobalsClient from "./Globals/GlobalsClient"
import * as OrdersClient from "./Orders/OrdersClient"
import * as ProductsClient from "./Products/ProductsClient"
import * as ShippersClient from "./Shippers/ShippersClient"

export function startFull(routes: RouteObject[]) {
  Operations.start();
  Navigator.start({ routes });
  Finder.start({ routes });
  QuickLinks.start();

  AuthAdminClient.start({ routes, types: true, properties: true, operations: true, queries: true, permissions: true });
  ActiveDirectoryClient.start({ routes, adGroups: false, cachedProfilePhoto: false });

  ExceptionClient.start({ routes });
  ChangeLogClient.start({ routes, applicationName: "Southwind", mainChangeLog: () => import("./Changelog") });
  VisualTipClient.start({ routes });

  FilesClient.start({ routes });
  UserQueryClient.start({ routes });
  CacheClient.start({ routes });
  ProcessClient.start({ routes, packages: true, packageOperations: true });
  MailingClient.start({ routes, contextual: true, queryButton: true });
  WordClient.start({ routes, contextual: true, queryButton: true, entityButton: false });
  ExcelClient.start({ routes, plainExcel: true, importFromExcel: true, excelReport: true });
  SchedulerClient.start({ routes });
  TranslationClient.start({ routes });
  TranslatedInstanceClient.start({ routes });
  HelpClient.start({ routes });
  DiffLogClient.start({ routes });
  TimeMachineClient.start({ routes });
  ProfilerClient.start({ routes });
  ChartClient.start({ routes });
  DashboardClient.start({ routes });
  MapClient.start({ routes });
  WorkflowClient.start({ routes });
  PredictorClient.start({ routes });
  ToolbarClient.start({ routes });
  RestClient.start({ routes });
  AlertsClient.start({ routes, showAlerts: a => false });
  NotesClient.start({ routes, couldHaveNotes: a => false });
  ConcurrentUserClient.start({ routes });

  EvalClient.start({ routes });
  DynamicClient.start({ routes, withCodeGen: true });
  DynamicExpressionClient.start({ routes });
  DynamicTypeClient.start({ routes });
  DynamicTypeConditionClient.start({ routes });
  DynamicValidationClient.start({ routes });
  DynamicViewClient.start({ routes });

  OmniboxClient.start();

  CustomersClient.start({ routes });
  EmployeesClient.start({ routes });
  GlobalsClient.start({ routes });
  OrdersClient.start({ routes });
  ProductsClient.start({ routes });
  ShippersClient.start({ routes });
}
