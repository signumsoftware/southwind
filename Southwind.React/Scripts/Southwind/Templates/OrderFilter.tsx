import * as React from 'react'
import { OrderFilterModel } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class OrderFilter extends React.Component<{ ctx: TypeContext<OrderFilterModel> }, void> {

    render() {
        var ctx = this.props.ctx;
        return (
            <div>
                <EntityLine ctx={ctx.subCtx(o => o.customer)} />
                <EntityLine ctx={ctx.subCtx(o => o.employee)} />
                <ValueLine ctx={ctx.subCtx(o => o.minOrderDate)} />
                <ValueLine ctx={ctx.subCtx(o => o.maxOrderDate)} />
            </div>
        );
    }
}
