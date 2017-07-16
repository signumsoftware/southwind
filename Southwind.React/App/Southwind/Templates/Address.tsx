import * as React from 'react'
import { AddressEmbedded } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class Address extends React.Component<{ ctx: TypeContext<AddressEmbedded> }> {

    render() {
        const ctx = this.props.ctx.subCtx({ formGroupStyle: "SrOnly", placeholderLabels: true});
        return (
            <div className="form-vertical">
                    <ValueLine ctx={ctx.subCtx(a => a.address)} />
                <div className="row">
                    <div className="col-sm-6"><ValueLine ctx={ctx.subCtx(a => a.city)} /></div>
                    <div className="col-sm-6"><ValueLine ctx={ctx.subCtx(a => a.region)} /></div>
                </div>
                <div className="row">
                    <div className="col-sm-6"><ValueLine ctx={ctx.subCtx(a => a.postalCode)} /></div>
                    <div className="col-sm-6"><ValueLine ctx={ctx.subCtx(a => a.country)} /></div>
                </div>
            </div>
        );
    }
}
