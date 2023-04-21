import * as React from 'react'
import { RouteObject } from 'react-router'
import * as Navigator from '@framework/Navigator'
import * as Finder from '@framework/Finder'
import * as AppContext from '@framework/AppContext'
import { EntitySettings } from '@framework/Navigator';
import { EmployeeEntity, EmployeeLiteModel } from './Southwind.Employees';
import { FileImage } from '@extensions/Signum.Files/Components/FileImage';
import { TypeaheadOptions } from '@framework/Components/Typeahead';
import * as QuickLinks from '@framework/QuickLinks';
import { FetchInState } from '@framework/Lines';
import { FileEntity } from '@extensions/Signum.Files/Signum.Files'
import { Lite } from '@framework/Signum.Entities'
import { RegisterUserModel } from '../Public/Southwind.Public'

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
