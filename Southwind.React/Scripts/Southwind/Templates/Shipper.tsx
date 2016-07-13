import * as React from 'react'
import { ShipperEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Shipper extends React.Component<{ ctx: TypeContext<ShipperEntity> }, void> {

    render() {
        const ctx = this.props.ctx;
        return (
            <div>
                <ValueLine ctx={ctx.subCtx(s => s.companyName)} />
                <ValueLine ctx={ctx.subCtx(s => s.phone)} />
            </div>
        );
    }
}
