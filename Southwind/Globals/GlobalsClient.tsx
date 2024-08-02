import * as React from 'react'
import { RouteObject } from 'react-router'
import { Navigator, EntitySettings } from '@framework/Navigator'

import { UserEntity } from '@extensions/Signum.Authorization/Signum.Authorization'

import { EntityLine } from '@framework/Lines'
import { ApplicationConfigurationEntity, UserEmployeeMixin } from './Southwind.Globals'

export namespace GlobalsClient {
  
  export function start(options: { routes: RouteObject[] }): void {
  
    Navigator.addSettings(new EntitySettings(ApplicationConfigurationEntity, a => import('./ApplicationConfiguration')));
  
    Navigator.getSettings(UserEntity)!.overrideView((rep) => {
      rep.insertAfterLine(u => u.role, ctx => [
        <EntityLine ctx={ctx.subCtx(UserEmployeeMixin).subCtx(uem => uem.employee)} />
      ])
    });
  
  }
}
