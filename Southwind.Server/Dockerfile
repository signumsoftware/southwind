
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

## RUN apt-get update
RUN apt-get update && apt-get install -y curl && \
    curl -SLO https://deb.nodesource.com/nsolid_setup_deb.sh && \
    chmod 500 nsolid_setup_deb.sh && \
    ./nsolid_setup_deb.sh 22 && \
    apt-get install -y nodejs && \
    npm install -g yarn && \
    rm -rf /var/lib/apt/lists/*

COPY ["Framework.tar", "/"]
RUN tar -xvf /Framework.tar

COPY ["Southwind/Southwind.csproj", "Southwind/"]
COPY ["Southwind/package.json", "Southwind/"]
COPY ["Southwind.Server/Southwind.Server.csproj", "Southwind.Server/"]
COPY ["Southwind.Server/package.json", "Southwind.Server/"]
COPY ["package.json", ""]
COPY ["yarn.lock", ""]

WORKDIR "/src/Southwind.Server"
RUN yarn install

WORKDIR /src
RUN dotnet restore "Southwind.Server/Southwind.Server.csproj"

COPY . .
ENV TZ=Europe/Berlin
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR "/src/Southwind.Server"
RUN yarn run build

FROM build AS publish
RUN dotnet publish "Southwind.Server.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
RUN apt-get update && apt-get install -y libgdiplus
RUN apt-get update && apt-get install -y libfontconfig1
RUN apt-get update && \
    apt-get install -y libgdiplus libfontconfig1 libgssapi-krb5-2 && \
    rm -rf /var/lib/apt/lists/*
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Southwind.Server.dll"]
