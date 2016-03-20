import * as React from 'react'
import { OrderDetailsEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class OrderDetails extends EntityComponent<OrderDetailsEntity> {

    renderEntity() {
        var ctx = this.props.ctx;
        return (
            <div>
                <EntityLine ctx={ctx.subCtx(o => o.product)} />
                <ValueLine ctx={ctx.subCtx(o => o.unitPrice)} />
                <ValueLine ctx={ctx.subCtx(o => o.quantity)} />
                <ValueLine ctx={ctx.subCtx(o => o.discount)} />
            </div>
        );
    }
}
