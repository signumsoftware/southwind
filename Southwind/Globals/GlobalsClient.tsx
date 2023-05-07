import * as React from 'react'
import { RouteObject } from 'react-router'
import { EntitySettings } from '@framework/Navigator'
import * as Navigator from '@framework/Navigator'

import { UserEntity } from '@extensions/Authorization/Signum.Entities.Authorization'

import { EntityLine } from '@framework/Lines'
import { ApplicationConfigurationEntity, UserEmployeeMixin } from './Southwind.Entities.Globals'

export function start(options: { routes: RouteObject[] }) {

  Navigator.addSettings(new EntitySettings(ApplicationConfigurationEntity, a => import('./ApplicationConfiguration')));

  Navigator.getSettings(UserEntity)!.overrideView((rep) => {
    rep.insertAfterLine(u => u.role, ctx => [
      <EntityLine ctx={ctx.subCtx(UserEmployeeMixin).subCtx(uem => uem.employee)} />
    ])
  });

}
