import * as React from 'react'
import { PersonEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Person extends EntityComponent<PersonEntity> {

    renderEntity() {
        var ctx = this.props.ctx;
        return (
            <div>
                <ValueLine ctx={ctx.subCtx(p => p.firstName)} />
                <ValueLine ctx={ctx.subCtx(p => p.lastName)} />
                <ValueLine ctx={ctx.subCtx(p => p.title)} />
                <ValueLine ctx={ctx.subCtx(p => p.dateOfBirth)} />
                <ValueLine ctx={ctx.subCtx(p => p.corrupt)} />
            </div>
        );
    }
}
