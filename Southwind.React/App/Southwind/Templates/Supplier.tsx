import * as React from 'react'
import { SupplierEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '@framework/Lines'

export default class Supplier extends React.Component<{ ctx: TypeContext<SupplierEntity> }> {

  render() {
    const ctx = this.props.ctx;
    return (
      <div>
        <ValueLine ctx={ctx.subCtx(s => s.companyName)} />
        <ValueLine ctx={ctx.subCtx(s => s.contactName)} />
        <ValueLine ctx={ctx.subCtx(s => s.contactTitle)} />
        <EntityDetail ctx={ctx.subCtx(s => s.address)} />
        <ValueLine ctx={ctx.subCtx(s => s.phone)} />
        <ValueLine ctx={ctx.subCtx(s => s.fax)} />
        <ValueLine ctx={ctx.subCtx(s => s.homePage)} />
      </div>
    );
  }
}
