import * as React from 'react'
import { CategoryEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Category extends React.Component<{ ctx: TypeContext<CategoryEntity> }, void> {

    render() {
        const ctx = this.props.ctx;
        return (
            <div>
                <ValueLine ctx={ctx.subCtx(c => c.categoryName)} />
                <ValueLine ctx={ctx.subCtx(c => c.description)} />
                <EntityDetail ctx={ctx.subCtx(c => c.picture)} />
            </div>
        );
    }
}
