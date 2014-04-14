using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;
using Signum.Entities.Mailing;

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
    }

    public enum ApplicationConfigurationOperation
    {
        Save
    }
}
