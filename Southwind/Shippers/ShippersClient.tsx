import * as React from 'react'
import { RouteObject } from 'react-router'
import { Route } from 'react-router'
import { ajaxPost, ajaxGet } from '@framework/Services';
import { EntitySettings, ViewPromise } from '@framework/Navigator'
import * as Navigator from '@framework/Navigator'
import { EntityOperationSettings } from '@framework/Operations'
import * as Operations from '@framework/Operations'
import { ImportComponent } from '@framework/ImportComponent'
import { QueryString } from '@framework/QueryString';

export function start(options: { routes: RouteObject[] }) {

  /* If no view is detected DynamicComponent creates one automatically*/
  //Navigator.addSettings(new EntitySettings(ShipperEntity, r => import('./Templates/Shipper')));
}

