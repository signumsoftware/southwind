import * as React from 'react'
import { TerritoryEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Territory extends React.Component<{ ctx: TypeContext<TerritoryEntity> }, void> {

    render() {
        const ctx = this.props.ctx;
        return (
            <div>
                <EntityLine ctx={ctx.subCtx(t => t.region)} />
                <ValueLine ctx={ctx.subCtx(t => t.description)} />
            </div>
        );
    }
}
