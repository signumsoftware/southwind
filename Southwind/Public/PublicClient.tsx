import * as React from 'react'
import { RouteObject } from 'react-router'
import { Route } from 'react-router'
import { ajaxPost, ajaxGet } from '@framework/Services';
import { EntitySettings, ViewPromise } from '@framework/Navigator'
import * as Navigator from '@framework/Navigator'
import { EntityOperationSettings } from '@framework/Operations'
import * as Operations from '@framework/Operations'
import { RegisterUserModel } from './Southwind.Entities.Public'
import { ImportComponent } from '@framework/ImportComponent'
import { QueryString } from '../../../Framework/Signum.React/Scripts/QueryString';

export function start(options: { routes: RouteObject[] }) {

  options.routes.push({ path: "/registerUser/:reportsToEmployeeId?", element: <ImportComponent onImport={() => import("./Templates/RegisterUser")} /> });
}

export namespace API {
  export function getRegisterUser(reportsToEmployeeId: string): Promise<RegisterUserModel> {
    return ajaxPost({ url: `/api/getRegisterUser` + QueryString.stringify({ reportsToEmployeeId })}, null);
  }

  export function registerUser(model: RegisterUserModel): Promise<boolean> {
    return ajaxPost({ url: "/api/registerUser" }, model);
  }
}
