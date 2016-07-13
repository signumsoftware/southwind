import * as React from 'react'
import { AddressEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Address extends React.Component<{ ctx: TypeContext<AddressEntity> }, void> {

    render() {
        const ctx = this.props.ctx;
        return (
            <div>
                <ValueLine ctx={ctx.subCtx(a => a.address)} />
                <ValueLine ctx={ctx.subCtx(a => a.city)} />
                <ValueLine ctx={ctx.subCtx(a => a.region)} />
                <ValueLine ctx={ctx.subCtx(a => a.postalCode)} />
                <ValueLine ctx={ctx.subCtx(a => a.country)} />
            </div>
        );
    }
}
