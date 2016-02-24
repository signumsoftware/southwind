import * as React from 'react'
import { CompanyEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Company extends EntityComponent<CompanyEntity> {

    renderEntity() {
        return (
            <div>
                <ValueLine ctx={this.subCtx(c => c.companyName)} />
                <ValueLine ctx={this.subCtx(c => c.contactName)} />
                <ValueLine ctx={this.subCtx(c => c.contactTitle)} />
            </div>
        );
    }
}
