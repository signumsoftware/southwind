#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0.0-bullseye-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0.100-bullseye-slim AS build
WORKDIR /src

## RUN apt-get update
RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_15.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn

COPY ["Framework/Signum.Utilities/Signum.Utilities.csproj", "Framework/Signum.Utilities/"]
COPY ["Framework/Signum.Entities/Signum.Entities.csproj", "Framework/Signum.Entities/"]
COPY ["Framework/Signum.Engine/Signum.Engine.csproj", "Framework/Signum.Engine/"]
COPY ["Framework/Signum.React/Signum.React.csproj", "Framework/Signum.React/"]
COPY ["Framework/Signum.React/package.json", "Framework/Signum.React/"]
COPY ["Framework/Signum.React/yarn.lock", "Framework/Signum.React/"]


COPY ["Extensions/Signum.Entities.Extensions/Signum.Entities.Extensions.csproj", "Extensions/Signum.Entities.Extensions/"]
COPY ["Extensions/Signum.Engine.Extensions/Signum.Engine.Extensions.csproj", "Extensions/Signum.Engine.Extensions/"]
COPY ["Extensions/Signum.Engine.MachineLearning.TensorFlow/Signum.Engine.MachineLearning.TensorFlow.csproj", "Extensions/Signum.Engine.MachineLearning.TensorFlow/"]
COPY ["Extensions/Signum.React.Extensions/Signum.React.Extensions.csproj", "Extensions/Signum.React.Extensions/"]
COPY ["Extensions/Signum.React.Extensions/package.json", "Extensions/Signum.React.Extensions/"]
COPY ["Extensions/Signum.React.Extensions/yarn.lock", "Extensions/Signum.React.Extensions/"]

COPY ["Southwind.Entities/Southwind.Entities.csproj", "Southwind.Entities/"]
COPY ["Southwind.Logic/Southwind.Logic.csproj", "Southwind.Logic/"]
COPY ["Southwind.React/Southwind.React.csproj", "Southwind.React/"]
COPY ["Southwind.React/package.json", "Southwind.React/"]
COPY ["Southwind.React/yarn.lock", "Southwind.React/"]

WORKDIR "/src/Southwind.React"
RUN yarn install

WORKDIR /src
RUN dotnet restore "Southwind.React/Southwind.React.csproj"

COPY . .
ENV TZ=Europe/Berlin
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR "/src/Southwind.React"
# RUN yarn run build-production
RUN yarn run build-production

FROM build AS publish
RUN dotnet publish "Southwind.React.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Southwind.React.dll"]
