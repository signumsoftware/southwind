using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Signum.Engine;
using Signum.Engine.Maps;
using Signum.Entities;
using Signum.Entities.Authorization;
using Signum.Entities.Basics;
using Signum.Services;
using Signum.Utilities;
using Southwind.Entities;
using Southwind.Logic;
using Southwind.Test.Environment.Properties;

namespace Southwind.Test.Environment
{
    public static class SouthwindEnvironment
    {
        internal static void LoadEmployees()
        {
            var america = new RegionDN { Description = "America" };

            var east = new TerritoryDN { Description = "East coast", Region = america }.Save();
            var west = new TerritoryDN { Description = "South coast", Region = america }.Save();

            var roles = Database.Query<RoleDN>().ToDictionary(a=>a.Name);

            var super = new EmployeeDN
            {
                FirstName = "Super",
                LastName = "User",
                Address = RandomAddress(1),
                HomePhone = RandomPhone(1),
                Territories = { east, west },
            };

            CreateUser(super, roles["Super user"]);

            CreateUser(new EmployeeDN
            {
                FirstName = "Advanced",
                LastName = "User",
                Address = RandomAddress(2),
                HomePhone = RandomPhone(2),
                Territories = { west },
                ReportsTo = super.ToLite(),
            }, roles["Advanced user"]);

            CreateUser(new EmployeeDN
            {
                FirstName = "Normal",
                LastName = "User",
                Address = RandomAddress(3),
                HomePhone = RandomPhone(4),
                Territories = {  east },
                ReportsTo = super.ToLite(),
            }, roles["User"]);

        }

        private static void CreateUser(EmployeeDN emp, RoleDN role)
        {
            new UserDN
            {
                UserName = emp.FirstName,
                PasswordHash = Security.EncodePassword(emp.FirstName),
                Role = role,
                State = UserState.Saved,
            }.SetMixin((UserEmployeeMixin e)=>e.Employee, emp).Save();
        }

        internal static void LoadProducts()
        {
            SupplierDN lego = new SupplierDN
            {
                CompanyName = "Lego Corp",
                Address = RandomAddress(4),
                Phone = RandomPhone(4),
                Fax = RandomPhone(4),
                ContactName = "Billund",
            }.Save();

            var construction = new CategoryDN
            {
                CategoryName = "Construction games",
                Description = "Let your imagination create your toys"
            }.Save();

            new ProductDN
            {
                ProductName = "Lego Mindstorms EV3",
                Category = construction.ToLite(),
                Supplier = lego.ToLite(),
                QuantityPerUnit = "1 Box",
                UnitPrice = 159.90m,
                ReorderLevel = 1,
                UnitsInStock = 10
            }.Save();


            SupplierDN sega = new SupplierDN
            {
                CompanyName = "Sega Inc",
                Phone = RandomPhone(10),
                Fax = RandomPhone(10),
                Address = RandomAddress(10),
                ContactName = "Kalinske",
            }.Save();

            var videoGames = new CategoryDN
            {
                CategoryName = "Video games",
                Description = "Enjoy virtual worlds and fabulous adventures"
            }.Save();

            new ProductDN
            {
                ProductName = "Sonic the Hedgehog",
                Category = videoGames.ToLite(),
                Supplier = sega.ToLite(),
                QuantityPerUnit = "1 Case",
                UnitPrice = 49.90m,
                ReorderLevel = 2,
                UnitsInStock = 30
            }.Save();
        }

        internal static void LoadCustomers()
        {
            new PersonDN
            {
                FirstName = "John",
                LastName = "Connor",
                Phone = RandomPhone(5),
                Address = RandomAddress(5),
            }.Save();

            new PersonDN
            {
                FirstName = "Sara",
                LastName = "Connor",
                Phone = RandomPhone(6),
                Address = RandomAddress(6),
            }.Save();

            new CompanyDN
            {
                CompanyName = "Cyberdyne Systems Corporation",
                ContactName = "Miles Dyson",
                ContactTitle = "Dr.",
                Phone = RandomPhone(7),
                Address = RandomAddress(7),
            }.Save(); 
        }

        private static AddressDN RandomAddress(int seed)
        {
            Random r = new Random(seed);
            return new AddressDN
            {
                Address = r.NextElement(new[] { "Madison Av.", "Sessame Str.", "5th Av.", "Flamingo Way" }) + " " + r.Next(100),
                City = r.NextElement(new[] { "New York", "Los Angeles", "Miami", "Seattle" }),
                Country = "USA",
                Region = r.NextElement(new[] { "NY", "FL", "WA", "CA" }),
                PostalCode = r.NextString(5, "0123456789")
            };
        }

        private static string RandomPhone(int seed)
        {
            Random r = new Random(seed);
            return r.NextString(10, "0123456789");
        }

        internal static void LoadShippers()
        {
            new ShipperDN
            {
                CompanyName = "FedEx",
                Phone = RandomPhone(11),
            }.Save();
        }

        static bool started = false;
        public static void Start()
        {
            if (!started)
            {
                var cs = UserConnections.Replace(Settings.Default.ConnectionString);

                if (!cs.Contains("Test")) //Security mechanism to avoid passing test on production
                    throw new InvalidOperationException("ConnectionString does not contain the word 'Test'.");

                Starter.Start(cs);
                started = true;
            }
        }

        public static void StartAndInitialize()
        {
            Start();
            Schema.Current.Initialize(); 
        }

        internal static void LoadBasics()
        {
            var en = new CultureInfoDN(CultureInfo.GetCultureInfo("en")).Save();
            var es = new CultureInfoDN(CultureInfo.GetCultureInfo("es")).Save(); 
        }
    }
}
