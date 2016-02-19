import * as React from 'react'
import { ProductEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Product extends EntityComponent<ProductEntity> {

    renderEntity() {
        return (
            <div>
                <ValueLine ctx={this.subCtx(p => p.productName)} />
                <EntityLine ctx={this.subCtx(p => p.supplier)} />
                <EntityLine ctx={this.subCtx(p => p.category)} />
                <ValueLine ctx={this.subCtx(p => p.quantityPerUnit)} />
                <ValueLine ctx={this.subCtx(p => p.unitPrice)} />
                <ValueLine ctx={this.subCtx(p => p.unitsInStock)} />
                <ValueLine ctx={this.subCtx(p => p.reorderLevel)} />
                <ValueLine ctx={this.subCtx(p => p.discontinued)} />
            </div>
        );
    }
}
