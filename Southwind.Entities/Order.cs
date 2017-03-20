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
        [NotNullValidator]
        public CustomerEntity Customer { get; set; }

        [NotNullValidator]
        public Lite<EmployeeEntity> Employee { get; set; }

        public DateTime OrderDate { get; set; }

        public DateTime RequiredDate { get; set; }

        public DateTime? ShippedDate { get; set; }

        public DateTime? CancelationDate { get; set; }

        public Lite<ShipperEntity> ShipVia { get; set; }

        [SqlDbType(Size = 40)]
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 40)]
        public string ShipName { get; set; }

        [NotNullable]
        [NotNullValidator]
        public AddressEntity ShipAddress { get; set; }

        [Unit("Kg")]
        public decimal Freight { get; set; }

        [NotNullable, NotifyChildProperty, NotifyCollectionChanged]
        [NoRepeatValidator]
        public MList<OrderDetailsEntity> Details { get; set; } = new MList<OrderDetailsEntity>();

        static Expression<Func<OrderEntity, decimal>> TotalPriceExpression =
            o => o.Details.Sum(od => od.SubTotalPrice);
        [ExpressionField, Unit("€")]
        public decimal TotalPrice
        {
            get { return TotalPriceExpression.Evaluate(this); }
        }

        public bool IsLegacy { get; set; }

        public OrderState State { get; set; }

        protected override string ChildPropertyValidation(ModifiableEntity sender, PropertyInfo pi)
        {

            if (sender is OrderDetailsEntity details && !IsLegacy && pi.Name == nameof(details.Discount))
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
            if (sender is OrderDetailsEntity)
                Notify(() => TotalPrice);
        }

        protected override string PropertyValidation(PropertyInfo pi)
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
        SelectAShipper
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
        public static ExecuteSymbol<OrderEntity> SaveNew;
        public static ExecuteSymbol<OrderEntity> Save;
        public static ExecuteSymbol<OrderEntity> Ship;
        public static ExecuteSymbol<OrderEntity> Cancel;
        public static ConstructSymbol<OrderEntity>.From<CustomerEntity> CreateOrderFromCustomer;
        public static ConstructSymbol<OrderEntity>.FromMany<ProductEntity> CreateOrderFromProducts;
        public static DeleteSymbol<OrderEntity> Delete;

        public static ConstructSymbol<ProcessEntity>.FromMany<OrderEntity> CancelWithProcess;
    }

    [Serializable]
    public class OrderDetailsEntity : EmbeddedEntity, IEditableObject
    {
        [NotNullValidator]
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

        static Expression<Func<OrderDetailsEntity, decimal>> SubTotalPriceExpression =
            od => od.Quantity * od.UnitPrice * (decimal)(1 - od.Discount);
        [ExpressionField, Unit("€")]
        public decimal SubTotalPrice
        {
            get { return SubTotalPriceExpression.Evaluate(this); }
        }

        [Ignore]
        OrderDetailsEntity clone;

        public void BeginEdit()
        {
            clone = new OrderDetailsEntity
            {
                Product = Product,
                Quantity = quantity,
                UnitPrice = unitPrice,
                Discount = discount
            };
        }

        public void CancelEdit()
        {
            Product = clone.Product;
            Quantity = clone.quantity;
            Discount = clone.discount;
        }

        public void EndEdit()
        {
            clone = null;
        }
    }

    [Serializable, EntityKind(EntityKind.Main, EntityData.Master)]
    public class ShipperEntity : Entity
    {
        [NotNullable, SqlDbType(Size = 100), UniqueIndex]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 100)]
        public string CompanyName { get; set; }

        [NotNullable, SqlDbType(Size = 24)]
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 24), TelephoneValidator]
        public string Phone { get; set; }

        static Expression<Func<ShipperEntity, string>> ToStringExpression = e => e.CompanyName;
        [ExpressionField]
        public override string ToString()
        {
            return ToStringExpression.Evaluate(this);
        }
    }

    [AutoInit]
    public static class ShipperOperation
    {
        public static ExecuteSymbol<ShipperEntity> Save;
    }

    public enum OrderQuery
    {
        OrderLines,
        OrderSimple
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
        public Lite<CustomerEntity> Customer { get; set; }

        public Lite<EmployeeEntity> Employee { get; set; }

        [DaysPrecissionValidator]
        public DateTime? MinOrderDate { get; set; }

        [DaysPrecissionValidator]
        public DateTime? MaxOrderDate { get; set; }
    }
}
