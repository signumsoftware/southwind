using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;
using System.Reflection;
using System.Linq.Expressions;
using Signum.Utilities;
using System.ComponentModel;
using System.Collections.Specialized;
using Signum.Entities.Disconnected;
using Signum.Entities.Scheduler;
using Signum.Entities.Processes;
using Signum.Utilities.ExpressionTrees;

namespace Southwind.Entities
{
    [Serializable, EntityKind(EntityKind.Main, EntityData.Transactional)]
    public class OrderEntity : Entity
    {
        public OrderEntity()
        {
            this.RebindEvents();
        }

        [ImplementedBy(typeof(CompanyEntity), typeof(PersonEntity))]
        public CustomerEntity Customer { get; set; }

        public Lite<EmployeeEntity> Employee { get; set; }

        public DateTime OrderDate { get; set; }

        public DateTime RequiredDate { get; set; }

        public DateTime? ShippedDate { get; set; }

        public DateTime? CancelationDate { get; set; }

        public Lite<ShipperEntity>? ShipVia { get; set; }

        [StringLengthValidator(Min = 3, Max = 40)]
        public string? ShipName { get; set; }

        public AddressEmbedded ShipAddress { get; set; }

        [Unit("Kg")]
        public decimal Freight { get; set; }

        [NotifyChildProperty, NotifyCollectionChanged]
        [NoRepeatValidator, PreserveOrder]
        public MList<OrderDetailEmbedded> Details { get; set; } = new MList<OrderDetailEmbedded>();

        [AutoExpressionField, Unit("€")]
        public decimal TotalPrice => As.Expression(() => Details.Sum(od => od.SubTotalPrice));

        public bool IsLegacy { get; set; }

        public OrderState State { get; set; }

        protected override bool IsPropertyReadonly(PropertyInfo pi)
        {
            if (pi.Name == nameof(State))
                return true;

            if (State == OrderState.Canceled || State == OrderState.Shipped)
                return true;

            return base.IsPropertyReadonly(pi);
        }

        protected override string? ChildPropertyValidation(ModifiableEntity sender, PropertyInfo pi)
        {
            if (sender is OrderDetailEmbedded details && !IsLegacy && pi.Name == nameof(details.Discount))
            {
                if ((details.Discount * 100.0m) % 5.0m != 0)
                    return OrderMessage.DiscountShouldBeMultpleOf5.NiceToString();
            }

            return base.ChildPropertyValidation(sender, pi);
        }

        protected override void ChildCollectionChanged(object sender, NotifyCollectionChangedEventArgs args)
        {
            if (sender == Details)
                Notify(() => TotalPrice);
        }

        protected override void ChildPropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (sender is OrderDetailEmbedded)
                Notify(() => TotalPrice);
        }

        protected override string? PropertyValidation(PropertyInfo pi)
        {
            return stateValidator.Validate(this, pi);
        }

        static StateValidator<OrderEntity, OrderState> stateValidator = new StateValidator<OrderEntity, OrderState>(
          o => o.State, o => o.ShippedDate, o => o.ShipVia, o => o.CancelationDate)
            {
                {OrderState.New,     false, null, false},
                {OrderState.Ordered, false, null, null},
                {OrderState.Shipped, true, true,  null},
                {OrderState.Canceled, null, null, true},
            };
    }

    public enum OrderMessage
    {
        [Description("Discount should be multiple of 5%")]
        DiscountShouldBeMultpleOf5,
        [Description("Cancel shipped order {0}?")]
        CancelShippedOrder0,
        SelectAShipper,
        SubTotalPrice,
    }

    public enum OrderState
    {
        [Ignore]
        New,
        Ordered,
        Shipped,
        Canceled,
    }

    [AutoInit]
    public static class OrderOperation
    {
        public static ConstructSymbol<OrderEntity>.Simple Create;
        public static ExecuteSymbol<OrderEntity> Save;
        public static ExecuteSymbol<OrderEntity> Ship;
        public static ExecuteSymbol<OrderEntity> Cancel;
        public static ConstructSymbol<OrderEntity>.From<CustomerEntity> CreateOrderFromCustomer;
        public static ConstructSymbol<OrderEntity>.FromMany<ProductEntity> CreateOrderFromProducts;
        public static DeleteSymbol<OrderEntity> Delete;

        public static ConstructSymbol<ProcessEntity>.FromMany<OrderEntity> CancelWithProcess;
    }

    [Serializable]
    public class OrderDetailEmbedded : EmbeddedEntity
    {
        public Lite<ProductEntity> Product { get; set; }

        decimal unitPrice;
        [Unit("€")]
        public decimal UnitPrice
        {
            get { return unitPrice; }
            set
            {
                if (Set(ref unitPrice, value))
                    Notify(() => SubTotalPrice);
            }
        }

        int quantity;
        public int Quantity
        {
            get { return quantity; }
            set
            {
                if (Set(ref quantity, value))
                    Notify(() => SubTotalPrice);
            }
        }

        decimal discount;
        [Format("p")]
        public decimal Discount
        {
            get { return discount; }
            set
            {
                if (Set(ref discount, value))
                    Notify(() => SubTotalPrice);
            }
        }

        [AutoExpressionField]
        public decimal SubTotalPrice => As.Expression(() => Quantity * UnitPrice * (decimal)(1 - Discount));
    }

    [Serializable, EntityKind(EntityKind.Main, EntityData.Master)]
    public class ShipperEntity : Entity
    {
        [UniqueIndex]
        [StringLengthValidator(Min = 3, Max = 100)]
        public string CompanyName { get; set; }

        [StringLengthValidator(Min = 3, Max = 24), TelephoneValidator]
        public string Phone { get; set; }

        [AutoExpressionField]
        public override string ToString() => As.Expression(() => CompanyName);
    }

    [AutoInit]
    public static class ShipperOperation
    {
        public static ExecuteSymbol<ShipperEntity> Save;
    }

    public enum OrderQuery
    {
        OrderLines,
    }

    [AutoInit]//OrderTask
    public static class OrderTask
    {
        public static SimpleTaskSymbol CancelOldOrdersWithProcess;
        public static SimpleTaskSymbol CancelOldOrders;
    }

    [AutoInit]//OrderProcess
    public static class OrderProcess
    {
        public static ProcessAlgorithmSymbol CancelOrders;
    }

    [Serializable]
    public class OrderFilterModel : ModelEntity
    {
        [ImplementedBy(typeof(PersonEntity), typeof(CompanyEntity))]
        public Lite<CustomerEntity>? Customer { get; set; }

        public Lite<EmployeeEntity>? Employee { get; set; }

        public Date? MinOrderDate { get; set; }

        public Date? MaxOrderDate { get; set; }
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
