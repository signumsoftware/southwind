import * as React from 'react'
import { AddressEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Address extends EntityComponent<AddressEntity> {

    renderEntity() {
        return (
            <div>
                <ValueLine ctx={this.subCtx(a => a.address)} />
                <ValueLine ctx={this.subCtx(a => a.city)} />
                <ValueLine ctx={this.subCtx(a => a.region)} />
                <ValueLine ctx={this.subCtx(a => a.postalCode)} />
                <ValueLine ctx={this.subCtx(a => a.country)} />
            </div>
        );
    }
}
