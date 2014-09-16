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
    [Mixin(typeof(DisconnectedMixin))]
    [Serializable, EntityKind(EntityKind.Main, EntityData.Transactional)]
    public class OrderDN : Entity
    {
        [ImplementedBy(typeof(CompanyDN), typeof(PersonDN))]
        CustomerDN customer;
        [NotNullValidator]
        public CustomerDN Customer
        {
            get { return customer; }
            set { Set(ref customer, value); }
        }

        Lite<EmployeeDN> employee;
        [NotNullValidator]
        public Lite<EmployeeDN> Employee
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

        Lite<ShipperDN> shipVia;
        public Lite<ShipperDN> ShipVia
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
        AddressDN shipAddress;
        [NotNullValidator]
        public AddressDN ShipAddress
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
        MList<OrderDetailsDN> details = new MList<OrderDetailsDN>();
        [NoRepeatValidator]
        public MList<OrderDetailsDN> Details
        {
            get { return details; }
            set { Set(ref details, value); }
        }

        static Expression<Func<OrderDN, decimal>> TotalPriceExpression =
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
            OrderDetailsDN details = sender as OrderDetailsDN;

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
            if (sender is OrderDetailsDN)
                Notify(() => TotalPrice);
        }

        protected override string PropertyValidation(PropertyInfo pi)
        { 
            return stateValidator.Validate(this, pi); 
        }

  		static StateValidator<OrderDN, OrderState> stateValidator = new StateValidator<OrderDN, OrderState>(
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
        public static readonly ConstructSymbol<OrderDN>.Simple Create = OperationSymbol.Construct<OrderDN>.Simple();
        public static readonly ExecuteSymbol<OrderDN> SaveNew = OperationSymbol.Execute<OrderDN>();
        public static readonly ExecuteSymbol<OrderDN> Save = OperationSymbol.Execute<OrderDN>();
        public static readonly ExecuteSymbol<OrderDN> Ship = OperationSymbol.Execute<OrderDN>();
        public static readonly ExecuteSymbol<OrderDN> Cancel = OperationSymbol.Execute<OrderDN>();
        public static readonly ConstructSymbol<OrderDN>.From<CustomerDN> CreateOrderFromCustomer = OperationSymbol.Construct<OrderDN>.From<CustomerDN>();
        public static readonly ConstructSymbol<OrderDN>.FromMany<ProductDN> CreateOrderFromProducts = OperationSymbol.Construct<OrderDN>.FromMany<ProductDN>();
        public static readonly DeleteSymbol<OrderDN> Delete = OperationSymbol.Delete<OrderDN>();

        public static readonly ConstructSymbol<ProcessDN>.FromMany<OrderDN> CancelWithProcess = OperationSymbol.Construct<ProcessDN>.FromMany<OrderDN>();
    }

    [Serializable]
    public class OrderDetailsDN : EmbeddedEntity, IEditableObject
    {
        Lite<ProductDN> product;
        [NotNullValidator]
        public Lite<ProductDN> Product
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

        static Expression<Func<OrderDetailsDN, decimal>> SubTotalPriceExpression =
            od => od.Quantity * od.UnitPrice * (decimal)(1 - od.Discount);
        [Unit("€")]
        public decimal SubTotalPrice
        {
            get { return SubTotalPriceExpression.Evaluate(this); }
        }

        [Ignore]
        OrderDetailsDN clone;

        public void BeginEdit()
        {
            clone = new OrderDetailsDN
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
    public class ShipperDN : Entity
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

        static Expression<Func<ShipperDN, string>> ToStringExpression = e => e.CompanyName;
        public override string ToString()
        {
            return ToStringExpression.Evaluate(this);
        }
    }

    public static class ShipperOperation
    {
        public static readonly ExecuteSymbol<ShipperDN> Save = OperationSymbol.Execute<ShipperDN>();
    }

    public enum OrderQuery
    {
        OrderLines
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
}
