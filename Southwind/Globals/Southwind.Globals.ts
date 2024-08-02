//////////////////////////////////
//Auto-generated. Do NOT modify!//
//////////////////////////////////

import { MessageKey, QueryKey, Type, EnumType, registerSymbol } from '../../Framework/Signum/React/Reflection'
import * as Entities from '../../Framework/Signum/React/Signum.Entities'
import * as Operations from '../../Framework/Signum/React/Signum.Operations'
import * as Mailing from '../../Framework/Extensions/Signum.Mailing/Signum.Mailing'
import * as SMS from '../../Framework/Extensions/Signum.SMS/Signum.SMS'
import * as AuthToken from '../../Framework/Extensions/Signum.Authorization/AuthToken/Signum.Authorization.AuthToken'
import * as Rules from '../../Framework/Extensions/Signum.Authorization/Rules/Signum.Authorization.Rules'
import * as Workflow from '../../Framework/Extensions/Signum.Workflow/Signum.Workflow'
import * as ActiveDirectory from '../../Framework/Extensions/Signum.Authorization.ActiveDirectory/Signum.Authorization.ActiveDirectory'
import * as Employees from '../Employees/Southwind.Employees'
import * as Files from '../../Framework/Extensions/Signum.Files/Signum.Files'



export const ApplicationConfigurationEntity: Type<ApplicationConfigurationEntity> = new Type<ApplicationConfigurationEntity>("ApplicationConfiguration");
export interface ApplicationConfigurationEntity extends Entities.Entity {
  Type: "ApplicationConfiguration";
  environment: string;
  databaseName: string;
  email: Mailing.EmailConfigurationEmbedded;
  emailSender: Mailing.EmailSenderConfigurationEntity;
  sms: SMS.SMSConfigurationEmbedded;
  authTokens: AuthToken.AuthTokenConfigurationEmbedded;
  workflow: Workflow.WorkflowConfigurationEmbedded;
  folders: FoldersConfigurationEmbedded;
  translation: TranslationConfigurationEmbedded;
  activeDirectory: ActiveDirectory.ActiveDirectoryConfigurationEmbedded;
}

export module ApplicationConfigurationOperation {
  export const Save : Operations.ExecuteSymbol<ApplicationConfigurationEntity> = registerSymbol("Operation", "ApplicationConfigurationOperation.Save");
}

export module BigStringFileType {
  export const Exceptions : Files.FileTypeSymbol = registerSymbol("FileType", "BigStringFileType.Exceptions");
  export const OperationLog : Files.FileTypeSymbol = registerSymbol("FileType", "BigStringFileType.OperationLog");
  export const ViewLog : Files.FileTypeSymbol = registerSymbol("FileType", "BigStringFileType.ViewLog");
  export const EmailMessage : Files.FileTypeSymbol = registerSymbol("FileType", "BigStringFileType.EmailMessage");
  export const RestLog : Files.FileTypeSymbol = registerSymbol("FileType", "BigStringFileType.RestLog");
}

export const FoldersConfigurationEmbedded: Type<FoldersConfigurationEmbedded> = new Type<FoldersConfigurationEmbedded>("FoldersConfigurationEmbedded");
export interface FoldersConfigurationEmbedded extends Entities.EmbeddedEntity {
  Type: "FoldersConfigurationEmbedded";
  predictorModelFolder: string;
  cachedQueryFolder: string;
  exceptionsFolder: string;
  operationLogFolder: string;
  viewLogFolder: string;
  emailMessageFolder: string;
  restLogFolder: string;
  helpImagesFolder: string;
}

export module SouthwindTypeCondition {
  export const UserEntities : Rules.TypeConditionSymbol = registerSymbol("TypeCondition", "SouthwindTypeCondition.UserEntities");
  export const RoleEntities : Rules.TypeConditionSymbol = registerSymbol("TypeCondition", "SouthwindTypeCondition.RoleEntities");
  export const CurrentEmployee : Rules.TypeConditionSymbol = registerSymbol("TypeCondition", "SouthwindTypeCondition.CurrentEmployee");
}

export const TranslationConfigurationEmbedded: Type<TranslationConfigurationEmbedded> = new Type<TranslationConfigurationEmbedded>("TranslationConfigurationEmbedded");
export interface TranslationConfigurationEmbedded extends Entities.EmbeddedEntity {
  Type: "TranslationConfigurationEmbedded";
  azureCognitiveServicesAPIKey: string | null;
  azureCognitiveServicesRegion: string | null;
  deepLAPIKey: string | null;
}

export const UserEmployeeMixin: Type<UserEmployeeMixin> = new Type<UserEmployeeMixin>("UserEmployeeMixin");
export interface UserEmployeeMixin extends Entities.MixinEntity {
  Type: "UserEmployeeMixin";
  employee: Entities.Lite<Employees.EmployeeEntity> | null;
}

