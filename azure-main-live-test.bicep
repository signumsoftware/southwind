//How To run:
// 1. Install Azure CLI https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
// 2. az login
// 3. az account set -s <<your subscription id>>
// 5. az deployment sub what-if --resource-group southwind-rg --template-file azure-main-live-test.bicep
// 6. az deployment sub create --resource-group southwind-rg --template-file azure-main-live-test.bicep

targetScope = 'subscription'

param location string
param brodcastSecret string
param firewallMyIP string
param dbAdminPassword string

resource liveRG 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'southwind-live'
  location: location
}

module containerReg 'azure-container-registry.bicep' = {
  name: 'containerregistry'
  scope: liveRG
  params: {
    location: location
  }
}

module liveEnvironment 'azure-environment.bicep' = {
  name: 'live'
  params: {
    suffix: 'live'
    dbAdminUser: 'sa-southwind'
    dbFirewallMyIp: firewallMyIP
    dbAdminPassword: dbAdminPassword
    usePostgressDatabase: false
    location: location
    containerRegistryName: containerReg.outputs.containerRegistryName
    containerRegistryId: containerReg.outputs.containerRegistryId
    isTestEnvironment: false
    brodcastSecret: brodcastSecret
  }
  scope: liveRG
}

resource testRG 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'southwind-test'
  location: location
}

module testEnvironment 'azure-environment.bicep' = {
  name: 'test'
  params: {
    suffix:'test'
    dbAdminUser: 'sa-southwind'
    dbFirewallMyIp: firewallMyIP
    dbAdminPassword: dbAdminPassword
    usePostgressDatabase: false
    location: location
    containerRegistryName: containerReg.outputs.containerRegistryName
    containerRegistryId: containerReg.outputs.containerRegistryId
    isTestEnvironment: true
    brodcastSecret: brodcastSecret
  }
  scope: testRG
}




output containerRegistryName string = containerReg.outputs.containerRegistryName 
