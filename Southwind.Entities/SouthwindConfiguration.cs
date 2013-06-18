using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;
using Signum.Entities.Mailing;

namespace Southwind.Entities
{
    [Serializable, EntityKind(EntityKind.Main)]
    public class SouthwindConfigurationDN : Entity
    {
        [UniqueIndex, FieldWithoutProperty]
        bool unique = true;

        [NotNullable]
        EmailTemplateConfigurationDN email;
        [NotNullValidator]
        public EmailTemplateConfigurationDN Email
        {
            get { return email; }
            set { Set(ref email, value, () => Email); }
        }
    }

    public enum SouthwindConfigurationOperation
    {
        Save
    }
}
