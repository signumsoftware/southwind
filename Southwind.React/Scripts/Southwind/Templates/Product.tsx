import * as React from 'react'
import { ProductEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Product extends EntityComponent<ProductEntity> {

    renderEntity() {
        var ctx = this.props.ctx;
        return (
            <div>
                <ValueLine ctx={ctx.subCtx(p => p.productName)} />
                <EntityLine ctx={ctx.subCtx(p => p.supplier)} />
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
