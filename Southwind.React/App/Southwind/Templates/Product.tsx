import * as React from 'react'
import { ProductEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, FormControlStatic, FormGroup, EntityTable } from '../../../../Framework/Signum.React/Scripts/Lines'
import * as Finder from '../../../../Framework/Signum.React/Scripts/Finder';
import { PredictorEntity } from '../../../../Extensions/Signum.React.Extensions/MachineLearning/Signum.Entities.MachineLearning';
import SalesEstimation from './SalesEstimation';

export default class Product extends React.Component<{ ctx: TypeContext<ProductEntity> }> {

    render() {
        const ctx = this.props.ctx;
        return (
            <div>
                <ValueLine ctx={ctx.subCtx(p => p.productName)} />
                <EntityCombo ctx={ctx.subCtx(p => p.supplier)} />
                <EntityLine ctx={ctx.subCtx(p => p.category)} />
                <ValueLine ctx={ctx.subCtx(p => p.quantityPerUnit)} />
                <ValueLine ctx={ctx.subCtx(p => p.unitPrice)} />
                <ValueLine ctx={ctx.subCtx(p => p.unitsInStock)} />
                <SalesEstimation ctx={ctx} />
                <ValueLine ctx={ctx.subCtx(p => p.reorderLevel)} />
                <ValueLine ctx={ctx.subCtx(p => p.discontinued)} />
                <EntityTable ctx={ctx.subCtx(p => p.additionalInformation)} />
            </div>
        );
    }
}

