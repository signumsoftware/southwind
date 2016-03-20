import * as React from 'react'
import { CompanyEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Company extends EntityComponent<CompanyEntity> {

    renderEntity() {
        var ctx = this.props.ctx;
        return (
            <div>
                <ValueLine ctx={ctx.subCtx(c => c.companyName)} />
                <ValueLine ctx={ctx.subCtx(c => c.contactName)} />
                <ValueLine ctx={ctx.subCtx(c => c.contactTitle)} />
            </div>
        );
    }
}
