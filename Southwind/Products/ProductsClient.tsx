import * as React from 'react'
import { RouteObject } from 'react-router'
import { Navigator, EntitySettings } from '@framework/Navigator'
import { Finder } from '@framework/Finder'

import { FileEmbedded } from '@extensions/Signum.Files/Signum.Files'

import { FilterGroupOption } from '@framework/FindOptions';
import { CategoryEntity, ProductEntity, SupplierEntity } from './Southwind.Products'

export namespace ProductsClient {
  
  
  export function start(options: { routes: RouteObject[] }) {
  
    Navigator.addSettings(new EntitySettings(CategoryEntity, c => import('./Category')));
    Navigator.addSettings(new EntitySettings(SupplierEntity, s => import('./Supplier')));
    Navigator.addSettings(new EntitySettings(ProductEntity, p => import('./Product')));
  
    /* If no view is detected DynamicComponent creates one automatically*/
    //Navigator.addSettings(new EntitySettings(RegionEntity, r => import('./Templates/Region')));
    //Navigator.addSettings(new EntitySettings(TerritoryEntity, t => import('./Templates/Territory')));
  
    {/*Files*/ }
    const maxDimensions: React.CSSProperties = { maxWidth: "96px", maxHeight: "96px" };
    Finder.registerPropertyFormatter(CategoryEntity.tryPropertyRoute(ca => ca.picture),
      new Finder.CellFormatter((cell: FileEmbedded) => <img style={maxDimensions} src={"data:image/jpeg;base64," + cell.binaryFile} />, false));
    {/*Files*/ }
  
    Finder.addSettings({
      queryName: ProductEntity,
      defaultFilters: [{
        groupOperation: "Or",
        filters: [
          { token: ProductEntity.token(a => a.productName), operation: "Contains" },
          { token: ProductEntity.token(a => a.supplier!.entity!.companyName), operation: "Contains" },
          { token: ProductEntity.token(a => a.category!.entity!.categoryName), operation: "Contains" },
        ],
        pinned: { splitValue: true, disableOnNull: true },
      } as FilterGroupOption]
    });
  
  }
}
