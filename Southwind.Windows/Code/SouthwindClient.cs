﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Media;
using Signum.Entities;
using Signum.Entities.Authorization;
using Signum.Windows;
using Southwind.Entities;
using Southwind.Windows.Controls;

namespace Southwind.Windows.Code
{
    public static class SouthwindClient
    {
        public static void Start()
        {
            if (Navigator.Manager.NotDefined(MethodInfo.GetCurrentMethod()))
            {

                Navigator.AddSettings(new List<EntitySettings>
                {
                    new EntitySettings<EmployeeDN>() { View = e => new Employee()},
                    new EntitySettings<TerritoryDN>() { View = e => new Territory() },
                    new EntitySettings<RegionDN>() { View = e => new Region() },

                    new EntitySettings<ProductDN>() { View = e => new Product() },
                    new EntitySettings<CategoryDN>() { View = e => new Category() },
                    new EntitySettings<SupplierDN>() { View = e => new Supplier() },

                    new EntitySettings<CompanyDN>() { View = e => new Company() },
                    new EntitySettings<PersonDN>() { View = e => new Person() },

                    new EntitySettings<OrderDN>() { View = e => new Order()},
                });

                Constructor.Register(ctx => new OrderDN
                {
                    OrderDate = DateTime.Now,
                    RequiredDate = DateTime.Now.AddDays(2),
                    Employee = ((EmployeeDN)UserDN.Current.Related).ToLite(),
                    Details = new MList<OrderDetailsDN>()
                });

                Constructor.Register(ctx => new PersonDN
                {
                    Address = new AddressDN()
                });

                Constructor.Register(ctx => new CompanyDN
                {
                    Address = new AddressDN()
                });

                Func<Binding, DataTemplate> formatter = b =>
                {
                    b.Converter = SouthwindConverters.ImageConverter;
                    return Fluent.GetDataTemplate(() => new Image { MaxHeight = 32.0, Stretch = Stretch.Uniform }
                        .Bind(Image.SourceProperty, b)
                        .Set(RenderOptions.BitmapScalingModeProperty, BitmapScalingMode.Linear));
                };

                QuerySettings.RegisterPropertyFormat((EmployeeDN e) => e.Photo, formatter);
                QuerySettings.RegisterPropertyFormat((CategoryDN e) => e.Picture, formatter);

            }
        }
    }
}