
param usePostgressDatabase bool = true
param containerRegistryName string
param containerRegistryId string
param location string = resourceGroup().location
param suffix string
param brodcastSecret string
param dbAdminUser string 
param dbAdminPassword string
param dbFirewallMyIp string
param withSlot bool
param imageName string
targetScope = 'resourceGroup'

resource storageAccount 'Microsoft.Storage/storageAccounts@2021-09-01'={
  name: 'southwindsa${suffix}'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {}
  resource blobservice 'blobServices' = {
    name: 'default'
    properties: {
      deleteRetentionPolicy: {
        allowPermanentDelete: false
        enabled: false
      }
    }
    
  }
}

resource sqlserver 'Microsoft.Sql/servers@2021-11-01-preview' = if(usePostgressDatabase == false) {
  name: 'southwind-server-${suffix}'
  location: location
  properties: {
    administratorLogin: dbAdminUser
    administratorLoginPassword: dbAdminPassword
    version: '12.0'
  }

  resource azureFirewallRule 'firewallRules' = {
    name: 'AllowAllWindowsAzureIps'
    properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
    }
  }

  resource myFirewallRule 'firewallRules' = if(!empty(dbFirewallMyIp)) {
    name: 'my-allowed-ip'
    properties: {
      startIpAddress: dbFirewallMyIp
      endIpAddress: dbFirewallMyIp
    }
  }

  resource database 'databases' = {
    name: 'southwind-database-${suffix}'
    location: location
    sku: {
      name: 'Basic'
      tier: 'Basic'
    }
    properties: {
      collation: 'SQL_Latin1_General_CP1_CI_AS'
      requestedBackupStorageRedundancy: 'Zone'
    }
  }
}


resource postgesqlServer 'Microsoft.DBforPostgreSQL/servers@2017-12-01'  = if(usePostgressDatabase == true) {
  name: 'southwind-server-${suffix}'
  location: location
  sku: {
    name: 'B_Gen5_1'
    tier: 'Basic'
    family: 'Gen5'
    capacity: 1
  }
  properties: {
    storageProfile: {
      storageMB: 5120
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
      storageAutogrow: 'Enabled'
    }
    version: '11'
    sslEnforcement: 'Disabled'
    minimalTlsVersion: 'TLSEnforcementDisabled'
    infrastructureEncryption: 'Disabled'
    publicNetworkAccess: 'Enabled'
    createMode: 'Default'
    administratorLogin: dbAdminUser
    administratorLoginPassword: dbAdminPassword
  }

  resource firewallRule 'firewallRules' = if(!empty(dbFirewallMyIp)) {
    name: 'my-allowed-ip-2'
    properties: {
      startIpAddress: dbFirewallMyIp
      endIpAddress: dbFirewallMyIp
    }
  }

  resource azureFirewallRule 'firewallRules' = {
    name: 'AllowAllWindowsAzureIps'
    properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
    }
  }

  resource database 'databases' = {
    name: 'southwind-database-${suffix}'
    properties: {
      charset: 'UTF8'
      collation: 'English_United States.1252'
    }
  }
}

var storageAccountConnection  = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${listKeys(storageAccount.id, storageAccount.apiVersion).keys[0].value}'
var sqlConnectionString = 'Server=tcp:${sqlserver.name}${environment().suffixes.sqlServerHostname},1433;Initial Catalog=${sqlserver::database.name};Persist Security Info=False;User ID=${dbAdminUser};Password=${dbAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
var postgresConnectionString = 'Server=${postgesqlServer.name}.postgres.database.azure.com;Database=${postgesqlServer::database.name};Port=5432;User Id=${dbAdminUser}@${postgesqlServer.name};Password=${dbAdminPassword};Ssl Mode=Require;Trust Server Certificate=true'

var brodcastUrls = 'https://southwind-app-${suffix}.azurewebsites.net;https://southwind-app-${suffix}-behind.azurewebsites.net'

resource servicePlan 'Microsoft.Web/serverfarms@2021-03-01' = {
  name: 'southwind-service-plan-${suffix}'
  location: location
  kind: 'linux'
  properties: {
    reserved: true
  }
  sku: withSlot ? {
    name: 'S1'
    tier: 'Standard'
    size: 'S1'
    family: 'S'
    capacity: 1
  } :  {
    name: 'B1'
    tier: 'Basic'
    size: 'B1'
    family: 'B'
    capacity: 1
  }
}

resource app 'Microsoft.Web/sites@2021-03-01' = {
  name: 'southwind-app-${suffix}'
  location: location
  kind: 'app,linux,container'
  properties: {
    serverFarmId: servicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${containerRegistryName}.azurecr.io/signum/${imageName}:latest'
      appSettings: [
        { 
          name: 'ServerName'
          value: 'blue'
        }
        {
          name: 'BroadcastSecret'
          value: brodcastSecret
        }
        {
          name: 'BroadcastUrls'
          value: brodcastUrls
        }
        {
          name: 'StartBackgroundProcesses'
          value: 'true'
        }
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
          value: listCredentials(containerRegistryId, '2020-11-01-preview').passwords[0].value
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${containerRegistryName}.azurecr.io'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_USERNAME'
          value: containerRegistryName
        }
        {
          name: 'IsPostgres'
          value: usePostgressDatabase ? 'true' : 'false'
        }
      ]
      connectionStrings: [
        {
          name: 'ConnectionString'
          connectionString: usePostgressDatabase ? postgresConnectionString : sqlConnectionString
          type: usePostgressDatabase ? 'SQLServer'/*'PostgreSQL'*/ : 'SQLServer'
        }
        {
          name: 'AzureStorageConnectionString'
          connectionString: storageAccountConnection
          type: 'Custom'
        }
      ]
    }
  }



  resource slot 'slots' = if(withSlot){
    name: 'behind'
    location: location
    kind: 'app,linux,container'
    properties: {
      siteConfig: {
        linuxFxVersion: 'DOCKER|${containerRegistryName}.azurecr.io/signum/${imageName}:latest'
        appSettings: [
          { 
            name: 'ServerName'
            value: 'green'
          }
          {
            name: 'BroadcastSecret'
            value: brodcastSecret
          }
          {
            name: 'BroadcastUrls'
            value: brodcastUrls
          }
          // {
          //   name: 'StartBackgroundProcesses'
          //   value: 'true'
          // }
          {
            name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
            value: 'false'
          }
          {
            name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
            value: listCredentials(containerRegistryId, '2020-11-01-preview').passwords[0].value
          }
          {
            name: 'DOCKER_REGISTRY_SERVER_URL'
            value: 'https://${containerRegistryName}.azurecr.io'
          }
          {
            name: 'DOCKER_REGISTRY_SERVER_USERNAME'
            value: containerRegistryName
          }
          {
            name: 'IsPostgres'
            value: usePostgressDatabase ? 'true' : 'false'
          }
        ]
        connectionStrings: [
          {
            name: 'ConnectionString'
            connectionString: usePostgressDatabase ? postgresConnectionString : sqlConnectionString
            type: usePostgressDatabase ? 'SQLServer'/*'PostgreSQL'*/ : 'SQLServer'
          }
          {
            name: 'AzureStorageConnectionString'
            connectionString: storageAccountConnection
          }
        ]
      } 
    }
  }
}
