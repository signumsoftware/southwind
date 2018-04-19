import * as React from 'react'
import { ApplicationConfigurationEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, RenderEntity } from '../../../../Framework/Signum.React/Scripts/Lines'
import { UncontrolledTabs, Tab } from '../../../../Framework/Signum.React/Scripts/Components/Tabs';

export default class ApplicationConfiguration extends React.Component<{ ctx: TypeContext<ApplicationConfigurationEntity> }> {

    render() {
        const ctx = this.props.ctx;
        return (
            <div>
                <ValueLine ctx={ctx.subCtx(a => a.environment) } />
                <UncontrolledTabs>
                    <Tab eventKey="tab" title={ctx.niceName(a => a.email) }>
                        <RenderEntity ctx={ctx.subCtx(a => a.email) } />
                        <EntityLine ctx={ctx.subCtx(a => a.smtpConfiguration) } />
                    </Tab>
                    <Tab eventKey="sms" title={ctx.niceName(a => a.sms) }>
                        <RenderEntity ctx={ctx.subCtx(a => a.sms) } />
                    </Tab>
                    <Tab eventKey="auth" title={ctx.niceName(a => a.authTokens) }>
                        <RenderEntity ctx={ctx.subCtx(a => a.authTokens) } />
                    </Tab>
                </UncontrolledTabs>
            </div>
        );
    }
}
