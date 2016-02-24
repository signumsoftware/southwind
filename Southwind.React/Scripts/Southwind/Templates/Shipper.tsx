import * as React from 'react'
import { ShipperEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Shipper extends EntityComponent<ShipperEntity> {

    renderEntity() {
        return (
            <div>
                <ValueLine ctx={this.subCtx(s => s.companyName)} />
                <ValueLine ctx={this.subCtx(s => s.phone)} />
            </div>
        );
    }
}
