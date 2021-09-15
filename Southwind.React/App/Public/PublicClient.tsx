import * as React from 'react'
import { Route } from 'react-router'
import { ajaxPost, ajaxGet } from '@framework/Services';
import { EntitySettings, ViewPromise } from '@framework/Navigator'
import * as Navigator from '@framework/Navigator'
import { EntityOperationSettings } from '@framework/Operations'
import * as Operations from '@framework/Operations'
import { RegisterUserModel } from './Southwind.Entities.Public'
import { ImportRoute } from '@framework/AsyncImport';
import { QueryString } from '../../../Framework/Signum.React/Scripts/QueryString';

export function start(options: { routes: JSX.Element[] }) {

  options.routes.push(<ImportRoute path="~/registerUser/:reportsToEmployeeId?" onImportModule={() => import("./Templates/RegisterUser")} />);
}

export namespace API {
  export function getRegisterUser(reportsToEmployeeId: string): Promise<RegisterUserModel> {
    return ajaxPost({ url: `~/api/getRegisterUser` + QueryString.stringify({ reportsToEmployeeId })}, null);
  }

  export function registerUser(model: RegisterUserModel): Promise<boolean> {
    return ajaxPost({ url: "~/api/registerUser" }, model);
  }
}
