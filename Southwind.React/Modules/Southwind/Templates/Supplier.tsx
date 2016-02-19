import * as React from 'react'
import { SupplierEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Supplier extends EntityComponent<SupplierEntity> {

    renderEntity() {
        return (
            <div>
                <ValueLine ctx={this.subCtx(s => s.companyName)} />
                <ValueLine ctx={this.subCtx(s => s.contactName)} />
                <ValueLine ctx={this.subCtx(s => s.contactTitle)} />
                <EntityDetail ctx={this.subCtx(s => s.address)} />
                <ValueLine ctx={this.subCtx(s => s.phone)} />
                <ValueLine ctx={this.subCtx(s => s.fax)} />
                <ValueLine ctx={this.subCtx(s => s.homePage)} />
            </div>
        );
    }
}
