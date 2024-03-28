import { RouteObject } from "react-router"
import { Operations } from "@framework/Operations"
import { Navigator } from "@framework/Navigator"
import { Finder } from "@framework/Finder"
import * as QuickLinks from "@framework/QuickLinks"


import { ExceptionClient } from "@framework/Exceptions/ExceptionClient"
import { ChangeLogClient } from "@framework/Basics/ChangeLogClient"
import { VisualTipClient } from "@framework/Basics/VisualTipClient"
import { AuthAdminClient } from "@extensions/Signum.Authorization/AuthAdminClient"
import { ActiveDirectoryClient } from "@extensions/Signum.Authorization.ActiveDirectory/ActiveDirectoryClient"
import { UserQueryClient } from "@extensions/Signum.UserQueries/UserQueryClient"
import { OmniboxClient } from "@extensions/Signum.Omnibox/OmniboxClient"
import { ChartClient } from "@extensions/Signum.Chart/ChartClient"
import { DashboardClient } from "@extensions/Signum.Dashboard/DashboardClient"
import { MapClient } from "@extensions/Signum.Map/MapClient"
import { CacheClient } from "@extensions/Signum.Caching/CacheClient"
import { ProcessClient } from "@extensions/Signum.Processes/ProcessClient"
import { MailingClient } from "@extensions/Signum.Mailing/MailingClient"
import { ProfilerClient } from "@extensions/Signum.Profiler/ProfilerClient"
import { FilesClient } from "@extensions/Signum.Files/FilesClient"
import { WordClient } from "@extensions/Signum.Word/WordClient"
import { ExcelClient } from "@extensions/Signum.Excel/ExcelClient"
import { SchedulerClient } from "@extensions/Signum.Scheduler/SchedulerClient"
import { TranslationClient } from "@extensions/Signum.Translation/TranslationClient"
import { TranslatedInstanceClient } from "@extensions/Signum.Translation/TranslatedInstanceClient"
import { HelpClient } from "@extensions/Signum.Help/HelpClient"
import { DiffLogClient } from "@extensions/Signum.DiffLog/DiffLogClient"
import { TimeMachineClient } from "@extensions/Signum.TimeMachine/TimeMachineClient"
import { WorkflowClient } from "@extensions/Signum.Workflow/WorkflowClient"
import { PredictorClient } from "@extensions/Signum.MachineLearning/PredictorClient"
import { RestClient } from "@extensions/Signum.Rest/RestClient"
import { AlertsClient } from "@extensions/Signum.Alerts/AlertsClient"
import { NotesClient } from "@extensions/Signum.Notes/NotesClient"
import { ConcurrentUserClient } from "@extensions/Signum.ConcurrentUser/ConcurrentUserClient"

import { ToolbarClient } from "@extensions/Signum.Toolbar/ToolbarClient"

import { EvalClient } from "@extensions/Signum.Eval/EvalClient"
import { DynamicClient } from "@extensions/Signum.Dynamic/DynamicClient"
import { DynamicExpressionClient } from "@extensions/Signum.Dynamic/DynamicExpressionClient"
import { DynamicTypeClient } from "@extensions/Signum.Dynamic/DynamicTypeClient"
import { DynamicTypeConditionClient } from "@extensions/Signum.Dynamic/DynamicTypeConditionClient"
import { DynamicValidationClient } from "@extensions/Signum.Dynamic/DynamicValidationClient"
import { DynamicViewClient } from "@extensions/Signum.Dynamic/DynamicViewClient"


import { CustomersClient } from "./Customers/CustomersClient"
import { EmployeesClient } from "./Employees/EmployeesClient"
import { GlobalsClient } from "./Globals/GlobalsClient"
import { OrdersClient } from "./Orders/OrdersClient"
import { ProductsClient } from "./Products/ProductsClient"
import { ShippersClient } from "./Shippers/ShippersClient"

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
