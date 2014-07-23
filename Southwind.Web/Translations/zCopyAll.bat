@echo off
xcopy Signum.Utilities.??.xml ..\..\Framework\Signum.Utilities\Translations /y
xcopy Signum.Entities.??.xml ..\..\Framework\Signum.Entities\Translations /y
xcopy Signum.Entities.Extensions.??.xml ..\..\Extensions\Signum.Entities.Extensions\Translations /y
xcopy Southwind.Entities.*??.xml ..\..\Southwind.Entities\Translations /y