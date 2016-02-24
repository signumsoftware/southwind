import * as React from 'react'
import { EmployeeEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Employee extends EntityComponent<EmployeeEntity> {

    renderEntity() {
        return (
            <div>
                <ValueLine ctx={this.subCtx(e => e.lastName)} />
                <ValueLine ctx={this.subCtx(e => e.firstName)} />
                <ValueLine ctx={this.subCtx(e => e.title)} />
                <ValueLine ctx={this.subCtx(e => e.titleOfCourtesy)} />
                <ValueLine ctx={this.subCtx(e => e.birthDate)} />
                <ValueLine ctx={this.subCtx(e => e.hireDate)} />
                <EntityDetail ctx={this.subCtx(e => e.address)} />
                <ValueLine ctx={this.subCtx(e => e.homePhone)} />
                <ValueLine ctx={this.subCtx(e => e.extension)} />
                {/*<EntityDetail ctx={this.subCtx(e => e.photo)} />*/}
                <ValueLine ctx={this.subCtx(e => e.notes)} />
                <EntityLine ctx={this.subCtx(e => e.reportsTo)} />
                <ValueLine ctx={this.subCtx(e => e.photoPath)} />
                <EntityStrip ctx={this.subCtx(e => e.territories)} />
            </div>
        );
    }
}
