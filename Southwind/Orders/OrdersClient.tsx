import * as React from 'react'
import { RouteObject } from 'react-router'
import { DateTime } from 'luxon'
import { Navigator, EntitySettings } from '@framework/Navigator'
import { Finder } from '@framework/Finder'
import { Operations, EntityOperationSettings, ConstructorOperationSettings, ContextualOperationSettings } from '@framework/Operations'

import { TypeContext } from '@framework/Lines'
import AutoLineModal from '@framework/AutoLineModal'

import OrderFilter from './OrderFilter'
import { OrderEntity, OrderOperation, OrderState } from './Southwind.Orders'
import { CustomerQuery } from '../Customers/Southwind.Customers'


export function start(options: { routes: RouteObject[] }) {

  Navigator.addSettings(new EntitySettings(OrderEntity, o => import('./Order')));

  Finder.addSettings({
    queryName: OrderEntity,
    simpleFilterBuilder: ctx => {
      const model = OrderFilter.extract(ctx.initialFilterOptions);

      if (!model)
        return undefined;

      return <OrderFilter ctx={TypeContext.root(model)} />;
    },
    hiddenColumns: [{ token: "State" }],
    rowAttributes: (row, columns) => {
      var state = row.columns[columns.indexOf("State")] as OrderState;

      var color = state == "Canceled" ? "darkred" :
        state == "Shipped" ? "gray" :
          "black";

      return { style: { color: color } };
    }
  });


  Operations.addSettings(new ConstructorOperationSettings(OrderOperation.Create, {
    onConstruct: coc => {
      return Finder.find({ queryName: CustomerQuery.Customer }).then(c => {
        if (!c)
          return undefined;

        return coc.defaultConstruct(c);
      });
    }
  }));

  Operations.addSettings(new ContextualOperationSettings(OrderOperation.CreateOrderFromProducts, {
    onClick: coc => Finder.find({ queryName: CustomerQuery.Customer })
      .then(c => c && coc.defaultClick(c))
  }));

  const selectShippedDate = (e?: OrderEntity) => AutoLineModal.show({
    member: OrderEntity.memberInfo(a => a.shippedDate),
    initialValue: e?.requiredDate ?? DateTime.local().toISO()!,
    modalSize: "sm"
  });

  Operations.addSettings(new EntityOperationSettings(OrderOperation.Ship, {
    color: "info",
    icon: "truck",
    commonOnClick: oc => oc.getEntity().then(e => selectShippedDate(e)).then(date => date && oc.defaultClick(date)),
    contextualFromMany: {
      onClick: coc => selectShippedDate().then(date => date && coc.defaultClick(date))
    }
  }));//Ship

}
