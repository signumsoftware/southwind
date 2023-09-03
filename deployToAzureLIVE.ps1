az account set -s "<<your southwind subscription Id>>"
az acr login --name southwind
if(-Not $?){ Write-Host '"az acr login" failed' -ForegroundColor DarkRed; exit; }


Get-ChildItem -Path "Framework" -Recurse -Include "package.json","*.csproj" | Resolve-Path -Relative | tar -cf Framework.tar -T -
docker build -f ".\Southwind\Dockerfile" . -t southwind-live
if(-Not $?){ Write-Host '"docker build" failed' -ForegroundColor DarkRed; exit; }

docker tag southwind-live southwind.azurecr.io/signum/southwind-live
docker push southwind.azurecr.io/signum/southwind-live
if(-Not $?){ Write-Host '"docker push" failed' -ForegroundColor DarkRed; exit; }


$appName = 'southwind-app-live'
$resourceGroup = 'southwind-live'
$slotName = 'behind'
$urlSlot = 'https://southwind-app-live-behind.azurewebsites.net/'
$url = 'https://southwind-app-live.azurewebsites.net/'

Write-Host '# STOP slot' $slotName -ForegroundColor DarkRed
az webapp stop --resource-group $resourceGroup --name $appName --slot $slotName
.\Framework\Utils\CheckUrl.exe dead $urlSlot
Write-Host

Write-Host '# SQL Migrations' -ForegroundColor Cyan
$env:ASPNETCORE_ENVIRONMENT='live'
$p = (Start-Process ".\Southwind.Terminal\bin\Debug\net7.0\Southwind.Terminal.exe" -ArgumentList "sql" -WorkingDirectory ".\Southwind.Terminal\bin\Debug\net7.0\" -NoNewWindow -Wait -PassThru)
if($p.ExitCode -eq -1){ Write-Host '"SQL Migrations" failed' -ForegroundColor DarkRed; exit; }

Write-Host

Write-Host '# START slot' $slotName -ForegroundColor DarkGreen
az webapp start --resource-group $resourceGroup --name $appName --slot $slotName
.\Framework\Utils\CheckUrl.exe alive $urlSlot
Write-Host

Write-Host '# SWAP slots' $slotName '<-> production' -ForegroundColor Magenta
az webapp deployment slot swap --resource-group $resourceGroup --name $appName --slot $slotName
.\Framework\Utils\CheckUrl.exe alive $url
Write-Host

Write-Host '# STOP slot' $slotName -ForegroundColor DarkRed
az webapp stop --resource-group $resourceGroup --name $appName --slot $slotName
.\Framework\Utils\CheckUrl.exe dead $urlSlot
Write-Host

Write-Host '# START slot' $slotName -ForegroundColor DarkGreen
az webapp start --resource-group $resourceGroup --name $appName --slot $slotName
.\Framework\Utils\CheckUrl.exe alive $urlSlot
Write-Host
