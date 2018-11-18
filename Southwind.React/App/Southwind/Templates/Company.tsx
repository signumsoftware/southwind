import * as React from 'react'
import { CompanyEntity, OrderEntity } from '../Southwind.Entities'
import { ValueLine, TypeContext } from '@framework/Lines'
import { SearchControl } from '@framework/Search';

export default class Company extends React.Component<{ ctx: TypeContext<CompanyEntity> }> {

  render() {
    const ctx = this.props.ctx;
    return (
      <div>
        <ValueLine ctx={ctx.subCtx(c => c.companyName)} />
        <ValueLine ctx={ctx.subCtx(c => c.contactName)} />
        <ValueLine ctx={ctx.subCtx(c => c.contactTitle)} />
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
