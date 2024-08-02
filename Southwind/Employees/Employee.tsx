import * as React from 'react'
import { AutoLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, FormGroup, EntityCheckboxList, TextAreaLine } from '@framework/Lines'
import { FileLine } from '@extensions/Signum.Files/Files'
import { useForceUpdate } from '@framework/Hooks'
import { Navigator } from '@framework/Navigator'
import { EmployeeEntity } from './Southwind.Employees'

export default function Employee(p : { ctx: TypeContext<EmployeeEntity> }): React.JSX.Element {
  const forceUpdate = useForceUpdate();
  const ctx = p.ctx;
  const photo = Navigator.useFetchInState(ctx.value.photo || null);
  const ctxBasic = ctx.subCtx({ formGroupStyle: "SrOnly" });
  return (
    <div className="row">
      <div className="col-sm-9">
        <fieldset>
          <legend>Personal Info</legend>
          <div className="row">
            <div className="col-sm-2">
              <AutoLine ctx={ctxBasic.subCtx(p => p.title)} placeholderLabels={true} />
            </div>
            <div className="col-sm-5">
              <AutoLine ctx={ctxBasic.subCtx(p => p.firstName)} placeholderLabels={true} />
            </div>
            <div className="col-sm-5">
              <AutoLine ctx={ctxBasic.subCtx(p => p.lastName)} placeholderLabels={true} />
            </div>
          </div>

          <AutoLine ctx={ctx.subCtx(p => p.birthDate)} />
          <AutoLine ctx={ctx.subCtx(p => p.homePhone)} />
        </fieldset>

        <EntityDetail ctx={ctx.subCtx(p => p.address)} />


        <fieldset>
          <legend>Company data</legend>
          <AutoLine ctx={ctx.subCtx(e => e.titleOfCourtesy)} />
          <EntityLine ctx={ctx.subCtx(e => e.reportsTo)} />
          <AutoLine ctx={ctx.subCtx(e => e.hireDate)} />
          <AutoLine ctx={ctx.subCtx(e => e.extension)} />
          <EntityStrip ctx={ctx.subCtx(e => e.territories)} />
        </fieldset>
      </div>

      <div className="col-sm-3">
        {/*photo*/}
        <FileLine ctx={ctx.subCtx(e => e.photo)} onChange={() => forceUpdate()} />

        {photo && <img className="img-responsive" src={"data:image/jpeg;base64," + photo.binaryFile} />}
        {/*photo*/}
        <div>
          <TextAreaLine ctx={ctx.subCtx(e => e.notes, { formGroupStyle: "Basic" })} valueHtmlAttributes={{ rows: 10, className: "notes" }} />
        </div>
      </div>
    </div>
  );
}
