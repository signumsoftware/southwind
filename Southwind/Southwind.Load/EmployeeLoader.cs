using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Engine;
using Southwind.Entities;
using Signum.Utilities;
using Signum.Entities;
using Signum.Services;

namespace Southwind.Load
{
    internal static class EmployeeLoader
    {
        public static void LoadRegions()
        {
            using (NorthwindDataContext db = new NorthwindDataContext())
            {
                Administrator.SaveListDisableIdentity(db.Regions.Select(r =>
                    Administrator.SetId(r.RegionID, new RegionDN
                    {
                        Description = r.RegionDescription,
                    })));
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
                    Administrator.SetId(int.Parse(t.Id), new TerritoryDN
                    {
                        Description = t.Description,
                        Region = regionDic[t.RegionID]
                    })));
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
                    select Administrator.SetId(e.EmployeeID, new EmployeeDN
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
                    }));

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
    }
}
