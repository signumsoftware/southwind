
import * as React from 'react'
import { getMixin } from '../../Framework/Signum.React/Scripts/Signum.Entities'
import { UserEntity_Type } from '../../Extensions/Signum.React.Extensions/Authorization/Signum.Entities.Authorization'
import { UserEmployeeMixin_Type } from './Southwind.Entities'
import { addSettings, getSettings, EntitySettings } from '../../Framework/Signum.React/Scripts/Navigator'
import { ValueLine, EntityLine } from '../../Framework/Signum.React/Scripts/Lines'

export function start(options: { routes: JSX.Element[] }) {

    getSettings(UserEntity_Type).overrideView((rep) => {
        rep.insertAfter(u => u.role,
            <ValueLine ctx={rep.ctx.subCtx(u => getMixin(u, UserEmployeeMixin_Type).allowLogin)}/>,
            <EntityLine ctx={rep.ctx.subCtx(u => getMixin(u, UserEmployeeMixin_Type).employee)}/>)
    });
}
