import * as React from 'react'
import { Route } from 'react-router'
import { DateTime } from 'luxon'
import { ajaxPost, ajaxGet } from '@framework/Services';
import { EntitySettings, ViewPromise } from '@framework/Navigator'
import * as Navigator from '@framework/Navigator'
import * as Finder from '@framework/Finder'
import { EntityOperationSettings, ConstructorOperationSettings, ContextualOperationSettings } from '@framework/Operations'
import * as Operations from '@framework/Operations'
import { FetchInState } from '@framework/Lines/Retrieve'

import { getMixin, Entity, Lite, getToString } from '@framework/Signum.Entities'
import { UserEntity } from '@extensions/Authorization/Signum.Entities.Authorization'
import { FileEmbedded, FileEntity } from '@extensions/Files/Signum.Entities.Files'

import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '@framework/Lines'
import ValueLineModal from '@framework/ValueLineModal'

import * as QuickLinks from '@framework/QuickLinks';
import * as AppContext from '@framework/AppContext';
import { RegisterUserModel } from '../Public/Southwind.Entities.Public';
import OrderFilter from './Templates/OrderFilter'

import { ApplicationConfigurationEntity } from './Southwind.Entities'

import { /*Southwind.Entities*/
  AddressEmbedded, OrderDetailEmbedded, OrderFilterModel, CategoryEntity, EmployeeLiteModel,
  CustomerQuery, CompanyEntity, EmployeeEntity, OrderEntity, PersonEntity, ProductEntity,
  RegionEntity, ShipperEntity, SupplierEntity, TerritoryEntity, UserEmployeeMixin, OrderOperation, CustomerEntity, OrderState
} from './Southwind.Entities'
import { FilterGroupOption } from '@framework/FindOptions';
import { FileImage } from '../../../Framework/Signum.React.Extensions/Files/FileImage';
import { TypeaheadOptions } from '../../../Framework/Signum.React/Scripts/Components/Typeahead';


export function start(options: { routes: JSX.Element[] }) {

  Navigator.addSettings(new EntitySettings(ApplicationConfigurationEntity, a => import('./Templates/ApplicationConfiguration')));
  Navigator.addSettings(new EntitySettings(AddressEmbedded, a => import('./Templates/Address')));
  Navigator.addSettings(new EntitySettings(CategoryEntity, c => import('./Templates/Category')));
  Navigator.addSettings(new EntitySettings(CompanyEntity, c => import('./Templates/Company')));
  Navigator.addSettings(new EntitySettings(EmployeeEntity, e => import('./Templates/Employee'), {
    renderLite: (lite, subStr) => {
      if (EmployeeLiteModel.isInstance(lite.model))
        return (
          <span>
            <FileImage
              style={{ width: "20px", height: "20px", borderRadius: "100%", marginRight: "4px", marginTop: "-3px" }}
              file={lite.model.photo} />
            {TypeaheadOptions.highlightedText(lite.model.firstName + " " + lite.model.lastName, subStr)}
          </span>
        );


      if (typeof lite.model == "string")
        return TypeaheadOptions.highlightedText(lite.model, subStr);

      return lite.EntityType;
    }
  }));

  Navigator.addSettings(new EntitySettings(OrderEntity, o => import('./Templates/Order')));
  Navigator.addSettings(new EntitySettings(PersonEntity, p => import('./Templates/Person')));
  Navigator.addSettings(new EntitySettings(ProductEntity, p => import('./Templates/Product')));
  Navigator.addSettings(new EntitySettings(SupplierEntity, s => import('./Templates/Supplier')));

  QuickLinks.registerQuickLink(EmployeeEntity, ctx =>
    new QuickLinks.QuickLinkLink(RegisterUserModel.typeName, () => EmployeeEntity.niceName(), AppContext.toAbsoluteUrl("~/registerUser/" + ctx.lite.id), {
      icon: "user-plus",
      iconColor: "#93c54b"
    }));//QuickLink

  /* If no view is detected DynamicComponent creates one automatically*/
  //Navigator.addSettings(new EntitySettings(RegionEntity, r => import('./Templates/Region')));
  //Navigator.addSettings(new EntitySettings(ShipperEntity, s => import('./Templates/Shipper')));
  //Navigator.addSettings(new EntitySettings(TerritoryEntity, t => import('./Templates/Territory')));

  Navigator.getSettings(UserEntity)!.overrideView((rep) => {
    rep.insertAfterLine(u => u.role, ctx => [
      <EntityLine ctx={ctx.subCtx(UserEmployeeMixin).subCtx(uem => uem.employee)} />
    ])
  });


  {/*Files*/ }
  const maxDimensions: React.CSSProperties = { maxWidth: "96px", maxHeight: "96px" };
  Finder.registerPropertyFormatter(CategoryEntity.tryPropertyRoute(ca => ca.picture),
    new Finder.CellFormatter((cell: FileEmbedded) => <img style={maxDimensions} src={"data:image/jpeg;base64," + cell.binaryFile} />, false));

  Finder.registerPropertyFormatter(EmployeeEntity.tryPropertyRoute(ca => ca.photo),
    new Finder.CellFormatter((cell: Lite<FileEntity>) => <FetchInState lite={cell}>{file => file && <img style={maxDimensions} src={"data:image/jpeg;base64," + (file as FileEntity).binaryFile} />}</FetchInState>, false));
  {/*Files*/ }

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

  Finder.addSettings({
    queryName: ProductEntity,
    defaultFilters: [{
      groupOperation: "Or",
      filters: [
        { token: ProductEntity.token(a => a.productName), operation: "Contains" },
        { token: ProductEntity.token(a => a.supplier!.entity!.companyName), operation: "Contains" },
        { token: ProductEntity.token(a => a.category!.entity!.categoryName), operation: "Contains" },
      ],
      pinned: { splitText: true, disableOnNull: true },
    } as FilterGroupOption]
  });


  Finder.addSettings({
    queryName: CustomerQuery.Customer,
    defaultFilters: [{
      groupOperation: "Or",
      filters: [
        { token: CompanyEntity.token(a => a.entity).cast(CompanyEntity).getToString(), operation: "Contains" },
        { token: PersonEntity.token(a => a.entity).cast(PersonEntity).getToString(), operation: "Contains" },
      ],
      pinned: { splitText: true, disableOnNull: true },
    } as FilterGroupOption]
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

  const selectShippedDate = (e?: OrderEntity) => ValueLineModal.show({
    type: { name: "datetime" },
    initialValue: e?.requiredDate ?? DateTime.local().toISO(),
    labelText: OrderEntity.nicePropertyName(a => a.shippedDate)
  });

  Operations.addSettings(new EntityOperationSettings(OrderOperation.Ship, {
    color: "info",
    icon: "truck",
    commonOnClick: oc => oc.getEntity().then(e => selectShippedDate(e)).then(date => oc.defaultClick(date)),
    contextualFromMany: {
      onClick: coc => selectShippedDate().then(date => coc.defaultClick(date))
    }
  }));//Ship
}
