import * as React from 'react'
import { Dic } from '../../../../Framework/Signum.React/Scripts/Globals'
import { OrderEntity, CustomerEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Order extends EntityComponent<OrderEntity> {

    handleCustomerChange = (c: CustomerEntity) => {
        this.entity.shipAddress = c == null ? null : Dic.copy(c.address);
        this.forceUpdate();
    }

    renderEntity() {
        return (
            <div>
                <EntityLine ctx={this.subCtx(o => o.customer) } onChange={this.handleCustomerChange} />
                <EntityLine ctx={this.subCtx(o => o.employee)} />
                <ValueLine ctx={this.subCtx(o => o.orderDate)} />
                <ValueLine ctx={this.subCtx(o => o.requiredDate)} />
                <ValueLine ctx={this.subCtx(o => o.shippedDate)} />
                <ValueLine ctx={this.subCtx(o => o.cancelationDate)} />
                <EntityLine ctx={this.subCtx(o => o.shipVia)} />
                <ValueLine ctx={this.subCtx(o => o.shipName)} />
                <EntityDetail ctx={this.subCtx(o => o.shipAddress)} />
                <ValueLine ctx={this.subCtx(o => o.freight)} />
                <EntityRepeater ctx={this.subCtx(o => o.details)} />
                <ValueLine ctx={this.subCtx(o => o.isLegacy)} />
                <ValueLine ctx={this.subCtx(o => o.state)} />
            </div>
        );
    }
}
