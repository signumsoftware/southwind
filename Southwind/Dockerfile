#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:7.0-bullseye-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:7.0-bullseye-slim AS build
WORKDIR /src

## RUN apt-get update
RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn

COPY ["Framework.tar", "/"]
RUN tar -xvf /Framework.tar

COPY ["Southwind/Southwind.csproj", "Southwind/"]
COPY ["Southwind/package.json", "Southwind/"]
COPY ["package.json", ""]
COPY ["yarn.lock", ""]
ENTRYPOINT ["dotnet", "Southwind.dll"]
