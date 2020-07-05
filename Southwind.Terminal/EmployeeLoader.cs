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
using Southwind.Terminal.NorthwindSchema;

namespace Southwind.Terminal
{
    internal static class EmployeeLoader
    {
        public static void LoadRegions()
        {
            var regions = Connector.Override(Northwind.Connector).Using(_ => Database.View<Region>().ToList());

            regions.Select(r => new RegionEntity
            {
                Description = r.RegionDescription.Trim()
            }.SetId(r.RegionID))
            .BulkInsert(disableIdentity: true);
        }

        public static void LoadTerritories()
        {
            var regionDic = Database.RetrieveAll<RegionEntity>().ToDictionary(a => a.Id);

            var territories = Connector.Override(Northwind.Connector).Using(_ => Database.View<Territories>().ToList());

            var entities = territories.Select(t => new TerritoryEntity
            {
                Region = regionDic.GetOrThrow(t.RegionID),
                Description = t.TerritoryDescription.Trim(),
            }.SetId(new PrimaryKey(t.TerritoryID)))
            .ToList();

            entities.Duplicates(a => a.Description).ForEach(t => t.Description += " (Dup)");

            entities.BulkInsert(disableIdentity: true);
        }

        public static void LoadEmployees()
        {

            var territoriesDic = Database.RetrieveAll<TerritoryEntity>().ToDictionary(a => a.Id);


            var employees = Connector.Override(Northwind.Connector).Using(_ => Database.View<Employees>()
            .Select(e => new
            {
                e.ReportsTo,
                employee = new EmployeeEntity
                {
                    BirthDate = (Date?)e.BirthDate,
                    FirstName = e.FirstName,
                    LastName = e.LastName,
                    TitleOfCourtesy = e.TitleOfCourtesy,
                    HomePhone = e.HomePhone,
                    Extension = e.Extension,
                    HireDate = (Date?)e.HireDate,
                    Photo = new FileEntity { FileName = e.PhotoPath.AfterLast('/'), BinaryFile = RemoveOlePrefix(e.Photo.ToArray()) }.ToLiteFat(),
                    PhotoPath = e.PhotoPath,
                    Address = new AddressEmbedded
                    {
                        Address = e.Address,
                        City = e.City,
                        Country = e.Country,
                        Region = e.Region,
                        PostalCode = e.PostalCode,
                    },
                    Notes = e.Notes,
                    Territories = Database.View<EmployeeTerritories>()
                    .Where(et => et.EmployeeID == e.EmployeeID)
                    .Select(a => territoriesDic.GetOrThrow(int.Parse(a.TerritoryID)))
                    .ToMList(),
                }.SetId(e.EmployeeID)
            })
            .ToList());

            Administrator.SaveListDisableIdentity(employees.Select(a=>a.employee!)); /*CSBUG*/

            var dictionary = employees.Select(a => a.employee!).ToDictionary(a => a.Id); /*CSBUG*/

            foreach (var pair in employees)
            {
                pair.employee!.ReportsTo = pair.ReportsTo == null ? null : dictionary.GetOrThrow(pair.ReportsTo!.Value).ToLite();
            }

            dictionary.Values.SaveList();
        }

        public static byte[] RemoveOlePrefix(byte[] bytes)
        {
            byte[] clean = new byte[bytes.Length - 78];
            Array.Copy(bytes, 78, clean, 0, bytes.Length - 78);
            return clean;
        } //RemoveOlePrefix

        internal static void CreateUsers()
        {
            using (Transaction tr = new Transaction())
            {
                var roles = Database.Query<RoleEntity>().ToDictionary(a => a.Name);

                var employees = Database.Query<EmployeeEntity>().OrderByDescending(a => a.Notes!.Length).ToList();

                employees.Select((employee, i) => new UserEntity
                {
                    UserName = employee.FirstName,
                    PasswordHash = Security.EncodePassword(employee.FirstName),
                    Role = roles.GetOrThrow(i < 2 ? "Super user" : i < 5 ? "Advanced user" : "User").ToLite(),
                    State = UserState.Saved,
                }.SetMixin((UserEmployeeMixin e) => e.Employee, employee.ToLite())).SaveList();

                tr.Commit();
            }
        } //CreateUsers
    }
}
