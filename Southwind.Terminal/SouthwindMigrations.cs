using System.Globalization;
using Signum.Basics;
using Signum.Engine.Maps;
using Signum.Migrations;
using Signum.Authorization;
using Signum.Files;
using Signum.Mailing;
using Signum.SMS;
using Signum.Word;
using Signum.Workflow;
using Signum.UserAssets;
using System.IO;
using Signum.MachineLearning;
using Signum.DynamicQuery;

using Signum.Toolbar;
using Signum.Dashboard;
using Southwind.Globals;
using Southwind.Products;
using Southwind.Orders;
using Signum.Security;
using Signum.Authorization.AuthToken;
using Signum.Authorization.ActiveDirectory;
using Signum.Translation.Instances;
using Signum.UserAssets.Queries;

namespace Southwind.Terminal;

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
            CreateCulturesAndConfiguration,
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
            OrderLoader.SimulateOrderSystemTime,
            ImportWordReportTemplateForOrder,
            ImportToolbar,
            ImportInstanceTranslations,
            ImportPredictor,
            InitialAuthRulesImport,

        }.Run(autoRun);
    } //CSharpMigrations

    internal static void InitialAuthRulesImport()
    {
        AuthLogic.AutomaticImportAuthRules();
    }

    internal static void CreateRoles()
    {
        AuthLogic.LoadRoles();

    }

    internal static void CreateSystemUser()
    {
        using (OperationLogic.AllowSave<UserEntity>())
        using (Transaction tr = new Transaction())
        {
            UserEntity system = new UserEntity
            {
                UserName = "System",
                PasswordHash = PasswordEncoding.EncodePassword("System", "System"),
                Role = Database.Query<RoleEntity>().Where(r => r.Name == "Super user").SingleEx().ToLite(),
                State = UserState.Active,
            }.Save();

            UserEntity anonymous = new UserEntity
            {
                UserName = "Anonymous",
                PasswordHash = PasswordEncoding.EncodePassword("Anonymous", "Anonymous"),
                Role = Database.Query<RoleEntity>().Where(r => r.Name == "Anonymous").SingleEx().ToLite(),
                State = UserState.Active,
            }.Save(); //Anonymous

            tr.Commit();
        }
    } //CreateSystemUser

    public static void CreateCulturesAndConfiguration()
    {
        using (Transaction tr = new Transaction())
        {
            new CultureInfoEntity(CultureInfo.GetCultureInfo("en")).Save();
            var enGB = new CultureInfoEntity(CultureInfo.GetCultureInfo("en-GB")).Save();
            new CultureInfoEntity(CultureInfo.GetCultureInfo("es")).Save();
            new CultureInfoEntity(CultureInfo.GetCultureInfo("es-ES")).Save();
            new CultureInfoEntity(CultureInfo.GetCultureInfo("de")).Save();
            new CultureInfoEntity(CultureInfo.GetCultureInfo("de-DE")).Save();

            var localPrefix = Starter.AzureStorageConnectionString.HasText() ? "" : @"c:/SouthwindFiles/";

            var standardUser = Database.Query<RoleEntity>().Single(a => a.Name == "Standard user").ToLite();

            new ApplicationConfigurationEntity
            {
                Environment = "Development",
                DatabaseName = Connector.Current.DatabaseName(),
                AuthTokens = new AuthTokenConfigurationEmbedded
                {
                }, //Auth
                Email = new EmailConfigurationEmbedded
                {
                    SendEmails = true,
                    DefaultCulture = enGB,
                    UrlLeft = "http://localhost/Southwind"
                },
                EmailSender = new EmailSenderConfigurationEntity
                {
                    Name = "localhost",
                    Service = new SmtpEmailServiceEntity
                    {
                        Network = new SmtpNetworkDeliveryEmbedded
                        {
                            Host = "localhost"
                        }
                    }
                }, //Email
                Sms = new SMSConfigurationEmbedded
                {
                    DefaultCulture = enGB,
                }, //Sms
                Workflow = new WorkflowConfigurationEmbedded
                {
                }, //Workflow
                Folders = new FoldersConfigurationEmbedded
                {
                    PredictorModelFolder = localPrefix + @"predictor-models",
                    CachedQueryFolder = localPrefix + @"cached-query",
                    ExceptionsFolder = localPrefix + @"exceptions",
                    OperationLogFolder = localPrefix + @"operation-logs",
                    ViewLogFolder = localPrefix + @"view-logs",
                    EmailMessageFolder = localPrefix + @"email-messages",
                    RestLogFolder = localPrefix + @"rest-logs",
                    HelpImagesFolder = localPrefix + @"help-image",
                },
                Translation = new TranslationConfigurationEmbedded
                {
                    AzureCognitiveServicesAPIKey = null,
                    DeepLAPIKey = null,
                },
                ActiveDirectory = new ActiveDirectoryConfigurationEmbedded
                {
                    AzureAD = null,
                    WindowsAD = null,
                    AllowMatchUsersBySimpleUserName = true,
                    AutoCreateUsers = true,
                    AutoUpdateUsers = true,
                    DefaultRole = standardUser,
                }, //ActiveDirectory
            }.Save();

            tr.Commit();
        }

    }

    public static void ImportInstanceTranslations()
    {
        foreach (var lang in new[] { "de", "es"})
        {
            TranslatedInstanceLogic.ImportExcelFile($"../../../InstanceTranslations/Category.{lang}.View.xlsx");
            TranslatedInstanceLogic.ImportExcelFile($"../../../InstanceTranslations/Dashboard.{lang}.View.xlsx");
            TranslatedInstanceLogic.ImportExcelFile($"../../../InstanceTranslations/Toolbar.{lang}.View.xlsx");
            TranslatedInstanceLogic.ImportExcelFile($"../../../InstanceTranslations/ToolbarMenu.{lang}.View.xlsx");
            TranslatedInstanceLogic.ImportExcelFile($"../../../InstanceTranslations/UserChart.{lang}.View.xlsx");
            TranslatedInstanceLogic.ImportExcelFile($"../../../InstanceTranslations/UserQuery.{lang}.View.xlsx");
        }
    }//ImportInstanceTranslations

    public static void ImportWordReportTemplateForOrder()
    {
        var bytes = File.ReadAllBytes("../../../WordAssets.xml");
        var preview = UserAssetsImporter.Preview(bytes);
        using (UserHolder.UserSession(AuthLogic.SystemUser!))
            UserAssetsImporter.Import(bytes, preview);

        new WordTemplateEntity
        {
            Name = "Order template",
            Query = QueryLogic.GetQueryEntity(typeof(OrderEntity)),
            Culture = CultureInfo.GetCultureInfo("en").ToCultureInfoEntity(),
            Template = new FileEntity("../../../WordTemplates/Order.docx").ToLiteFat(),
            FileName = "Order.docx"
        }.Save();
    }

    public static void ImportToolbar()
    {
        var bytes = File.ReadAllBytes("../../../Toolbar.xml");
        var preview = UserAssetsImporter.Preview(bytes);
        using (UserHolder.UserSession(AuthLogic.SystemUser!))
            UserAssetsImporter.Import(bytes, preview);
    }

    public static void ImportPredictor()
    {
        using (AuthLogic.UnsafeUserSession("System"))
        {
            var predictor = new PredictorEntity
            {
                Name = "Product Estimation",
                Algorithm = TensorFlowPredictorAlgorithm.NeuralNetworkGraph,
                ResultSaver = PredictorSimpleResultSaver.Full,
                MainQuery = new PredictorMainQueryEmbedded
                {
                    Query = QueryLogic.GetQueryEntity(typeof(OrderEntity)),
                    GroupResults = true,
                    Columns =
                    {
                        new PredictorColumnEmbedded
                        {
                            Usage = PredictorColumnUsage.Input,
                            Token = new QueryTokenEmbedded("Entity.OrderDate.Year"),
                            Encoding = DefaultColumnEncodings.NormalizeZScore
                        },
                        new PredictorColumnEmbedded
                        {
                            Usage = PredictorColumnUsage.Input,
                            Token = new QueryTokenEmbedded("Entity.OrderDate.Month"),
                            Encoding = DefaultColumnEncodings.NormalizeZScore
                        },
                        new PredictorColumnEmbedded
                        {
                            Usage = PredictorColumnUsage.Input,
                            Token = new QueryTokenEmbedded("Entity.Details.Element.Product"),
                            Encoding = DefaultColumnEncodings.OneHot
                        },
                        new PredictorColumnEmbedded
                        {
                            Usage = PredictorColumnUsage.Output,
                            Token = new QueryTokenEmbedded("Entity.Details.Element.Quantity.Sum"),
                            Encoding = DefaultColumnEncodings.NormalizeZScore
                        },
                    }
                },
                Settings = new PredictorSettingsEmbedded
                {
                    TestPercentage = 0.05,
                },
                AlgorithmSettings = new NeuralNetworkSettingsEntity
                {
                    PredictionType = PredictionType.Regression,
                    Optimizer = TensorFlowOptimizer.GradientDescentOptimizer,
                    LossFunction = NeuralNetworkEvalFunction.MeanSquaredError,
                    EvalErrorFunction = NeuralNetworkEvalFunction.MeanAbsoluteError,
                    LearningRate = 0.0001,
                    MinibatchSize = 100,
                    NumMinibatches = 1000,
                }
            }.ParseData().Execute(PredictorOperation.Save);

            predictor.TrainSync();

            predictor.Execute(PredictorOperation.Publish, ProductPredictorPublication.MonthlySales);
        }
    }//ImportPredictor
}
