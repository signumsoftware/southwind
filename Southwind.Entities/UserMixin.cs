using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;

namespace Southwind.Entities
{
    [Serializable]
    public class UserMixin : MixinEntity
    {
        UserMixin(IdentifiableEntity mainEntity, MixinEntity next) : base(mainEntity, next) { }

        AllowLogin allowLogin;
        public AllowLogin AllowLogin
        {
            get { return allowLogin; }
            set { Set(ref allowLogin, value); }
        }
    }

    public enum AllowLogin
    {
        WindowsAndWeb,
        WindowsOnly,
        WebOnly,
    }
}
