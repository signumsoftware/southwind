import * as React from 'react'
import { RegionEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Region extends EntityComponent<RegionEntity> {

    renderEntity() {
        return (
            <div>
                <ValueLine ctx={this.subCtx(r => r.description)} />
            </div>
        );
    }
}
