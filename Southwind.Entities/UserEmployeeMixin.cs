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

        AllowLogin allowLogin;
        public AllowLogin AllowLogin
        {
            get { return allowLogin; }
            set { Set(ref allowLogin, value); }
        }

        EmployeeEntity employee;
        public EmployeeEntity Employee
        {
            get { return employee; }
            set { Set(ref employee, value); }
        }
    }

    public enum AllowLogin
    {
        WindowsAndWeb,
        WindowsOnly,
        WebOnly,
    }
}
