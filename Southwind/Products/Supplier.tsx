import * as React from 'react'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '@framework/Lines'
import { SupplierEntity } from './Southwind.Products';

export default function Supplier(p: { ctx: TypeContext<SupplierEntity> }) {
  const ctx = p.ctx;
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
