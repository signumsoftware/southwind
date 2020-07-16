using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;
using Signum.Utilities;

namespace Southwind.Entities
{
    [Serializable]
    public class UserEmployeeMixin : MixinEntity
    {
        protected UserEmployeeMixin(ModifiableEntity mainEntity, MixinEntity next)
            : base(mainEntity, next)
        {
        }

        public AllowLogin AllowLogin { get; set; }

        public Lite<EmployeeEntity>? Employee { get; set; }
    }

    public enum AllowLogin
    {
        WindowsAndWeb,
        WindowsOnly,
        WebOnly,
    }


    [Serializable]
    public class OrderDetailMixin : MixinEntity
    {
        OrderDetailMixin(ModifiableEntity mainEntity, MixinEntity? next)
            : base(mainEntity, next)
        {
        }

        public string? DiscountCode { get; set; }
    }
}
