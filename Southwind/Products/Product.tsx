import * as React from 'react'
import { AutoLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, FormGroup, EntityTable } from '@framework/Lines'
import * as Finder from '@framework/Finder';
import { PredictorEntity } from '@extensions/Signum.MachineLearning/Signum.MachineLearning';
import SalesEstimation from './SalesEstimation';
import { ProductEntity } from './Southwind.Products';

export default function Product(p : { ctx: TypeContext<ProductEntity> }){
  const ctx = p.ctx;
  return (
    <div>
      <AutoLine ctx={ctx.subCtx(p => p.productName)} />
      <EntityCombo ctx={ctx.subCtx(p => p.supplier)} />
      <EntityLine ctx={ctx.subCtx(p => p.category)} />
      <AutoLine ctx={ctx.subCtx(p => p.quantityPerUnit)} />
      <AutoLine ctx={ctx.subCtx(p => p.unitPrice)} />
      <AutoLine ctx={ctx.subCtx(p => p.unitsInStock)} />
      {!ctx.value.isNew && <SalesEstimation ctx={ctx} />}
      <AutoLine ctx={ctx.subCtx(p => p.reorderLevel)} />
      <AutoLine ctx={ctx.subCtx(p => p.discontinued)} />
      <EntityTable ctx={ctx.subCtx(p => p.additionalInformation)} />
    </div>
  );
}

