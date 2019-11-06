import * as React from 'react'
import { EmployeeEntity } from '../Southwind.Entities'
import Person from './Person'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, FormGroup, EntityCheckboxList } from '@framework/Lines'
import * as Navigator from '@framework/Navigator'
import { FileLine } from '@extensions/Files/FileLine'
import * as FilesClient from '@extensions/Files/FilesClient'
import { FileEntity } from '@extensions/Files/Signum.Entities.Files'
import { is } from '@framework/Signum.Entities';
import { Lite } from '@framework/Signum.Entities';
import { useForceUpdate, useFetchInState } from '@framework/Hooks'

export default function Employee(p : { ctx: TypeContext<EmployeeEntity> }){
  const forceUpdate = useForceUpdate();
  const ctx = p.ctx;
  const photo = useFetchInState(ctx.value.photo || null);
  const ctxBasic = ctx.subCtx({ formGroupStyle: "SrOnly" });
  return (
    <div className="row">
      <div className="col-sm-9">
        <fieldset>
          <legend>Personal Info</legend>
          <div className="row">
            <div className="col-sm-2">
              <ValueLine ctx={ctxBasic.subCtx(p => p.title)} placeholderLabels={true} />
            </div>
            <div className="col-sm-5">
              <ValueLine ctx={ctxBasic.subCtx(p => p.firstName)} placeholderLabels={true} />
            </div>
            <div className="col-sm-5">
              <ValueLine ctx={ctxBasic.subCtx(p => p.lastName)} placeholderLabels={true} />
            </div>
          </div>

          <ValueLine ctx={ctx.subCtx(p => p.birthDate)} />
          <ValueLine ctx={ctx.subCtx(p => p.homePhone)} />
        </fieldset>

        <EntityDetail ctx={ctx.subCtx(p => p.address)} />


        <fieldset>
          <legend>Company data</legend>
          <ValueLine ctx={ctx.subCtx(e => e.titleOfCourtesy)} />
          <EntityLine ctx={ctx.subCtx(e => e.reportsTo)} />
          <ValueLine ctx={ctx.subCtx(e => e.hireDate)} />
          <ValueLine ctx={ctx.subCtx(e => e.extension)} />
          <EntityStrip ctx={ctx.subCtx(e => e.territories)} />
        </fieldset>
      </div>

      <div className="col-sm-3">
        {/*photo*/}
        <FileLine ctx={ctx.subCtx(e => e.photo)} onChange={() => forceUpdate()} />

        {photo && <img className="img-responsive" src={"data:image/jpeg;base64," + photo.binaryFile} />}
        {/*photo*/}
        <div>
          <ValueLine ctx={ctx.subCtx(e => e.notes, { formGroupStyle: "Basic" })} valueHtmlAttributes={{ rows: 10, className: "notes" }} />
        </div>
      </div>
    </div>
  );
}
