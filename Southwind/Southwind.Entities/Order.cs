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

namespace Southwind.Entities
{
    [Serializable]
    public class OrderDN : Entity
    {
        [ImplementedBy(typeof(CompanyDN), typeof(PersonDN))]
        CustomerDN customer;
        [NotNullValidator]
        public CustomerDN Customer
        {
            get { return customer; }
            set { Set(ref customer, value, () => Customer); }
        }

        Lite<EmployeeDN> employee;
        [NotNullValidator]
        public Lite<EmployeeDN> Employee
        {
            get { return employee; }
            set { Set(ref employee, value, () => Employee); }
        }

        DateTime orderDate;
        public DateTime OrderDate
        {
            get { return orderDate; }
            set { Set(ref orderDate, value, () => OrderDate); }
        }

        DateTime requiredDate;
        public DateTime RequiredDate
        {
            get { return requiredDate; }
            set { Set(ref requiredDate, value, () => RequiredDate); }
        }

        DateTime? shippedDate;
        public DateTime? ShippedDate
        {
            get { return shippedDate; }
            set { Set(ref shippedDate, value, () => ShippedDate); }
        }

        DateTime? cancelationDate;
        public DateTime? CancelationDate
        {
            get { return cancelationDate; }
            set { Set(ref cancelationDate, value, () => CancelationDate); }
        }

        Lite<ShipperDN> shipVia;
        public Lite<ShipperDN> ShipVia
        {
            get { return shipVia; }
            set { Set(ref shipVia, value, () => ShipVia); }
        }

        [SqlDbType(Size = 40)]
        string shipName;
        [StringLengthValidator(AllowNulls = true, Min = 3, Max = 40)]
        public string ShipName
        {
            get { return shipName; }
            set { Set(ref shipName, value, () => ShipName); }
        }

        [NotNullable]
        AddressDN shipAddress;
        [NotNullValidator]
        public AddressDN ShipAddress
        {
            get { return shipAddress; }
            set { Set(ref shipAddress, value, () => ShipAddress); }
        }

        decimal freight;
        [Unit("Kg")]
        public decimal Freight
        {
            get { return freight; }
            set { Set(ref freight, value, () => Freight); }
        }

        [ValidateChildProperty, NotifyChildProperty, NotifyCollectionChanged]
        MList<OrderDetailsDN> details;
        public MList<OrderDetailsDN> Details
        {
            get { return details; }
            set { Set(ref details, value, () => Details); }
        }

        static Expression<Func<OrderDN, decimal>> TotalPriceExpression =
            o => o.Details.Sum(od => od.SubTotalPrice);
        [Unit("€")]
        public decimal TotalPrice
        {
            get{ return TotalPriceExpression.Invoke(this); }
        }

        bool isLegacy;
        public bool IsLegacy
        {
            get { return isLegacy; }
            set { Set(ref isLegacy, value, () => IsLegacy); }
        }

        OrderState state;
        public OrderState State
        {
            get { return state; }
            set { Set(ref state, value, () => State); }
        }

        protected override string ChildPropertyValidation(ModifiableEntity sender, PropertyInfo pi, object propertyValue)
        {
            OrderDetailsDN details = sender as OrderDetailsDN;

            if (details != null && !IsLegacy &&  pi.Is(() => details.Discount))
            {
                if ((details.Discount * 100.0m) % 5.0m != 0)
                    return "Discount should be multiple of 5%";
            }

            return base.ChildPropertyValidation(sender, pi, propertyValue);
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
            return validator.Validate(this, pi); 
        }

  		static StateValidator<OrderDN, OrderState> validator = new StateValidator<OrderDN, OrderState>(
            o => o.State, o => o.ShippedDate, o => o.ShipVia, o => o.CancelationDate)
            {
            {OrderState.New,     false, null, null},
            {OrderState.Ordered, false, null, null},
            {OrderState.Shipped, true, true, null},
            {OrderState.Canceled, null, null, true},
            }; 
    }

    public enum OrderState
    {
        [Ignore]
        New,
        Ordered, 
        Shipped,
        Canceled,
    }

    public enum OrderOperations
    {
        Create, 
        Save, 
        Ship,
        Cancel,
    }

    [Serializable]
    public class OrderDetailsDN : EmbeddedEntity, IEditableObject
    {
        Lite<ProductDN> product;
        [NotNullValidator]
        public Lite<ProductDN> Product
        {
            get { return product; }
            set { Set(ref product, value, () => Product); }
        }

        decimal unitPrice;
        [Unit("€")]
        public decimal UnitPrice
        {
            get { return unitPrice; }
            set
            {
                if (Set(ref unitPrice, value, () => UnitPrice))
                    Notify(() => SubTotalPrice);
            }
        }

        int quantity;
        public int Quantity
        {
            get { return quantity; }
            set
            {
                if (Set(ref quantity, value, () => Quantity))
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
                if (Set(ref discount, value, () => Discount))
                    Notify(() => SubTotalPrice);
            }
        }

        static Expression<Func<OrderDetailsDN, decimal>> SubTotalPriceExpression =
            od => od.Quantity * od.UnitPrice * (decimal)(1 - od.Discount);
        public decimal SubTotalPrice
        {
            get { return SubTotalPriceExpression.Invoke(this); }
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

    [Serializable]
    public class ShipperDN : Entity
    {
        [NotNullable, SqlDbType(Size = 100), UniqueIndex]
        string companyName;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 100)]
        public string CompanyName
        {
            get { return companyName; }
            set { SetToStr(ref companyName, value, () => CompanyName); }
        }

        [NotNullable, SqlDbType(Size = 24)]
        string phone;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 24), TelephoneValidator]
        public string Phone
        {
            get { return phone; }
            set { Set(ref phone, value, () => Phone); }
        }

        public override string ToString()
        {
            return companyName;
        }
    }

    public enum OrderQueries
    {
        OrderLines
    }
}
