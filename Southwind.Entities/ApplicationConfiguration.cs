using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;
using Signum.Entities.Basics;
using Signum.Entities.Mailing;
using Signum.Entities.SMS;
using Signum.Utilities;
using System.Linq.Expressions;
using Signum.Entities.Authorization;
using Signum.Entities.Workflow;

namespace Southwind.Entities
{
    [Serializable, EntityKind(EntityKind.Main, EntityData.Master)]
    public class ApplicationConfigurationEntity : Entity
    {
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 100)]
        public string Environment { get; set; }

        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 100)]
        public string DatabaseName { get; set; }

        /*Email*/
        [NotNullValidator]
        public EmailConfigurationEmbedded Email { get; set; }

        [NotNullValidator]/*Smtp*/
        public SmtpConfigurationEntity SmtpConfiguration { get; set; }

        /*Sms*/
        [NotNullValidator]
        public SMSConfigurationEmbedded Sms { get; set; }

        /*AuthTokens*/
        [NotNullValidator]
        public AuthTokenConfigurationEmbedded AuthTokens { get; set; }

        /*Workflow*/
        [NotNullValidator]
        public WorkflowConfigurationEmbedded Workflow { get; set; }

        [NotNullValidator]
        public FoldersConfigurationEmbedded Folders { get; set; }
    }

    [AutoInit]
    public static class ApplicationConfigurationOperation
    {
        public static ExecuteSymbol<ApplicationConfigurationEntity> Save;
    }

    [AutoInit]
    public static class SouthwindGroup
    {
        public static TypeConditionSymbol UserEntities;
        public static TypeConditionSymbol RoleEntities;
        public static TypeConditionSymbol CurrentCustomer;
    }

    [Serializable]
    public class FoldersConfigurationEmbedded : EmbeddedEntity
    {
        /*Predictor*/
        [StringLengthValidator(AllowNulls = false, Max = 300), FileNameValidator]
        public string PredictorModelFolder { get; set; }
    }
}
