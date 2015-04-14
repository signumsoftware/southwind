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

namespace Southwind.Entities
{
    [Serializable, EntityKind(EntityKind.Main, EntityData.Transactional)]
    public class OrderEntity : Entity
    {
        [ImplementedBy(typeof(CompanyEntity), typeof(PersonEntity))]
        CustomerEntity customer;
        [NotNullValidator]
        public CustomerEntity Customer
        {
            get { return customer; }
            set { Set(ref customer, value); }
        }

        Lite<EmployeeEntity> employee;
        [NotNullValidator]
        public Lite<EmployeeEntity> Employee
        {
            get { return employee; }
            set { Set(ref employee, value); }
        }

        DateTime orderDate;
        public DateTime OrderDate
        {
            get { return orderDate; }
            set { Set(ref orderDate, value); }
        }

        DateTime requiredDate;
        public DateTime RequiredDate
        {
            get { return requiredDate; }
            set { Set(ref requiredDate, value); }
        }

        DateTime? shippedDate;
        public DateTime? ShippedDate
        {
            get { return shippedDate; }
            set { Set(ref shippedDate, value); }
        }

        DateTime? cancelationDate;
        public DateTime? CancelationDate
        {
            get { return cancelationDate; }
            set { Set(ref cancelationDate, value); }
        }

        Lite<ShipperEntity> shipVia;
        public Lite<ShipperEntity> ShipVia
        {
            get { return shipVia; }
            set { Set(ref shipVia, value); }
        }

        [SqlDbType(Size = 40)]
        string shipName;
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 40)]
        public string ShipName
        {
            get { return shipName; }
            set { Set(ref shipName, value); }
        }

        [NotNullable]
        AddressEntity shipAddress;
        [NotNullValidator]
        public AddressEntity ShipAddress
        {
            get { return shipAddress; }
            set { Set(ref shipAddress, value); }
        }

        decimal freight;
        [Unit("Kg")]
        public decimal Freight
        {
            get { return freight; }
            set { Set(ref freight, value); }
        }

        [NotNullable, ValidateChildProperty, NotifyChildProperty, NotifyCollectionChanged]
        MList<OrderDetailsEntity> details = new MList<OrderDetailsEntity>();
        [NoRepeatValidator]
        public MList<OrderDetailsEntity> Details
        {
            get { return details; }
            set { Set(ref details, value); }
        }

        static Expression<Func<OrderEntity, decimal>> TotalPriceExpression =
            o => o.Details.Sum(od => od.SubTotalPrice);
        [Unit("€")]
        public decimal TotalPrice
        {
            get{ return TotalPriceExpression.Evaluate(this); }
        }

        bool isLegacy;
        public bool IsLegacy
        {
            get { return isLegacy; }
            set { Set(ref isLegacy, value); }
        }

        OrderState state;
        public OrderState State
        {
            get { return state; }
            set { Set(ref state, value); }
        }

        protected override string ChildPropertyValidation(ModifiableEntity sender, PropertyInfo pi)
        {
            OrderDetailsEntity details = sender as OrderDetailsEntity;

            if (details != null && !IsLegacy &&  pi.Is(() => details.Discount))
            {
                if ((details.Discount * 100.0m) % 5.0m != 0)
                    return OrderMessage.DiscountShouldBeMultpleOf5.NiceToString();
            }

            return base.ChildPropertyValidation(sender, pi);
        }

        protected override void ChildCollectionChanged(object sender, NotifyCollectionChangedEventArgs args)
        {
            if (sender == details)
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

    public static class OrderOperation
    {
        public static readonly ConstructSymbol<OrderEntity>.Simple Create = OperationSymbol.Construct<OrderEntity>.Simple();
        public static readonly ExecuteSymbol<OrderEntity> SaveNew = OperationSymbol.Execute<OrderEntity>();
        public static readonly ExecuteSymbol<OrderEntity> Save = OperationSymbol.Execute<OrderEntity>();
        public static readonly ExecuteSymbol<OrderEntity> Ship = OperationSymbol.Execute<OrderEntity>();
        public static readonly ExecuteSymbol<OrderEntity> Cancel = OperationSymbol.Execute<OrderEntity>();
        public static readonly ConstructSymbol<OrderEntity>.From<CustomerEntity> CreateOrderFromCustomer = OperationSymbol.Construct<OrderEntity>.From<CustomerEntity>();
        public static readonly ConstructSymbol<OrderEntity>.FromMany<ProductEntity> CreateOrderFromProducts = OperationSymbol.Construct<OrderEntity>.FromMany<ProductEntity>();
        public static readonly DeleteSymbol<OrderEntity> Delete = OperationSymbol.Delete<OrderEntity>();

        public static readonly ConstructSymbol<ProcessEntity>.FromMany<OrderEntity> CancelWithProcess = OperationSymbol.Construct<ProcessEntity>.FromMany<OrderEntity>();
    }

    [Serializable]
    public class OrderDetailsEntity : EmbeddedEntity, IEditableObject
    {
        Lite<ProductEntity> product;
        [NotNullValidator]
        public Lite<ProductEntity> Product
        {
            get { return product; }
            set { Set(ref product, value); }
        }

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
        [Unit("€")]
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
                Product = product,
                Quantity = quantity,
                UnitPrice = unitPrice,
                Discount = discount
            };
        }

        public void CancelEdit()
        {
            Product = clone.product;
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
        string companyName;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 100)]
        public string CompanyName
        {
            get { return companyName; }
            set { SetToStr(ref companyName, value); }
        }

        [NotNullable, SqlDbType(Size = 24)]
        string phone;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 24), TelephoneValidator]
        public string Phone
        {
            get { return phone; }
            set { Set(ref phone, value); }
        }

        static Expression<Func<ShipperEntity, string>> ToStringExpression = e => e.CompanyName;
        public override string ToString()
        {
            return ToStringExpression.Evaluate(this);
        }
    }

    public static class ShipperOperation
    {
        public static readonly ExecuteSymbol<ShipperEntity> Save = OperationSymbol.Execute<ShipperEntity>();
    }

    public enum OrderQuery
    {
        OrderLines,
        OrderSimple
    }

    public static class OrderTasks
    {
        public static readonly SimpleTaskSymbol CancelOldOrdersWithProcess = new SimpleTaskSymbol();
        public static readonly SimpleTaskSymbol CancelOldOrders = new SimpleTaskSymbol();
    }

    public static class OrderProcess
    {
        public static readonly ProcessAlgorithmSymbol CancelOrders = new ProcessAlgorithmSymbol();
    }

    [Serializable]
    public class OrderFilterModel: ModelEntity
    {
        [ImplementedBy(typeof(PersonEntity), typeof(CompanyEntity))]
        Lite<CustomerEntity> customer;
        public Lite<CustomerEntity> Customer
        {
            get { return customer; }
            set { Set(ref customer, value); }
        }

        Lite<EmployeeEntity> employee;
        public Lite<EmployeeEntity> Employee
        {
            get { return employee; }
            set { Set(ref employee, value); }
        }

        DateTime? minOrderDate;
        [DaysPrecissionValidator]
        public DateTime? MinOrderDate
        {
            get { return minOrderDate; }
            set { Set(ref minOrderDate, value); }
        }

        DateTime? maxOrderDate;
        [DaysPrecissionValidator]
        public DateTime? MaxOrderDate
        {
            get { return maxOrderDate; }
            set { Set(ref maxOrderDate, value); }
        }
    }
}
