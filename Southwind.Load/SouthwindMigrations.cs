using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Signum.Engine;
using Signum.Engine.Basics;
using Signum.Engine.Chart;
using Signum.Engine.Maps;
using Signum.Engine.Migrations;
using Signum.Engine.Operations;
using Signum.Engine.Translation;
using Signum.Entities;
using Signum.Entities.Authorization;
using Signum.Entities.Basics;
using Signum.Entities.Files;
using Signum.Entities.Mailing;
using Signum.Entities.SMS;
using Signum.Entities.Word;
using Signum.Services;
using Signum.Utilities;
using Southwind.Entities;

namespace Southwind.Load
{
    public static class SouthwindMigrations
    {
        public static void CSharpMigrations(bool autoRun)
        {
            Schema.Current.Initialize();

            OperationLogic.AllowSaveGlobally = true;

            new CSharpMigrationRunner
            {
                CreateRoles,
                CreateSystemUser,
                EmployeeLoader.LoadRegions,
                EmployeeLoader.LoadTerritories,
                EmployeeLoader.LoadEmployees,
                ProductLoader.LoadSuppliers,
                ProductLoader.LoadCategories,
                ProductLoader.LoadProducts,
                CustomerLoader.LoadCompanies,
                CustomerLoader.LoadPersons,
                OrderLoader.LoadShippers,
                OrderLoader.LoadOrders,
                EmployeeLoader.CreateUsers,
                OrderLoader.UpdateOrdersDate,
                CreateCultureInfo,
                ChartScriptLogic.ImportChartScriptsAuto,
                ImportSpanishInstanceTranslations,
                ImportWordReportTemplateForOrder,
            }.Run(autoRun);
        } //CSharpMigrations

        internal static void CreateRoles()
        {
            using (Transaction tr = new Transaction())
            {
                RoleEntity su = new RoleEntity() { Name = "Super user", MergeStrategy = MergeStrategy.Intersection }.Save();
                RoleEntity u = new RoleEntity() { Name = "User", MergeStrategy = MergeStrategy.Union }.Save();

                RoleEntity au = new RoleEntity()
                {
                    Name = "Advanced user",
                    Roles = new MList<Lite<RoleEntity>> { u.ToLite() },
                    MergeStrategy = MergeStrategy.Union
                }.Save();
                tr.Commit();
            }
        }

        internal static void CreateSystemUser()
        {
            using (OperationLogic.AllowSave<UserEntity>())
            using (Transaction tr = new Transaction())
            {
                UserEntity system = new UserEntity
                {
                    UserName = "System",
                    PasswordHash = Security.EncodePassword("System"),
                    Role = Database.Query<RoleEntity>().Where(r => r.Name == "Super user").SingleEx(),
                    State = UserState.Saved,
                }.Save();

                tr.Commit();
            }
        } //CreateSystemUser

        public static void CreateCultureInfo()
        {
            using (Transaction tr = new Transaction())
            {
                var en = new CultureInfoEntity(CultureInfo.GetCultureInfo("en")).Save();
                var es = new CultureInfoEntity(CultureInfo.GetCultureInfo("es")).Save();

                new ApplicationConfigurationEntity
                {
                    Environment = "Development",
                    Email = new EmailConfigurationEntity
                    {
                        SendEmails = true,
                        DefaultCulture = en,
                        UrlLeft = "http://localhost/Southwind"
                    },
                    SmtpConfiguration = new SmtpConfigurationEntity
                    {
                        Name = "localhost",
                        Network = new SmtpNetworkDeliveryEntity
                        {
                            Host = "localhost"
                        }
                    }, //Email
                    Sms = new SMSConfigurationEntity
                    {
                        DefaultCulture = en,
                    } //Sms
                }.Save();

                tr.Commit();
            }

        }

        public static void ImportSpanishInstanceTranslations()
        {
            TranslatedInstanceLogic.ImportExcelFile("Category.es.View.xlsx");
        }

        public static void ImportWordReportTemplateForOrder()
        {
            new WordTemplateEntity
            {
                Name = "Order template",
                Query = QueryLogic.GetQueryEntity(typeof(OrderEntity)),
                Culture = CultureInfo.GetCultureInfo("en").ToCultureInfoEntity(),
                Template = new FileEntity("../../WordTemplates/Order.docx").ToLiteFat(),
                FileName = "Order.docx"
            }.Save();
        }
    }
}
