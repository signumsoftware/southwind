using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Engine;
using Southwind.Entities;
using Signum.Utilities;
using Signum.Entities;
using Signum.Services;
using Signum.Entities.Authorization;

namespace Southwind.Load
{
    internal static class EmployeeLoader
    {
        public static void LoadRegions()
        {
            using (NorthwindDataContext db = new NorthwindDataContext())
            {
                Administrator.SaveListDisableIdentity(db.Regions.Select(r =>
                    new RegionDN
                    {
                        Description = r.RegionDescription.Trim()
                    }.SetId(r.RegionID)));
            }
        }

        public static void LoadTerritories()
        {
            using (NorthwindDataContext db = new NorthwindDataContext())
            {
                var regionDic = Database.RetrieveAll<RegionDN>().ToDictionary(a => a.Id);

                var territories = (from t in db.Territories.ToList()
                                   group t by t.TerritoryDescription into g
                                   select new
                                   {
                                       Description = g.Key.Trim(),
                                       Id = g.Select(t => t.TerritoryID).Order().First(),
                                       RegionID = g.Select(r => r.RegionID).Distinct().Single(),
                                   }).ToList();

                Administrator.SaveListDisableIdentity(territories.Select(t =>
                    new TerritoryDN
                    {
                        Description = t.Description.Trim(),
                        Region = regionDic[t.RegionID]
                    }.SetId(int.Parse(t.Id))));
            }
        }

        public static void LoadEmployees()
        {
            using (NorthwindDataContext db = new NorthwindDataContext())
            {
                var duplicateMapping = (from t in db.Territories.ToList()
                                        group int.Parse(t.TerritoryID) by t.TerritoryDescription into g
                                        where g.Count() > 1
                                        let min = g.Min()
                                        from item in g.Except(new[] { min })
                                        select new
                                        {
                                            Min = min,
                                            Item = item
                                        }).ToDictionary(a => a.Item, a => a.Min);

                var territoriesDic = Database.RetrieveAll<TerritoryDN>().ToDictionary(a => a.Id);

                Administrator.SaveListDisableIdentity(
                    from e in db.Employees
                    select new EmployeeDN
                    {
                        BirthDate = e.BirthDate,
                        FirstName = e.FirstName,
                        LastName = e.LastName,
                        TitleOfCourtesy = e.TitleOfCourtesy,
                        HomePhone = e.HomePhone,
                        Extension = e.Extension,
                        HireDate = e.HireDate,
                        Photo = e.Photo.ToArray(),
                        PhotoPath = e.PhotoPath,
                        Address = new AddressDN
                        {
                            Address = e.Address,
                            City = e.City,
                            Country = e.Country,
                            Region = e.Region,
                            PostalCode = e.PostalCode,
                        },
                        Notes = e.Notes,
                        Territories = (from id in e.EmployeeTerritories.Select(a => int.Parse(a.TerritoryID)).ToList()
                                       select territoriesDic[duplicateMapping.TryGet(id, id)]).Distinct().ToMList(),
                    }.SetId(e.EmployeeID));

                var pairs = (from e in db.Employees
                             where e.ReportsTo != null
                             select new { e.EmployeeID, e.ReportsTo });

                foreach (var pair in pairs)
                {
                    EmployeeDN employee = Database.Retrieve<EmployeeDN>(pair.EmployeeID);
                    employee.ReportsTo = new Lite<EmployeeDN>(pair.ReportsTo.Value);
                    employee.Save();
                }
            }
        }

        public static void FixEmployeeImages()
        {
            foreach (var employee in Database.RetrieveAll<EmployeeDN>())
            {
                if (employee.Photo != null)
                {
                    employee.Photo = RemoveOlePrefix(employee.Photo); // employee.Photo.Skip(78).ToArray();

                    employee.Save();
                }
            }
        }

        public static void FixCategoryImages()
        {
            foreach (var category in Database.RetrieveAll<CategoryDN>())
            {
                if (category.Picture != null)
                {
                    category.Picture = RemoveOlePrefix(category.Picture);

                    category.Save();
                }
            }
        }

        static byte[] RemoveOlePrefix(byte[] bytes)
        {
            byte[] clean = new byte[bytes.Length - 78];
            Array.Copy(bytes, 78, clean, 0, bytes.Length - 78);
            return clean;
        }

        internal static void CreateSystemUser()
        {
            using (Transaction tr = new Transaction())
            {
                RoleDN sys = new RoleDN() { Name = "System" }.Save();

                UserDN system = new UserDN
                {
                    UserName = "System",
                    PasswordHash = Security.EncodePassword(Guid.NewGuid().ToString()),
                    Role = sys,
                }.Save(); 

                tr.Commit();
            }
        }

        internal static void CreateUsers()
        {
            using (Transaction tr = new Transaction())
            {
                RoleDN su = new RoleDN() { Name = "Super user" }.Save();
                RoleDN u = new RoleDN() { Name = "User" }.Save();

                RoleDN au = new RoleDN()
                {
                    Name = "Advanced user",
                    Roles = new MList<Lite<RoleDN>> { u.ToLite() },
                }.Save();

                var employees = Database.Query<EmployeeDN>().OrderByDescending(a => a.Notes.Length).ToList();

                for (int i = 0; i < employees.Count; i++)
                {
                    var employee = employees[i];
                    new UserDN
                    {
                        Related = employee,
                        UserName = employee.FirstName,
                        PasswordHash = Security.EncodePassword(employee.FirstName),
                        Role = i < 2 ? su :
                               i < 5 ? au : u

                    }.Save();
                }

                tr.Commit();
            }

        }
    }
}
