import * as React from 'react'
import * as numbro from 'numbro'
import * as moment from 'moment'
import { Dic } from '@framework/Globals'
import * as Navigator from '@framework/Navigator'
import { OrderEntity, CustomerEntity, OrderDetailEmbedded, OrderState, AddressEmbedded, OrderMessage } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, FormGroup, FormControlReadonly, EntityTable, ChangeEvent } from '@framework/Lines'
import { useForceUpdate } from '@framework/Hooks'

export default function Order(p : { ctx: TypeContext<OrderEntity> }){
  const forceUpdate = useForceUpdate();
  function handleCustomerChange(c: ChangeEvent) {
    var order = p.ctx.value;
    var customer = c.newValue as CustomerEntity; //order.customer will also work
    order.shipAddress = c.newValue == null ? null! : AddressEmbedded.New({ ...customer.address });
    order.modified = true;
    forceUpdate();
  }

  function handleProductChange(detail: OrderDetailEmbedded) {
    detail.quantity = 1;
    detail.unitPrice = 0;
    forceUpdate();

    if (detail.product)
      Navigator.API.fetchAndForget(detail.product)
        .then(p => detail.unitPrice = p.unitPrice)
        .then(() => forceUpdate())
        .done();
  }

  const ctx2 = p.ctx.subCtx({ labelColumns: { sm: 2 } });
  const ctx4 = p.ctx.subCtx({ labelColumns: { sm: 4 } });
  var o = ctx4.value;
  return (
    <div>
      <div className="row">
        <div className="col-sm-6">
          <EntityLine ctx={ctx2.subCtx(o => o.customer)} onChange={handleCustomerChange} />
          <EntityDetail ctx={ctx2.subCtx(o => o.shipAddress)} />
        </div>
        <div className="col-sm-6">
          <ValueLine ctx={ctx4.subCtx(o => o.shipName)} />
          {ctx2.value.isLegacy && < ValueLine ctx={ctx4.subCtx(o => o.isLegacy)} readOnly={true} />}
          <ValueLine ctx={ctx4.subCtx(o => o.state)} readOnly={true} valueHtmlAttributes={{ style: { color: stateColor(o.state) } }} />
          <ValueLine ctx={ctx4.subCtx(o => o.orderDate)} unitText={ago(o.orderDate)} readOnly={true} />
          <ValueLine ctx={ctx4.subCtx(o => o.requiredDate)} unitText={ago(o.requiredDate)} onChange={() => forceUpdate()} />
          <ValueLine ctx={ctx4.subCtx(o => o.shippedDate)} unitText={ago(o.shippedDate)} hideIfNull={true} readOnly={true} />
          <ValueLine ctx={ctx4.subCtx(o => o.cancelationDate)} unitText={ago(o.cancelationDate)} hideIfNull={true} readOnly={true} />
          <EntityCombo ctx={ctx4.subCtx(o => o.shipVia)} />
        </div>
      </div>
      <EntityTable ctx={ctx2.subCtx(o => o.details)} onChange={() => forceUpdate()} columns={EntityTable.typedColumns<OrderDetailEmbedded>([
        { property: a => a.product, headerHtmlAttributes: { style: { width: "40%" } }, template: dc => <EntityLine ctx={dc.subCtx(a => a.product)} onChange={() => handleProductChange(dc.value)} /> },
        { property: a => a.quantity, headerHtmlAttributes: { style: { width: "15%" } }, template: dc => <ValueLine ctx={dc.subCtx(a => a.quantity)} onChange={() => forceUpdate()} /> },
        { property: a => a.unitPrice, headerHtmlAttributes: { style: { width: "15%" } }, template: dc => <ValueLine ctx={dc.subCtx(a => a.unitPrice)} readOnly={true} /> },
        { property: a => a.discount, headerHtmlAttributes: { style: { width: "15%" } }, template: dc => <ValueLine ctx={dc.subCtx(a => a.discount)} onChange={() => forceUpdate()} /> },
        {
          header: OrderMessage.SubTotalPrice.niceToString(), headerHtmlAttributes: { style: { width: "15%" } },
          template: dc => <FormGroup ctx={dc}>
            <div className={dc.inputGroupClass}>
              <FormControlReadonly ctx={dc}>
                {numbro(subTotalPrice(dc.value)).format("0.00")}
              </FormControlReadonly>
              <div className="input-group-append">
                <span className="input-group-text">€</span>
              </div>
            </div>
          </FormGroup>
        },
      ])} />
      <div className="row">
        <div className="col-sm-4">
          <EntityLine ctx={ctx4.subCtx(o => o.employee)} />
        </div>
        <div className="col-sm-4">
          <ValueLine ctx={ctx4.subCtx(o => o.freight)} />
        </div>
        <div className="col-sm-4">
          <FormGroup ctx={ctx4} labelText="TotalPrice">
            <div className={ctx4.inputGroupClass}>
              <FormControlReadonly ctx={ctx4}>
                {numbro(ctx4.value.details.map(mle => subTotalPrice(mle.element)).sum()).format("0.00")}
              </FormControlReadonly>
              <div className="input-group-append">
                <span className="input-group-text">€</span>
              </div>
            </div>
          </FormGroup>
        </div>
      </div>

    </div>
  );
}

function ago(date: string | null | undefined) {

  if (!date)
    return undefined;

  return moment(date).fromNow(true);
}

function stateColor(s: OrderState | undefined) {

  if (!s)
    return undefined;

  switch (s) {
    case "New":
    case "Ordered": return "#33cc33";
    case "Shipped": return "#0066ff";
    case "Canceled": return "#ff0000";

  }
}

function subTotalPrice(od: OrderDetailEmbedded) {
  return (od.quantity || 0) * (od.unitPrice || 0) * (1 - (od.discount || 0));
}
