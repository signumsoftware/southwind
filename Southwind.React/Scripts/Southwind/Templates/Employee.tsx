import * as React from 'react'
import { EmployeeEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Employee extends React.Component<{ ctx: TypeContext<EmployeeEntity> }, void> {

    render() {
        const ctx = this.props.ctx;
        return (
            <div>
                <ValueLine ctx={ctx.subCtx(e => e.lastName)} />
                <ValueLine ctx={ctx.subCtx(e => e.firstName)} />
                <ValueLine ctx={ctx.subCtx(e => e.title)} />
                <ValueLine ctx={ctx.subCtx(e => e.titleOfCourtesy)} />
                <ValueLine ctx={ctx.subCtx(e => e.birthDate)} />
                <ValueLine ctx={ctx.subCtx(e => e.hireDate)} />
                <EntityDetail ctx={ctx.subCtx(e => e.address)} />
                <ValueLine ctx={ctx.subCtx(e => e.homePhone)} />
                <ValueLine ctx={ctx.subCtx(e => e.extension)} />
                {/*<EntityDetail ctx={ctx.subCtx(e => e.photo)} />*/}
                <ValueLine ctx={ctx.subCtx(e => e.notes)} />
                <EntityLine ctx={ctx.subCtx(e => e.reportsTo)} />
                <ValueLine ctx={ctx.subCtx(e => e.photoPath)} />
                <EntityStrip ctx={ctx.subCtx(e => e.territories)} />
            </div>
        );
    }
}
