import * as React from 'react'
import { AutoLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '@framework/Lines'
import { SupplierEntity } from './Southwind.Products';

export default function Supplier(p : { ctx: TypeContext<SupplierEntity> }){
  const ctx = p.ctx;
  return (
    <div>
      <AutoLine ctx={ctx.subCtx(s => s.companyName)} />
      <AutoLine ctx={ctx.subCtx(s => s.contactName)} />
      <AutoLine ctx={ctx.subCtx(s => s.contactTitle)} />
      <EntityDetail ctx={ctx.subCtx(s => s.address)} />
      <AutoLine ctx={ctx.subCtx(s => s.phone)} />
      <AutoLine ctx={ctx.subCtx(s => s.fax)} />
      <AutoLine ctx={ctx.subCtx(s => s.homePage)} />
    </div>
  );
}
