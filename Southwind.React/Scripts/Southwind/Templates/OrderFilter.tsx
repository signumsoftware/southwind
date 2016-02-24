import * as React from 'react'
import { OrderFilterModel } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class OrderFilter extends EntityComponent<OrderFilterModel> {

    renderEntity() {
        return (
            <div>
                <EntityLine ctx={this.subCtx(o => o.customer)} />
                <EntityLine ctx={this.subCtx(o => o.employee)} />
                <ValueLine ctx={this.subCtx(o => o.minOrderDate)} />
                <ValueLine ctx={this.subCtx(o => o.maxOrderDate)} />
            </div>
        );
    }
}
