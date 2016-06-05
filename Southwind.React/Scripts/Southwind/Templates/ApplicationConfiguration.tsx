import * as React from 'react'
import { Tabs, Tab} from 'react-bootstrap'
import { ApplicationConfigurationEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, RenderEntity } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class ApplicationConfiguration extends React.Component<{ ctx: TypeContext<ApplicationConfigurationEntity> }, void> {

    render() {
        var ctx = this.props.ctx;
        return (
            <div>
                <ValueLine ctx={ctx.subCtx(a => a.environment) } />
                <Tabs>
                    <Tab eventKey="tab" title={ctx.niceName(a => a.email) }>
                        <RenderEntity ctx={ctx.subCtx(a => a.email) } />
                        <EntityLine ctx={ctx.subCtx(a => a.smtpConfiguration) } />
                    </Tab>
                    <Tab eventKey="sms" title={ctx.niceName(a => a.sms) }>
                        <EntityDetail ctx={ctx.subCtx(a => a.sms) } />
                    </Tab>
                </Tabs>
            </div>
        );
    }
}
