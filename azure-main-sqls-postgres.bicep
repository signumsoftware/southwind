//DELETE THIS FILE, azure-main-live-test.bicep instead

targetScope = 'subscription'

param location string
param brodcastSecret string
param firewallMyIP string
param dbAdminPassword string

resource sqlserverRG 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'southwind-sqlserver'
  location: location
}

module containerReg 'azure-container-registry.bicep' = {
  name: 'containerregistry'
  scope: sqlserverRG
  params: {
    location: location
  }
}

module sqlserverEnvironment 'azure-environment.bicep' = {
  name: 'sqlserver'
  params: {
    suffix:'sqlserver'
    dbAdminUser: 'sa-southwind'
    dbFirewallMyIp: firewallMyIP
    dbAdminPassword: dbAdminPassword
    usePostgressDatabase: false
    location: location
    containerRegistryName: containerReg.outputs.containerRegistryName
    containerRegistryId: containerReg.outputs.containerRegistryId
    imageName: 'southwind-live'
    withSlot: true
    brodcastSecret: brodcastSecret
  }
  scope: sqlserverRG
}

resource postgreRG 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'southwind-postgres'
  location: location
}

module postgresEnvironment 'azure-environment.bicep' = {
  name: 'postgres'
  params: {
    suffix: 'postgres'
    dbAdminUser: 'sasouthwind'
    dbFirewallMyIp: firewallMyIP
    dbAdminPassword: dbAdminPassword
    usePostgressDatabase: true
    location: location
    containerRegistryName: containerReg.outputs.containerRegistryName
    containerRegistryId: containerReg.outputs.containerRegistryId 
    imageName: 'southwind-live'
    withSlot: true
    brodcastSecret: brodcastSecret
  }
  scope: postgreRG
}


output containerRegistryName string = containerReg.outputs.containerRegistryName
