import * as React from 'react'
import { EmployeeEntity } from '../Southwind.Entities'
import Person from './Person'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, FormGroup, EntityCheckboxList } from '@framework/Lines'
import * as Navigator from '@framework/Navigator'
import FileLine from '@extensions/Files/FileLine'
import * as FilesClient from '@extensions/Files/FilesClient'
import { FileEntity } from '@extensions/Files/Signum.Entities.Files'
import { is } from '@framework/Signum.Entities';
import { Lite } from '@framework/Signum.Entities';

export default class Employee extends React.Component<{ ctx: TypeContext<EmployeeEntity> }>
{
  render() {
    const ctx = this.props.ctx;
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
          <FileLine ctx={ctx.subCtx(e => e.photo)} onChange={() => this.forceUpdate()} />

          <EmployeePhoto lite={ctx.value.photo} />
          {/*photo*/}
          <div>
            <ValueLine ctx={ctx.subCtx(e => e.notes, { formGroupStyle: "Basic" })} valueHtmlAttributes={{ rows: 10, className: "notes" }} />
          </div>
        </div>
      </div>
    );
  }
}



interface EmployeePhotoProps {
  lite: Lite<FileEntity> | null | undefined;
}

interface EmployeePhotoState {
  file?: FileEntity;
}

export class EmployeePhoto extends React.Component<EmployeePhotoProps, EmployeePhotoState> {

  constructor(props: EmployeePhotoProps) {
    super(props);
    this.state = { file: undefined };
  }

  componentWillMount() {
    this.loadPhoto(this.props);
  }

  componentWillReceiveProps(p: EmployeePhotoProps) {
    if (!is(p.lite, this.state.file))
      this.loadPhoto(p);
  }

  loadPhoto(props: EmployeePhotoProps) {
    var lite = props.lite;

    if (!lite)
      this.setState({ file: undefined });
    else if (lite.entity)
      this.setState({ file: lite.entity });
    else
      this.setState({ file: undefined }, () => {
        Navigator.API.fetchAndForget(lite!)
          .then(file => this.setState({ file }))
          .done();
      });
  }

  render() {

    if (!this.state.file)
      return null;

    return (<img className="img-responsive" src={"data:image/jpeg;base64," + this.state.file.binaryFile} />);
  }
}
