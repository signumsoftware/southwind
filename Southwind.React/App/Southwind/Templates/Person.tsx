import * as React from 'react'
import { PersonEntity, OrderEntity, OrderOperation } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '@framework/Lines'
import SearchControl from '@framework/SearchControl/SearchControl';
import * as Reflection from '@framework/Reflection';

export default class Person extends React.Component<{ ctx: TypeContext<PersonEntity> }> {

    render() {
        const ctx = this.props.ctx;
        const ctxBasic = ctx.subCtx({ formGroupStyle: "Basic" });
        return (
            <div>
                {ctx.value.corrupt && <ValueLine ctx={ctx.subCtx(p => p.corrupt)} inlineCheckbox={true} />}
                <div className="row">
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
                <ValueLine ctx={ctx.subCtx(p => p.dateOfBirth)} />

                <h2>{OrderEntity.nicePluralName()}</h2>
                <SearchControl findOptions={{
                    queryName: OrderEntity,
                    parentToken: "Customer",
                    parentValue: ctx.value
                }} showSimpleFilterBuilder={false} />
            </div>
        );
    }
}
