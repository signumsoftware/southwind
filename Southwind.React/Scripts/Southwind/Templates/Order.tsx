import * as React from 'react'
import { Dic } from '../../../../Framework/Signum.React/Scripts/Globals'
import { OrderEntity, CustomerEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Order extends React.Component<{ ctx: TypeContext<OrderEntity> }, void> {

    handleCustomerChange = (c: CustomerEntity) => {
        this.props.ctx.value.shipAddress = c == null ? null : Dic.copy(c.address);
        this.forceUpdate();
    }

    render() {
        var ctx = this.props.ctx;
        return (
            <div>
                <EntityLine ctx={ctx.subCtx(o => o.customer) } onChange={this.handleCustomerChange} />
                <EntityLine ctx={ctx.subCtx(o => o.employee)} />
                <ValueLine ctx={ctx.subCtx(o => o.orderDate)} />
                <ValueLine ctx={ctx.subCtx(o => o.requiredDate)} />
                <ValueLine ctx={ctx.subCtx(o => o.shippedDate)} />
                <ValueLine ctx={ctx.subCtx(o => o.cancelationDate)} />
                <EntityLine ctx={ctx.subCtx(o => o.shipVia)} />
                <ValueLine ctx={ctx.subCtx(o => o.shipName)} />
                <EntityDetail ctx={ctx.subCtx(o => o.shipAddress)} />
                <ValueLine ctx={ctx.subCtx(o => o.freight)} />
                <EntityRepeater ctx={ctx.subCtx(o => o.details)} />
                <ValueLine ctx={ctx.subCtx(o => o.isLegacy)} />
                <ValueLine ctx={ctx.subCtx(o => o.state)} />
            </div>
        );
    }
}
