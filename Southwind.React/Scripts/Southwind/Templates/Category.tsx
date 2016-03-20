import * as React from 'react'
import { CategoryEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Category extends EntityComponent<CategoryEntity> {

    renderEntity() {
        var ctx = this.props.ctx;
        return (
            <div>
                <ValueLine ctx={ctx.subCtx(c => c.categoryName)} />
                <ValueLine ctx={ctx.subCtx(c => c.description)} />
                <EntityDetail ctx={ctx.subCtx(c => c.picture)} />
            </div>
        );
    }
}
