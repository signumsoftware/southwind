import * as React from 'react'
import { AutoLine, TypeContext } from '@framework/Lines'
import { SearchControl } from '@framework/Search';
import { CompanyEntity } from './Southwind.Customers';
import { OrderEntity } from '../Orders/Southwind.Orders';

export default function Company(p : { ctx: TypeContext<CompanyEntity> }){
  const ctx = p.ctx;
  return (
    <div>
      <AutoLine ctx={ctx.subCtx(c => c.companyName)} />
      <AutoLine ctx={ctx.subCtx(c => c.contactName)} />
      <AutoLine ctx={ctx.subCtx(c => c.contactTitle)} />
      <h2>{OrderEntity.nicePluralName()}</h2>
      <SearchControl findOptions={{
        queryName: OrderEntity,
        filterOptions: [{ token: "Customer", value: ctx.value}] 
      }} showSimpleFilterBuilder={false} />
    </div>
  );
}
