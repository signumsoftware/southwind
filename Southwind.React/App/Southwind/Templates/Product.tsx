import * as React from 'react'
import { ProductEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

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
                <ValueLine ctx={ctx.subCtx(p => p.reorderLevel)} />
                <ValueLine ctx={ctx.subCtx(p => p.discontinued)} />
            </div>
        );
    }
}
