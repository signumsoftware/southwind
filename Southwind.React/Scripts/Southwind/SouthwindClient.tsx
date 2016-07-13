import * as React from 'react'
import { Route } from 'react-router'
import * as moment from 'moment'
import { ajaxPost, ajaxGet } from '../../../Framework/Signum.React/Scripts/Services';
import { EntitySettings } from '../../../Framework/Signum.React/Scripts/Navigator'
import * as Navigator from '../../../Framework/Signum.React/Scripts/Navigator'
import * as Finder from '../../../Framework/Signum.React/Scripts/Finder'
import { EntityOperationSettings, ConstructorOperationSettings, ContextualOperationSettings } from '../../../Framework/Signum.React/Scripts/Operations'
import * as Operations from '../../../Framework/Signum.React/Scripts/Operations'
import { navigateOrTab, defaultContextualClick } from '../../../Framework/Signum.React/Scripts/Operations/ContextualOperations'
import { defaultExecuteEntity } from '../../../Framework/Signum.React/Scripts/Operations/EntityOperations'

import { getMixin } from '../../../Framework/Signum.React/Scripts/Signum.Entities'
import { UserEntity } from '../../../Extensions/Signum.React.Extensions/Authorization/Signum.Entities.Authorization'

import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../Framework/Signum.React/Scripts/Lines'
import ValueLineModal from '../../../Framework/Signum.React/Scripts/ValueLineModal'

import OrderFilter from './Templates/OrderFilter'


import { AddressEntity, OrderDetailsEntity, OrderFilterModel, ApplicationConfigurationEntity, CategoryEntity,
    CompanyEntity, EmployeeEntity, OrderEntity, PersonEntity, ProductEntity,
    RegionEntity, ShipperEntity, SupplierEntity, TerritoryEntity, UserEmployeeMixin, OrderOperation, CustomerEntity } from './Southwind.Entities'

export function start(options: { routes: JSX.Element[] }) {

    Navigator.addSettings(new EntitySettings(AddressEntity, a => new Promise(resolve => require(['./Templates/Address'], resolve))));
    Navigator.addSettings(new EntitySettings(OrderDetailsEntity, o => new Promise(resolve => require(['./Templates/OrderDetails'], resolve))));
    Navigator.addSettings(new EntitySettings(OrderFilterModel, o => new Promise(resolve => require(['./Templates/OrderFilter'], resolve))));
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
            <ValueLine ctx={rep.ctx.subCtx(u => getMixin(u, UserEmployeeMixin).allowLogin, { labelColumns: { sm: 3 } }) }/>,
            <EntityLine ctx={rep.ctx.subCtx(u => getMixin(u, UserEmployeeMixin).employee, { labelColumns: { sm: 3 } }) }/>)
    });

    Finder.addSettings({
        queryName: OrderEntity,
        simpleFilterBuilder: (qd, fo) => {
            const model = OrderFilter.extract(fo);

            if (!model)
                return undefined;

            return <OrderFilter ctx={TypeContext.root(OrderFilterModel, model) }/>;
        }
    });
    

    Operations.addSettings(new ConstructorOperationSettings(OrderOperation.Create, {
        onConstruct: coc =>
        {
            return Finder.find({ queryName: "Customer" }).then(c => {
                if (!c)
                    return undefined;

                return Operations.API.construct(coc.typeInfo.name, coc.operationInfo.key, c);
            });
        }
    }));

    Operations.addSettings(new ContextualOperationSettings(OrderOperation.CreateOrderFromProducts, {
        onClick: (coc, e) => {
            return Finder.find({ queryName: "Customer" }).then(c => {
                if (!c)
                    return undefined;

                return Operations.API.constructFromMany(coc.context.lites, coc.operationInfo.key, c)
                    .then(ep => navigateOrTab(ep, e))
                    .done();
            }).done();
        }
    }));

    const selectShippedDate = () => ValueLineModal.show({
        type: { name: "datetime" },
        value: moment().format(),
        labelText: OrderEntity.nicePropertyName(a => a.shippedDate)
    });


    Operations.addSettings(new EntityOperationSettings(OrderOperation.Ship, {
        onClick: (eoc) => {
            selectShippedDate()
                .then(date => defaultExecuteEntity(eoc, date))
                .done();
        },
        contextual: {
            onClick: coc => {
                selectShippedDate()
                    .then(date => defaultContextualClick(coc, date))
                    .done();
            }
        }
    }));
}

