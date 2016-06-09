using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;

namespace Southwind.Entities
{
    [Serializable]
    public class UserEmployeeMixin : MixinEntity
    {
        protected UserEmployeeMixin(Entity mainEntity, MixinEntity next)
            : base(mainEntity, next)
        {
        }

        public AllowLogin AllowLogin { get; set; }

        public Lite<EmployeeEntity> Employee { get; set; }
    }

    public enum AllowLogin
    {
        WindowsAndWeb,
        WindowsOnly,
        WebOnly,
    }
}
