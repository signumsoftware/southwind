# DELETE THIS FILE, use deployToAzureLIVE.ps1 / deployToAzureTEST.ps1 instead

az account set -s "<<your southwind subscription Id>>"
az acr login --name southwind
if(-Not $?){ Write-Host '"az acr login" failed' -ForegroundColor DarkRed; exit; }

Get-ChildItem -Path "Framework" -Recurse -Include "package.json","*.csproj" | Resolve-Path -Relative | tar -cf Framework.tar -T -
docker build -f ".\Southwind.Server\Dockerfile" . -t southwind-test
if(-Not $?){ Write-Host '"docker build" failed' -ForegroundColor DarkRed; exit; }

docker tag southwind-test southwind.azurecr.io/signum/southwind-test
docker push southwind.azurecr.io/signum/southwind-test
if(-Not $?){ Write-Host '"docker push" failed' -ForegroundColor DarkRed; exit; }


$appName = 'southwind-app-sqlserver'
$resourceGroup = 'southwind-sqlserver'
$url = 'https://southwind-app-sqlserver.azurewebsites.net/'

# $appName = 'southwind-app-postgres'
# $resourceGroup = 'southwind-postgres'
# $url = 'https://southwind-app-postgres.azurewebsites.net/'

Write-Host '# STOP slot' $slotName -ForegroundColor DarkRed
az webapp stop --resource-group $resourceGroup --name $appName
.\Framework\Utils\CheckUrl.exe dead $url
Write-Host

Write-Host '# SQL Migrations' -ForegroundColor Cyan
$env:ASPNETCORE_ENVIRONMENT='test'
$p = (Start-Process ".\Southwind.Terminal\bin\Debug\net8.0\Southwind.Terminal.exe" -ArgumentList "sql" -WorkingDirectory ".\Southwind.Terminal\bin\Debug\net8.0\" -NoNewWindow -Wait -PassThru)
if($p.ExitCode -eq -1){ Write-Host '"SQL Migrations" failed' -ForegroundColor DarkRed; exit; }

Write-Host

Write-Host '# START slot' $slotName -ForegroundColor DarkGreen
az webapp start --resource-group $resourceGroup --name $appName
.\Framework\Utils\CheckUrl.exe alive $url
Write-Host
