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
        [NotNullable, SqlDbType(Size = 100), UniqueIndex]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 100)]
        public string Environment { get; set; }

        [NotNullable]/*Email*/
        [NotNullValidator]
        public EmailConfigurationEmbedded Email { get; set; }

        [NotNullValidator]/*Smtp*/
        public SmtpConfigurationEntity SmtpConfiguration { get; set; }

        [NotNullable]/*Sms*/
        [NotNullValidator]
        public SMSConfigurationEmbedded Sms { get; set; }

        [NotNullable]/*AuthTokens*/
        [NotNullValidator]
        public AuthTokenConfigurationEmbedded AuthTokens { get; set; }

        [NotNullable]/*Workflow*/
        [NotNullValidator]
        public WorkflowConfigurationEmbedded Workflow { get; set; }

        [NotNullable]
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
        [NotNullable, SqlDbType(Size = 300)]/*Predictor*/
        [StringLengthValidator(AllowNulls = false, Max = 300), FileNameValidator]
        public string PredictorModelFolder { get; set; }
    }
}
