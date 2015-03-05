using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;
using Signum.Entities.Basics;
using Signum.Entities.Mailing;
using Signum.Entities.SMS;

namespace Southwind.Entities
{
    [Serializable, EntityKind(EntityKind.Main, EntityData.Master)]
    public class ApplicationConfigurationEntity : Entity
    {
        [NotNullable, SqlDbType(Size = 100), UniqueIndex]
        string environment;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 100)]
        public string Environment
        {
            get { return environment; }
            set { Set(ref environment, value); }
        }

        [NotNullable]/*Email*/
        EmailConfigurationEntity email;
        [NotNullValidator]
        public EmailConfigurationEntity Email
        {
            get { return email; }
            set { Set(ref email, value); }
        }

        [NotNullable]
        SmtpConfigurationEntity smtpConfiguration;
        [NotNullValidator]
        public SmtpConfigurationEntity SmtpConfiguration
        {
            get { return smtpConfiguration; }
            set { Set(ref smtpConfiguration, value); }
        }/*Email*/

        [NotNullable]/*Sms*/
        SMSConfigurationEntity sms;
        [NotNullValidator]
        public SMSConfigurationEntity Sms
        {
            get { return sms; }
            set { Set(ref sms, value); }
        }/*Sms*/
    }

    public static class ApplicationConfigurationOperation
    {
        public static readonly ExecuteSymbol<ApplicationConfigurationEntity> Save = OperationSymbol.Execute<ApplicationConfigurationEntity>();
    }

    public static class SouthwindGroup
    {
        public static TypeConditionSymbol UserEntities = new TypeConditionSymbol();
        public static TypeConditionSymbol RoleEntities = new TypeConditionSymbol();
        public static TypeConditionSymbol CurrentCustomer = new TypeConditionSymbol();
    }
}
