import * as React from 'react'
import { OrderDetailsEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class OrderDetails extends EntityComponent<OrderDetailsEntity> {

    renderEntity() {
        return (
            <div>
                <EntityLine ctx={this.subCtx(o => o.product)} />
                <ValueLine ctx={this.subCtx(o => o.unitPrice)} />
                <ValueLine ctx={this.subCtx(o => o.quantity)} />
                <ValueLine ctx={this.subCtx(o => o.discount)} />
            </div>
        );
    }
}
