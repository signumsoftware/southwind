docker build -f ".\Southwind.React\Dockerfile" . -t southwind
docker tag southwind southwind.azurecr.io/signum/southwind
az acr login --name southwind
docker push southwind.azurecr.io/signum/southwind
