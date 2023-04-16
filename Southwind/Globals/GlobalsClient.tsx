import * as React from 'react'
import { RouteObject } from 'react-router'
import * as Navigator from '@framework/Navigator'
import { AddressEmbedded, ApplicationConfigurationEntity, UserEmployeeMixin } from './Southwind.Globals';
import { EntitySettings } from '@framework/Navigator';
import { UserEntity } from '@extensions/Signum.Authorization/Signum.Authorization';
import { EntityLine } from '@framework/Lines';



export function start(options: { routes: RouteObject[] }) {

  Navigator.addSettings(new EntitySettings(ApplicationConfigurationEntity, a => import('./ApplicationConfiguration')));
  Navigator.addSettings(new EntitySettings(AddressEmbedded, a => import('./Address')));

  Navigator.getSettings(UserEntity)!.overrideView((rep) => {
    rep.insertAfterLine(u => u.role, ctx => [
      <EntityLine ctx={ctx.subCtx(UserEmployeeMixin).subCtx(uem => uem.employee)} />
    ])
  });

}
