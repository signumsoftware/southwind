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
using Signum.Engine.Operations;
using Signum.Entities.Files;

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
                                       Id = g.Select(t => t.TerritoryID).OrderBy().First(),
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


                var exmployeeTerritories = (from e in db.Employees
                                            from t in e.EmployeeTerritories
                                            select new { e.EmployeeID, t.TerritoryID }).ToList()
                          .AgGroupToDictionary(a => a.EmployeeID, gr =>
                              gr.Select(a => int.Parse(a.TerritoryID))
                              .Select(id => duplicateMapping.TryGet(id, id))
                              .Select(id => territoriesDic[id])
                              .Distinct().ToMList());


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
                        Photo = new FileDN { FileName = e.PhotoPath.AfterLast('/'), BinaryFile = RemoveOlePrefix(e.Photo.ToArray()) }.ToLiteFat(),
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
                        Territories = exmployeeTerritories[e.EmployeeID],
                    }.SetId(e.EmployeeID));

                var pairs = (from e in db.Employees
                             where e.ReportsTo != null
                             select new { e.EmployeeID, e.ReportsTo });

                foreach (var pair in pairs)
                {
                    EmployeeDN employee = Database.Retrieve<EmployeeDN>(pair.EmployeeID);
                    employee.ReportsTo = Lite.Create<EmployeeDN>(pair.ReportsTo.Value);
                    employee.Save();
                }
            }
        }

        public static byte[] RemoveOlePrefix(byte[] bytes)
        {
            byte[] clean = new byte[bytes.Length - 78];
            Array.Copy(bytes, 78, clean, 0, bytes.Length - 78);
            return clean;
        } //RemoveOlePrefix

        internal static void CreateSystemUser()
        {
            using (OperationLogic.AllowSave<UserDN>())
            using (Transaction tr = new Transaction())
            {              
                UserDN system = new UserDN
                {
                    UserName = "System",                   
                    PasswordHash = Security.EncodePassword("System"),
                    Role = Database.Query<RoleDN>().Where(r => r.Name == "Super user").SingleEx(),
                    State = UserState.Saved,
                }.Save(); 

                tr.Commit();
            }
        }

        internal static void CreateUsers()
        {
            using (Transaction tr = new Transaction())
            {
                RoleDN su = new RoleDN() { Name = "Super user", MergeStrategy = MergeStrategy.Intersection }.Save();
                RoleDN u = new RoleDN() { Name = "User", MergeStrategy = MergeStrategy.Union }.Save();

                RoleDN au = new RoleDN()
                {
                    Name = "Advanced user",
                    Roles = new MList<Lite<RoleDN>> { u.ToLite() },
                    MergeStrategy = MergeStrategy.Union
                }.Save();

                var employees = Database.Query<EmployeeDN>().OrderByDescending(a => a.Notes.Length).ToList();

                using (OperationLogic.AllowSave<UserDN>())
                    for (int i = 0; i < employees.Count; i++)
                    {
                        var employee = employees[i];
                        new UserDN
                        {
                            UserName = employee.FirstName,
                            PasswordHash = Security.EncodePassword(employee.FirstName),
                            Role = i < 2 ? su :
                                   i < 5 ? au : u,
                            State = UserState.Saved,

                        }.SetMixin((UserEmployeeMixin e)=>e.Employee, employee).Save();
                    }

                tr.Commit();
            }
        }
    }
}
