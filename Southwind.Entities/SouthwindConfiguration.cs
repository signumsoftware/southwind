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
    public class ApplicationConfigurationDN : Entity
    {
        [NotNullable, SqlDbType(Size = 100), UniqueIndex]
        string environment;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 100)]
        public string Environment
        {
            get { return environment; }
            set { Set(ref environment, value); }
        }

        [NotNullable]
        EmailConfigurationDN email;
        [NotNullValidator]
        public EmailConfigurationDN Email
        {
            get { return email; }
            set { Set(ref email, value); }
        }

        [NotNullable]
        SMSConfigurationDN sms;
        [NotNullValidator]
        public SMSConfigurationDN Sms
        {
            get { return sms; }
            set { Set(ref sms, value); }
        }
    }

    public static class ApplicationConfigurationOperation
    {
        public static readonly ExecuteSymbol<ApplicationConfigurationDN> Save = OperationSymbol.Execute<ApplicationConfigurationDN>();
    }

    public static class SouthwindGroup
    {
        public static TypeConditionSymbol UserEntities = new TypeConditionSymbol();
        public static TypeConditionSymbol CurrentCompany = new TypeConditionSymbol();
        public static TypeConditionSymbol CurrentPerson = new TypeConditionSymbol();
        public static TypeConditionSymbol RoleEntities = new TypeConditionSymbol();
    }
}
