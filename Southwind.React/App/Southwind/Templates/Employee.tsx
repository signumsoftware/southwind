import * as React from 'react'
import { EmployeeEntity } from '../Southwind.Entities'
import Person from './Person'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, FormGroup } from '../../../../Framework/Signum.React/Scripts/Lines'
import * as Navigator from '../../../../Framework/Signum.React/Scripts/Navigator'
import FileLine from '../../../../Extensions/Signum.React.Extensions/Files/FileLine'
import * as FilesClient from '../../../../Extensions/Signum.React.Extensions/Files/FilesClient'
import { FileEntity } from '../../../../Extensions/Signum.React.Extensions/Files/Signum.Entities.Files'


export default class Employee extends React.Component<{ ctx: TypeContext<EmployeeEntity> }, { photo?: FileEntity }> {

    constructor(props: any) {
        super(props);
        this.state = { photo: undefined };
    }

    componentWillMount() {
        this.loadPhoto(this.props.ctx.value);
    }


    componentWillReceiveProps(p: { ctx: TypeContext<EmployeeEntity> }) {
        this.loadPhoto(p.ctx.value);
    }

    loadPhoto(e: EmployeeEntity) {

        var e = this.props.ctx.value;

        this.changeState(s => s.photo = e.photo && e.photo.entity || undefined);

        if (e.photo && !this.state.photo)
            Navigator.API.fetchAndForget(e.photo)
                .then(ph => this.changeState(s => s.photo = ph))
                .done();
    }

    render() {
        const ctx = this.props.ctx;
        const ctxBasic = ctx.subCtx({ formGroupStyle: "SrOnly" });
        return (
            <div className="row">
                <div className="col-sm-9">
                    <fieldset>
                        <legend>Personal Info</legend>
                        <div className="form-vertical row">
                            <div className="col-sm-2">
                                <ValueLine ctx={ctxBasic.subCtx(p => p.title)} />
                            </div>
                            <div className="col-sm-5">
                                <ValueLine ctx={ctxBasic.subCtx(p => p.firstName)} />
                            </div>
                            <div className="col-sm-5">
                                <ValueLine ctx={ctxBasic.subCtx(p => p.lastName)} />
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
                    <FileLine ctx={ctx.subCtx(e => e.photo)} onChange={() => this.loadPhoto(this.props.ctx.value)} />
                    {this.state.photo && <img className="img-responsive" src={"data:image/jpeg;base64," + this.state.photo.binaryFile} />}
                    {/*photo*/}
                    <div className="form-vertical">
                        <ValueLine ctx={ctx.subCtx(e => e.notes, { formGroupStyle: "Basic" })} valueHtmlProps={{ rows: 10, className: "notes" }} />
                    </div>
                </div>
            </div>
        );
    }
}
