docker build -f ".\Southwind.React\Dockerfile" . -t southwind
docker tag southwind southwind.azurecr.io/signum/southwind
az acr login --name southwind
docker push southwind.azurecr.io/signum/southwind

$appName = 'southwind-webapp'
$resourceGroup = 'southwind-resourceGroup'
$slotName = 'prod2'
$urlSlot = 'https://southwind-prod2.azurewebsites.net/'
$url = 'https://www.southwind.com'

Write-Host '# STOP slot' $slotName -ForegroundColor DarkRed
az webapp stop --resource-group $resourceGroup --name $appName --slot $slotName
.\Framework\Utils\CheckUrl.exe dead $urlSlot
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
