import * as React from 'react'
import { ApplicationConfigurationEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class ApplicationConfiguration extends EntityComponent<ApplicationConfigurationEntity> {

    renderEntity() {
        return (
            <div>
                <ValueLine ctx={this.subCtx(a => a.environment)} />
                <EntityDetail ctx={this.subCtx(a => a.email)} />
                <EntityLine ctx={this.subCtx(a => a.smtpConfiguration)} />
                <EntityDetail ctx={this.subCtx(a => a.sms)} />
            </div>
        );
    }
}
