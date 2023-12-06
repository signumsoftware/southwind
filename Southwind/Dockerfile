
FROM mcr.microsoft.com/dotnet/aspnet:7.0-bullseye-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:7.0-bullseye-slim AS build
WORKDIR /src

## RUN apt-get update
RUN apt-get -y install curl
RUN curl -SLO https://deb.nodesource.com/nsolid_setup_deb.sh
RUN chmod 500 nsolid_setup_deb.sh
RUN ./nsolid_setup_deb.sh 21
RUN apt-get install -y nodejs
RUN npm install -g yarn

COPY ["Framework.tar", "/"]
RUN tar -xvf /Framework.tar

COPY ["Southwind/Southwind.csproj", "Southwind/"]
COPY ["Southwind/package.json", "Southwind/"]
COPY ["package.json", ""]
COPY ["yarn.lock", ""]

WORKDIR "/src/Southwind"
RUN yarn install

WORKDIR /src
RUN dotnet restore "Southwind/Southwind.csproj"

COPY . .
ENV TZ=Europe/Berlin
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR "/src/Southwind"
RUN yarn run build-production

FROM build AS publish
RUN dotnet publish "Southwind.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
RUN apt-get update && apt-get install -y libgdiplus
RUN apt-get update && apt-get install -y libfontconfig1
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Southwind.dll"]
