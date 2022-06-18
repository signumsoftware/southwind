az account set -s "<<your southwind subscription Id>>"
az acr login --name southwind

docker build -f ".\Southwind.React\Dockerfile" . -t southwind-test
docker tag southwind-test southwind.azurecr.io/signum/southwind-test
docker push southwind.azurecr.io/signum/southwind-test

$appName = 'southwind-app-test'
$resourceGroup = 'southwind-test'
$url = 'https://southwind-app-test.azurewebsites.net/'

Write-Host '# STOP slot' $slotName -ForegroundColor DarkRed
az webapp stop --resource-group $resourceGroup --name $appName
.\Framework\Utils\CheckUrl.exe dead $url
Write-Host

Write-Host '# SQL Migrations' -ForegroundColor Cyan
$env:ASPNETCORE_ENVIRONMENT='test'
Start-Process ".\Southwind.Terminal\bin\Debug\net6.0\Southwind.Terminal.exe" -ArgumentList "sql" -WorkingDirectory ".\Southwind.Terminal\bin\Debug\net6.0\" -NoNewWindow -Wait
Write-Host

Write-Host '# START slot' $slotName -ForegroundColor DarkGreen
az webapp start --resource-group $resourceGroup --name $appName
.\Framework\Utils\CheckUrl.exe alive $url
Write-Host
