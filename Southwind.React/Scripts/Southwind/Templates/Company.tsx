import * as React from 'react'
import { CompanyEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Company extends React.Component<{ ctx: TypeContext<CompanyEntity> }, void> {

    render() {
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
