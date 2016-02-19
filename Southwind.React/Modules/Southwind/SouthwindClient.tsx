import * as React from 'react'
import { Route } from 'react-router'
import { ajaxPost, ajaxGet } from '../../../Framework/Signum.React/Scripts/Services';
import { EntitySettings, EmbeddedEntitySettings } from '../../../Framework/Signum.React/Scripts/Navigator'
import * as Navigator from '../../../Framework/Signum.React/Scripts/Navigator'
import { EntityOperationSettings } from '../../../Framework/Signum.React/Scripts/Operations'
import * as Operations from '../../../Framework/Signum.React/Scripts/Operations'

import { getMixin } from '../../../Framework/Signum.React/Scripts/Signum.Entities'
import { UserEntity_Type } from '../../../Extensions/Signum.React.Extensions/Authorization/Signum.Entities.Authorization'

import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../Framework/Signum.React/Scripts/Lines'


import { AddressEntity_Type, OrderDetailsEntity_Type, OrderFilterModel_Type, ApplicationConfigurationEntity_Type, CategoryEntity_Type,
CompanyEntity_Type, EmployeeEntity_Type, OrderEntity_Type, PersonEntity_Type, ProductEntity_Type,
RegionEntity_Type, ShipperEntity_Type, SupplierEntity_Type, TerritoryEntity_Type, UserEmployeeMixin_Type } from './Southwind.Entities'

export function start(options: { routes: JSX.Element[] }) {

    Navigator.addSettings(new EmbeddedEntitySettings(AddressEntity_Type, a => new Promise(resolve => require(['./Templates/Address'], resolve))));
    Navigator.addSettings(new EmbeddedEntitySettings(OrderDetailsEntity_Type, o => new Promise(resolve => require(['./Templates/OrderDetails'], resolve))));
    Navigator.addSettings(new EmbeddedEntitySettings(OrderFilterModel_Type, o => new Promise(resolve => require(['./Templates/OrderFilter'], resolve))));
    Navigator.addSettings(new EntitySettings(ApplicationConfigurationEntity_Type, a => new Promise(resolve => require(['./Templates/ApplicationConfiguration'], resolve))));
    Navigator.addSettings(new EntitySettings(CategoryEntity_Type, c => new Promise(resolve => require(['./Templates/Category'], resolve))));
    Navigator.addSettings(new EntitySettings(CompanyEntity_Type, c => new Promise(resolve => require(['./Templates/Company'], resolve))));
    Navigator.addSettings(new EntitySettings(EmployeeEntity_Type, e => new Promise(resolve => require(['./Templates/Employee'], resolve))));
    Navigator.addSettings(new EntitySettings(OrderEntity_Type, o => new Promise(resolve => require(['./Templates/Order'], resolve))));
    Navigator.addSettings(new EntitySettings(PersonEntity_Type, p => new Promise(resolve => require(['./Templates/Person'], resolve))));
    Navigator.addSettings(new EntitySettings(ProductEntity_Type, p => new Promise(resolve => require(['./Templates/Product'], resolve))));
    Navigator.addSettings(new EntitySettings(RegionEntity_Type, r => new Promise(resolve => require(['./Templates/Region'], resolve))));
    Navigator.addSettings(new EntitySettings(ShipperEntity_Type, s => new Promise(resolve => require(['./Templates/Shipper'], resolve))));
    Navigator.addSettings(new EntitySettings(SupplierEntity_Type, s => new Promise(resolve => require(['./Templates/Supplier'], resolve))));
    Navigator.addSettings(new EntitySettings(TerritoryEntity_Type, t => new Promise(resolve => require(['./Templates/Territory'], resolve))));

    Navigator.getSettings(UserEntity_Type).overrideView((rep) => {
        rep.insertAfter(u => u.role,
            <ValueLine ctx={rep.ctx.subCtx(u => getMixin(u, UserEmployeeMixin_Type).allowLogin) }/>,
            <EntityLine ctx={rep.ctx.subCtx(u => getMixin(u, UserEmployeeMixin_Type).employee) }/>)
    });

    //Operations.addSettings(new EntityOperationSettings(MyEntityOperations.Save, {}));
}

