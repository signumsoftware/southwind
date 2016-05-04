import * as React from 'react'
import { ApplicationConfigurationEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class ApplicationConfiguration extends React.Component<{ ctx: TypeContext<ApplicationConfigurationEntity> }, void> {

    render() {
        var ctx = this.props.ctx;
        return (
            <div>
                <ValueLine ctx={ctx.subCtx(a => a.environment)} />
                <EntityDetail ctx={ctx.subCtx(a => a.email)} />
                <EntityLine ctx={ctx.subCtx(a => a.smtpConfiguration)} />
                <EntityDetail ctx={ctx.subCtx(a => a.sms)} />
            </div>
        );
    }
}
