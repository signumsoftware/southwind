import * as React from 'react'
import { AutoLine } from '@framework/Lines/AutoLine'
import { TypeContext } from '@framework/TypeContext'
import { useForceUpdate } from '@framework/Hooks';
import { AddressEmbedded } from './Southwind.Customers';

export default function Address(p: { ctx: TypeContext<AddressEmbedded>, inheritStyle?: boolean }) {
  const ctx = p.inheritStyle ? p.ctx : p.ctx.subCtx({ formGroupStyle: "SrOnly", placeholderLabels: true });
  const forceUpdate = useForceUpdate();
  return (
    <div>
      <AutoLine ctx={ctx.subCtx(a => a.address)} />
      <div className="row">
        <div className="col-sm-6"><AutoLine ctx={ctx.subCtx(a => a.city)} /></div>
        <div className="col-sm-6"><AutoLine ctx={ctx.subCtx(a => a.region)} /></div>
      </div>
      <div className="row">
        <div className="col-sm-6"><AutoLine ctx={ctx.subCtx(a => a.postalCode)} mandatory={ctx.value.country != "Ireland"} /></div>
        <div className="col-sm-6"><AutoLine ctx={ctx.subCtx(a => a.country)} onChange={forceUpdate} /></div>
      </div>
    </div>
  );
}
