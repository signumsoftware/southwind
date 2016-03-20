import * as React from 'react'
import { Route } from 'react-router'
import { ajaxPost, ajaxGet } from '../../../Framework/Signum.React/Scripts/Services';
import { EntitySettings, EmbeddedEntitySettings } from '../../../Framework/Signum.React/Scripts/Navigator'
import * as Navigator from '../../../Framework/Signum.React/Scripts/Navigator'
import { EntityOperationSettings } from '../../../Framework/Signum.React/Scripts/Operations'
import * as Operations from '../../../Framework/Signum.React/Scripts/Operations'

import { getMixin } from '../../../Framework/Signum.React/Scripts/Signum.Entities'
import { UserEntity } from '../../../Extensions/Signum.React.Extensions/Authorization/Signum.Entities.Authorization'

import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../Framework/Signum.React/Scripts/Lines'


import { AddressEntity, OrderDetailsEntity, OrderFilterModel, ApplicationConfigurationEntity, CategoryEntity,
CompanyEntity, EmployeeEntity, OrderEntity, PersonEntity, ProductEntity,
RegionEntity, ShipperEntity, SupplierEntity, TerritoryEntity, UserEmployeeMixin } from './Southwind.Entities'

export function start(options: { routes: JSX.Element[] }) {

    Navigator.addSettings(new EmbeddedEntitySettings(AddressEntity, a => new Promise(resolve => require(['./Templates/Address'], resolve))));
    Navigator.addSettings(new EmbeddedEntitySettings(OrderDetailsEntity, o => new Promise(resolve => require(['./Templates/OrderDetails'], resolve))));
    Navigator.addSettings(new EmbeddedEntitySettings(OrderFilterModel, o => new Promise(resolve => require(['./Templates/OrderFilter'], resolve))));
    Navigator.addSettings(new EntitySettings(ApplicationConfigurationEntity, a => new Promise(resolve => require(['./Templates/ApplicationConfiguration'], resolve))));
    Navigator.addSettings(new EntitySettings(CategoryEntity, c => new Promise(resolve => require(['./Templates/Category'], resolve))));
    Navigator.addSettings(new EntitySettings(CompanyEntity, c => new Promise(resolve => require(['./Templates/Company'], resolve))));
    Navigator.addSettings(new EntitySettings(EmployeeEntity, e => new Promise(resolve => require(['./Templates/Employee'], resolve))));
    Navigator.addSettings(new EntitySettings(OrderEntity, o => new Promise(resolve => require(['./Templates/Order'], resolve))));
    Navigator.addSettings(new EntitySettings(PersonEntity, p => new Promise(resolve => require(['./Templates/Person'], resolve))));
    Navigator.addSettings(new EntitySettings(ProductEntity, p => new Promise(resolve => require(['./Templates/Product'], resolve))));
    Navigator.addSettings(new EntitySettings(RegionEntity, r => new Promise(resolve => require(['./Templates/Region'], resolve))));
    Navigator.addSettings(new EntitySettings(ShipperEntity, s => new Promise(resolve => require(['./Templates/Shipper'], resolve))));
    Navigator.addSettings(new EntitySettings(SupplierEntity, s => new Promise(resolve => require(['./Templates/Supplier'], resolve))));
    Navigator.addSettings(new EntitySettings(TerritoryEntity, t => new Promise(resolve => require(['./Templates/Territory'], resolve))));

    Navigator.getSettings(UserEntity).overrideView((rep) => {
        rep.insertAfter(u => u.role,
            <ValueLine ctx={rep.ctx.subCtx(u => getMixin(u, UserEmployeeMixin).allowLogin) }/>,
            <EntityLine ctx={rep.ctx.subCtx(u => getMixin(u, UserEmployeeMixin).employee) }/>)
    });

    //Operations.addSettings(new EntityOperationSettings(MyEntityOperations.Save, {}));
}

