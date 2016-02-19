import * as React from 'react'
import { CategoryEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Category extends EntityComponent<CategoryEntity> {

    renderEntity() {
        return (
            <div>
                <ValueLine ctx={this.subCtx(c => c.categoryName)} />
                <ValueLine ctx={this.subCtx(c => c.description)} />
                <EntityDetail ctx={this.subCtx(c => c.picture)} />
            </div>
        );
    }
}
