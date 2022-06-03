## az account set -s "<<your southwind subscription Id>>"
az account set -s "ca749d04-8c4e-49bc-a831-a27051939d94"
az acr login --name southwind

docker build -f ".\Southwind.React\Dockerfile" . -t test
docker tag southwind-live southwind.azurecr.io/signum/southwind-test
docker push southwind.azurecr.io/signum/southwind-test

$appName = 'southwind-app-test'
$resourceGroup = 'southwind-test'
$url = 'https://southwind-test.azurewebsites.net/'

Write-Host '# STOP slot' $slotName -ForegroundColor DarkRed
az webapp stop --resource-group $resourceGroup --name $appName
.\Framework\Utils\CheckUrl.exe dead $url
Write-Host

Write-Host '# SQL Migrations' -ForegroundColor Cyan
$env:ASPNETCORE_ENVIRONMENT='production'
Start-Process ".\Southwind.Terminal\bin\Debug\net6.0\Southwind.Terminal.exe" -ArgumentList "sql" -WorkingDirectory ".\Southwind.Terminal\bin\Debug\net6.0\" -NoNewWindow -Wait
Write-Host

Write-Host '# START slot' $slotName -ForegroundColor DarkGreen
az webapp start --resource-group $resourceGroup --name $appName
.\Framework\Utils\CheckUrl.exe alive $url
Write-Host
