import * as React from 'react'
import { Route } from 'react-router'
import * as moment from 'moment'
import { ajaxPost, ajaxGet } from '@framework/Services';
import { EntitySettings, ViewPromise } from '@framework/Navigator'
import * as Navigator from '@framework/Navigator'
import * as Finder from '@framework/Finder'
import { EntityOperationSettings, ConstructorOperationSettings, ContextualOperationSettings } from '@framework/Operations'
import * as Operations from '@framework/Operations'
import { Retrieve } from '@framework/Retrieve'
import { defaultContextualClick } from '@framework/Operations/ContextualOperations'
import { defaultExecuteEntity } from '@framework/Operations/EntityOperations'

import { getMixin, Entity, Lite } from '@framework/Signum.Entities'
import { UserEntity } from '@extensions/Authorization/Signum.Entities.Authorization'
import { FileEmbedded, FileEntity } from '@extensions/Files/Signum.Entities.Files'

import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '@framework/Lines'
import ValueLineModal from '@framework/ValueLineModal'

import OrderFilter from './Templates/OrderFilter'

import { ApplicationConfigurationEntity } from './Southwind.Entities'

import { /*Southwind.Entities*/
    AddressEmbedded, OrderDetailEmbedded, OrderFilterModel, CategoryEntity,
    CustomerQuery, CompanyEntity, EmployeeEntity, OrderEntity, PersonEntity, ProductEntity,
    RegionEntity, ShipperEntity, SupplierEntity, TerritoryEntity, UserEmployeeMixin, OrderOperation, CustomerEntity, OrderState
} from './Southwind.Entities'


export function start(options: { routes: JSX.Element[] }) {

    Navigator.addSettings(new EntitySettings(ApplicationConfigurationEntity, a => import('./Templates/ApplicationConfiguration')));
    Navigator.addSettings(new EntitySettings(AddressEmbedded, a => import('./Templates/Address')));
    Navigator.addSettings(new EntitySettings(CategoryEntity, c => import('./Templates/Category')));
    Navigator.addSettings(new EntitySettings(CompanyEntity, c => import('./Templates/Company')));
    //Navigator.addSettings(new EntitySettings(EmployeeEntity, e => import('./Templates/Employee')));
    Navigator.addSettings(new EntitySettings(OrderEntity, o => import('./Templates/Order')));
    Navigator.addSettings(new EntitySettings(PersonEntity, p => import('./Templates/Person')));
    Navigator.addSettings(new EntitySettings(ProductEntity, p => import('./Templates/Product')));
    Navigator.addSettings(new EntitySettings(SupplierEntity, s => import('./Templates/Supplier')));

    /* If no view is detected DynamicComponent creates one automatically*/
    //Navigator.addSettings(new EntitySettings(RegionEntity, r => import('./Templates/Region')));
    //Navigator.addSettings(new EntitySettings(ShipperEntity, s => import('./Templates/Shipper')));
    //Navigator.addSettings(new EntitySettings(TerritoryEntity, t => import('./Templates/Territory')));

    Navigator.getSettings(UserEntity)!.overrideView((rep) => {
        rep.insertAfterLine(u => u.role, ctx => [
            <ValueLine ctx={ctx.subCtx(UserEmployeeMixin).subCtx(uem => uem.allowLogin)} />,
            <EntityLine ctx={ctx.subCtx(UserEmployeeMixin).subCtx(uem => uem.employee)} />
        ])
    });


    {/*Files*/}
    const maxDimensions: React.CSSProperties = { maxWidth: "96px", maxHeight: "96px" };
    Finder.registerPropertyFormatter(CategoryEntity.propertyRoute(ca => ca.picture),
        new Finder.CellFormatter((cell: FileEmbedded) => <img style={maxDimensions} src={"data:image/jpeg;base64," + cell.binaryFile} />));

    Finder.registerPropertyFormatter(EmployeeEntity.propertyRoute(ca => ca.photo),
        new Finder.CellFormatter((cell: Lite<FileEntity>) => Retrieve.create(cell,
            file => file && <img style={maxDimensions} src={"data:image/jpeg;base64," + (file as FileEntity).binaryFile} />)));
    {/*Files*/}

    Finder.addSettings({
        queryName: OrderEntity,
        simpleFilterBuilder: (qd, fop) => {
            const model = OrderFilter.extract(fop);

            if (!model)
                return undefined;

            return <OrderFilter ctx={TypeContext.root(model) }/>;
        },
        hiddenColumns: [{ token: "State" }], 
        rowAttributes: (row, columns) => {
            var state = row.columns[columns.indexOf("State")] as OrderState;

            var color = state == "Canceled" ? "darkred" :
                state == "Shipped" ? "gray" :
                    "black";

            return { style: { color: color } };
        } 
    });
    
    Operations.addSettings(new ConstructorOperationSettings(OrderOperation.Create, {
        onConstruct: coc =>
        {
            return Finder.find({ queryName: CustomerQuery.Customer }).then(c => {
                if (!c)
                    return undefined;

                return coc.defaultConstruct(c);
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
                .then(date => eoc.defaultClick(date))
                .done();
        },
        contextual: {
            onClick: coc => {
                selectShippedDate()
                    .then(date => coc.defaultContextualClick(date))
                    .done();
            }
        }
    }));//Ship
}
