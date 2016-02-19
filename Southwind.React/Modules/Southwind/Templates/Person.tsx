import * as React from 'react'
import { PersonEntity } from '../Southwind.Entities'
import { EntityComponent, ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Person extends EntityComponent<PersonEntity> {

    renderEntity() {
        return (
            <div>
                <ValueLine ctx={this.subCtx(p => p.firstName)} />
                <ValueLine ctx={this.subCtx(p => p.lastName)} />
                <ValueLine ctx={this.subCtx(p => p.title)} />
                <ValueLine ctx={this.subCtx(p => p.dateOfBirth)} />
                <ValueLine ctx={this.subCtx(p => p.corrupt)} />
            </div>
        );
    }
}
