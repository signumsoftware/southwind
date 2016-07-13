import * as React from 'react'
import { RegionEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Region extends React.Component<{ ctx: TypeContext<RegionEntity> }, void> {

    render() {
        const ctx = this.props.ctx;
        return (
            <div>
                <ValueLine ctx={ctx.subCtx(r => r.description)} />
            </div>
        );
    }
}
