using Signum.Mailing;
using Signum.SMS;
using Signum.Workflow;
using Signum.Files;
using Signum.Authorization.Rules;
using Signum.Authorization.AuthToken;
using Signum.Authorization.ActiveDirectory;
using Signum.Chatbot;

namespace Southwind.Globals;

[EntityKind(EntityKind.Main, EntityData.Master)]
public class ApplicationConfigurationEntity : Entity
{
    [StringLengthValidator(Min = 3, Max = 100)]
    public string Environment { get; set; }

    [StringLengthValidator(Min = 3, Max = 100)]
    public string DatabaseName { get; set; }

    /*Email*/
    public EmailConfigurationEmbedded Email { get; set; }

    public EmailSenderConfigurationEntity EmailSender { get; set; }

    public ChatbotConfigurationEmbedded Chatbot { get; set; }

    /*Sms*/
    public SMSConfigurationEmbedded Sms { get; set; }

    /*Auth*/
    public AuthTokenConfigurationEmbedded AuthTokens { get; set; }

    /*Workflow*/
    public WorkflowConfigurationEmbedded Workflow { get; set; }

    public FoldersConfigurationEmbedded Folders { get; set; }

    public TranslationConfigurationEmbedded Translation { get; set; }

    public ActiveDirectoryConfigurationEmbedded ActiveDirectory { get; set; }
}


public class TranslationConfigurationEmbedded : EmbeddedEntity
{
    [Description("Azure Cognitive Service API Key")]
    [StringLengthValidator(Max = 300), FileNameValidator]
    public string? AzureCognitiveServicesAPIKey { get; set; }

    [Description("Azure Cognitive Service Region")]
    [StringLengthValidator(Max = 300), FileNameValidator]
    public string? AzureCognitiveServicesRegion { get; set; }

    [Description("DeepL API Key")]
    [StringLengthValidator(Max = 300), FileNameValidator]
    public string? DeepLAPIKey { get; set; }
}


[AutoInit]
public static class ApplicationConfigurationOperation
{
    public static ExecuteSymbol<ApplicationConfigurationEntity> Save;
}

[AutoInit]
public static class SouthwindTypeCondition
{
    public static TypeConditionSymbol UserEntities;
    public static TypeConditionSymbol RoleEntities;
    public static TypeConditionSymbol CurrentEmployee;
}

public class FoldersConfigurationEmbedded : EmbeddedEntity
{
    /*Predictor*/
    [StringLengthValidator(Max = 300), FileNameValidator]
    public string PredictorModelFolder { get; set; }

    /*Dashboard*/
    [StringLengthValidator(Max = 300), FileNameValidator]
    public string CachedQueryFolder { get; set; }

    /*Exceptions*/
    [StringLengthValidator(Max = 300), FileNameValidator]
    public string ExceptionsFolder { get; set; }

    /*OperationLog*/
    [StringLengthValidator(Max = 300), FileNameValidator]
    public string OperationLogFolder { get; set; }

    /*ViewLog*/
    [StringLengthValidator(Max = 300), FileNameValidator]
    public string ViewLogFolder { get; set; }

    /*EmailMessage*/
    [StringLengthValidator(Max = 300), FileNameValidator]
    public string EmailMessageFolder { get; set; }

    /*RestLog*/
    [StringLengthValidator(Max = 300), FileNameValidator]
    public string RestLogFolder { get; set; }

    /*Help*/
    [StringLengthValidator(Max = 300), FileNameValidator]
    public string HelpImagesFolder { get; set; }
}

[AutoInit]
public static class BigStringFileType
{
    public static FileTypeSymbol Exceptions;
    public static FileTypeSymbol OperationLog;
    public static FileTypeSymbol ViewLog;
    public static FileTypeSymbol EmailMessage;
    public static FileTypeSymbol RestLog;
}
