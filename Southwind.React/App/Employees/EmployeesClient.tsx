import * as React from 'react'
import { RouteObject } from 'react-router'
import { EntitySettings } from '@framework/Navigator'
import * as Navigator from '@framework/Navigator'
import * as Finder from '@framework/Finder'
import { FetchInState } from '@framework/Lines/Retrieve'

import { Lite } from '@framework/Signum.Entities'
import { FileEntity } from '@extensions/Files/Signum.Entities.Files'


import * as QuickLinks from '@framework/QuickLinks';
import * as AppContext from '@framework/AppContext';
import { RegisterUserModel } from '../Public/Southwind.Entities.Public';

import { FileImage } from '../../../Framework/Signum.React.Extensions/Files/FileImage';
import { EmployeeEntity, EmployeeLiteModel } from './Southwind.Entities.Employees'


export function start(options: { routes: RouteObject[] }) {

  Navigator.addSettings(new EntitySettings(EmployeeEntity, e => import('./Employee'), {
    renderLite: (lite, hl) => {
      if (EmployeeLiteModel.isInstance(lite.model))
        return (
          <span>
            <FileImage
              style={{ width: "20px", height: "20px", borderRadius: "100%", marginRight: "4px", marginTop: "-3px" }}
              file={lite.model.photo} />
            {hl.highlight(lite.model.firstName + " " + lite.model.lastName)}
          </span>
        );


      if (typeof lite.model == "string")
        return hl.highlight(lite.model);

      return lite.EntityType;
    }
  }));

  QuickLinks.registerQuickLink(EmployeeEntity, ctx =>
    new QuickLinks.QuickLinkLink(RegisterUserModel.typeName, () => EmployeeEntity.niceName(), AppContext.toAbsoluteUrl("/registerUser/" + ctx.lite.id), {
      icon: "user-plus",
      iconColor: "#93c54b"
    }));//QuickLink

  {/*Files*/ }
  const maxDimensions: React.CSSProperties = { maxWidth: "96px", maxHeight: "96px" };
  Finder.registerPropertyFormatter(EmployeeEntity.tryPropertyRoute(ca => ca.photo),
    new Finder.CellFormatter((cell: Lite<FileEntity>) => <FetchInState lite={cell}>{file => file && <img style={maxDimensions} src={"data:image/jpeg;base64," + (file as FileEntity).binaryFile} />}</FetchInState>, false));
  {/*Files*/ }

}
