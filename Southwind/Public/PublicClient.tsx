import * as React from 'react'
import { RouteObject } from 'react-router'
import { Route } from 'react-router'
import { ajaxPost, ajaxGet } from '@framework/Services';
import { Navigator, EntitySettings, ViewPromise } from '@framework/Navigator'
import { Operations, EntityOperationSettings } from '@framework/Operations'
import { RegisterUserModel } from './Southwind.Public'
import { ImportComponent } from '@framework/ImportComponent'
import { QueryString } from '@framework/QueryString';

export namespace PublicClient {

  export function startPublic(options: { routes: RouteObject[] }): void {
  
    options.routes.push({ path: "/registerUser/:reportsToEmployeeId?", element: <ImportComponent onImport={() => import("./RegisterUser")} /> });
  }
  
  export namespace API {
    export function getRegisterUser(reportsToEmployeeId: string): Promise<RegisterUserModel> {
      return ajaxPost({ url: `/api/getRegisterUser` + QueryString.stringify({ reportsToEmployeeId })}, null);
    }
  
    export function registerUser(model: RegisterUserModel): Promise<boolean> {
      return ajaxPost({ url: "/api/registerUser" }, model);
    }
  }
}
