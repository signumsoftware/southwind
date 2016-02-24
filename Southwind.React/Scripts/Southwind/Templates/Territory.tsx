import * as React from 'react'
import { TerritoryEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Territory extends EntityComponent<TerritoryEntity> {

    renderEntity() {
        return (
            <div>
                <EntityLine ctx={this.subCtx(t => t.region)} />
                <ValueLine ctx={this.subCtx(t => t.description)} />
            </div>
        );
    }
}
