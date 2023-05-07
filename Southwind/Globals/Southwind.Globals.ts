//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '@framework/Reflection'
import * as Entities from '@framework/Signum.Entities'
import * as Mailing from '@extensions/Signum.Mailing/Signum.Mailing'
import * as SMS from '@extensions/Signum.SMS/Signum.SMS'
import * as Authorization from '@extensions/Signum.Authorization/Signum.Authorization'
import * as Workflow from '@extensions/Signum.Workflow/Signum.Workflow'
import * as Basics from '@extensions/Signum.Basics/Signum.Basics'
import * as Files from '@extensions/Signum.Files/Signum.Files'
import * as Employees from '../Employees/Southwind.Employees'



export const ApplicationConfigurationEntity = new Type<ApplicationConfigurationEntity>("ApplicationConfiguration");
export interface ApplicationConfigurationEntity extends Entities.Entity {
  Type: "ApplicationConfiguration";
  environment: string;
  databaseName: string;
  email: Mailing.EmailConfigurationEmbedded;
  emailSender: Mailing.EmailSenderConfigurationEntity;
  sms: SMS.SMSConfigurationEmbedded;
  authTokens: Authorization.AuthTokenConfigurationEmbedded;
  workflow: Workflow.WorkflowConfigurationEmbedded;
  folders: FoldersConfigurationEmbedded;
  translation: TranslationConfigurationEmbedded;
  activeDirectory: Authorization.ActiveDirectoryConfigurationEmbedded;
}

export module ApplicationConfigurationOperation {
  export const Save : Entities.ExecuteSymbol<ApplicationConfigurationEntity> = registerSymbol("Operation", "ApplicationConfigurationOperation.Save");
}

export module BigStringFileType {
  export const Exceptions : Files.FileTypeSymbol = registerSymbol("FileType", "BigStringFileType.Exceptions");
  export const OperationLog : Files.FileTypeSymbol = registerSymbol("FileType", "BigStringFileType.OperationLog");
  export const ViewLog : Files.FileTypeSymbol = registerSymbol("FileType", "BigStringFileType.ViewLog");
  export const EmailMessage : Files.FileTypeSymbol = registerSymbol("FileType", "BigStringFileType.EmailMessage");
}

export const FoldersConfigurationEmbedded = new Type<FoldersConfigurationEmbedded>("FoldersConfigurationEmbedded");
export interface FoldersConfigurationEmbedded extends Entities.EmbeddedEntity {
  Type: "FoldersConfigurationEmbedded";
  predictorModelFolder: string;
  cachedQueryFolder: string;
  exceptionsFolder: string;
  operationLogFolder: string;
  viewLogFolder: string;
  emailMessageFolder: string;
}

export module SouthwindTypeCondition {
  export const UserEntities : Basics.TypeConditionSymbol = registerSymbol("TypeCondition", "SouthwindTypeCondition.UserEntities");
  export const RoleEntities : Basics.TypeConditionSymbol = registerSymbol("TypeCondition", "SouthwindTypeCondition.RoleEntities");
  export const CurrentEmployee : Basics.TypeConditionSymbol = registerSymbol("TypeCondition", "SouthwindTypeCondition.CurrentEmployee");
}

export const TranslationConfigurationEmbedded = new Type<TranslationConfigurationEmbedded>("TranslationConfigurationEmbedded");
export interface TranslationConfigurationEmbedded extends Entities.EmbeddedEntity {
  Type: "TranslationConfigurationEmbedded";
  azureCognitiveServicesAPIKey: string | null;
  azureCognitiveServicesRegion: string | null;
  deepLAPIKey: string | null;
}

export const UserEmployeeMixin = new Type<UserEmployeeMixin>("UserEmployeeMixin");
export interface UserEmployeeMixin extends Entities.MixinEntity {
  Type: "UserEmployeeMixin";
  employee: Entities.Lite<Employees.EmployeeEntity> | null;
}


