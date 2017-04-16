import * as React from 'react'
import { Route } from 'react-router'
import * as moment from 'moment'
import { ajaxPost, ajaxGet } from '../../../Framework/Signum.React/Scripts/Services';
import { EntitySettings, ViewPromise } from '../../../Framework/Signum.React/Scripts/Navigator'
import * as Navigator from '../../../Framework/Signum.React/Scripts/Navigator'
import * as Finder from '../../../Framework/Signum.React/Scripts/Finder'
import { EntityOperationSettings, ConstructorOperationSettings, ContextualOperationSettings } from '../../../Framework/Signum.React/Scripts/Operations'
import * as Operations from '../../../Framework/Signum.React/Scripts/Operations'
import { defaultContextualClick } from '../../../Framework/Signum.React/Scripts/Operations/ContextualOperations'
import { defaultExecuteEntity } from '../../../Framework/Signum.React/Scripts/Operations/EntityOperations'

import { getMixin } from '../../../Framework/Signum.React/Scripts/Signum.Entities'
import { UserEntity } from '../../../Extensions/Signum.React.Extensions/Authorization/Signum.Entities.Authorization'
import { EmbeddedFileEntity } from '../../../Extensions/Signum.React.Extensions/Files/Signum.Entities.Files'

import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../Framework/Signum.React/Scripts/Lines'
import ValueLineModal from '../../../Framework/Signum.React/Scripts/ValueLineModal'

import OrderFilter from './Templates/OrderFilter'

import { ApplicationConfigurationEntity } from './Southwind.Entities'

import { /*Southwind.Entities*/
    AddressEmbedded, OrderDetailEmbedded, OrderFilterModel, CategoryEntity,
    CustomerQuery, CompanyEntity, EmployeeEntity, OrderEntity, PersonEntity, ProductEntity,
    RegionEntity, ShipperEntity, SupplierEntity, TerritoryEntity, UserEmployeeMixin, OrderOperation, CustomerEntity
} from './Southwind.Entities'

export function start(options: { routes: JSX.Element[] }) {

    Navigator.addSettings(new EntitySettings(ApplicationConfigurationEntity, a => new ViewPromise(resolve => require(['./Templates/ApplicationConfiguration'], resolve))));
    Navigator.addSettings(new EntitySettings(AddressEmbedded, a => new ViewPromise(resolve => require(['./Templates/Address'], resolve))));
    Navigator.addSettings(new EntitySettings(CategoryEntity, c => new ViewPromise(resolve => require(['./Templates/Category'], resolve))));
    Navigator.addSettings(new EntitySettings(CompanyEntity, c => new ViewPromise(resolve => require(['./Templates/Company'], resolve))));
    Navigator.addSettings(new EntitySettings(EmployeeEntity, e => new ViewPromise(resolve => require(['./Templates/Employee'], resolve))));
    Navigator.addSettings(new EntitySettings(OrderEntity, o => new ViewPromise(resolve => require(['./Templates/Order'], resolve))));
    Navigator.addSettings(new EntitySettings(PersonEntity, p => new ViewPromise(resolve => require(['./Templates/Person'], resolve))));
    Navigator.addSettings(new EntitySettings(ProductEntity, p => new ViewPromise(resolve => require(['./Templates/Product'], resolve))));
    Navigator.addSettings(new EntitySettings(SupplierEntity, s => new ViewPromise(resolve => require(['./Templates/Supplier'], resolve))));

    /* If no view is detected DynamicComponent creates one automatically*/
    //Navigator.addSettings(new EntitySettings(RegionEntity, r => new ViewPromise(resolve => require(['./Templates/Region'], resolve))));
    //Navigator.addSettings(new EntitySettings(ShipperEntity, s => new ViewPromise(resolve => require(['./Templates/Shipper'], resolve))));
    //Navigator.addSettings(new EntitySettings(TerritoryEntity, t => new ViewPromise(resolve => require(['./Templates/Territory'], resolve))));

    Navigator.getSettings(UserEntity)!.overrideView((rep) => {
        rep.insertAfter(u => u.role,
            <ValueLine ctx={rep.ctx.subCtx(u => getMixin(u, UserEmployeeMixin).allowLogin, { labelColumns: { sm: 3 } }) }/>,
            <EntityLine ctx={rep.ctx.subCtx(u => getMixin(u, UserEmployeeMixin).employee, { labelColumns: { sm: 3 } }) }/>)
    });


    {/*Files*/}
    const maxDimensions: React.CSSProperties = { maxWidth: "96px", maxHeight: "96px" };
    Finder.registerPropertyFormatter(CategoryEntity.propertyRoute(ca => ca.picture),
        new Finder.CellFormatter((cell: EmbeddedFileEntity) => <img style={maxDimensions} src={"data:image/jpeg;base64," + cell.binaryFile} />));
    {/*Files*/}

    Finder.addSettings({
        queryName: OrderEntity,
        simpleFilterBuilder: (qd, fop) => {
            const model = OrderFilter.extract(fop);

            if (!model)
                return undefined;

            return <OrderFilter ctx={TypeContext.root(model) }/>;
        }
    });
    

    Operations.addSettings(new ConstructorOperationSettings(OrderOperation.Create, {
        onConstruct: coc =>
        {
            return Finder.find({ queryName: CustomerQuery.Customer }).then(c => {
                if (!c)
                    return Promise.resolve(undefined);

                return Operations.API.construct(coc.typeInfo.name, coc.operationInfo.key, c);
            });
        }
    }));

    Operations.addSettings(new ContextualOperationSettings(OrderOperation.CreateOrderFromProducts, {
        onClick: coc => {
            return Finder.find({ queryName: CustomerQuery.Customer })
                .then(c => {
                    if (!c)
                        return;

                    return coc.defaultContextualClick(c);
                }).done();
        }
    }));

    const selectShippedDate = () => ValueLineModal.show({
        type: { name: "datetime" },
        initialValue: moment().format(),
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
    }));//Ship
}

