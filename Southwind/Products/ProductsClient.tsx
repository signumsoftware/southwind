import * as React from 'react'
import { RouteObject } from 'react-router'
import * as Navigator from '@framework/Navigator'
import * as Finder from '@framework/Finder'
import { EntitySettings } from '@framework/Navigator';
import { CategoryEntity, ProductEntity, SupplierEntity } from './Southwind.Products';
import { FileEmbedded } from '@extensions/Signum.Files/Signum.Files';
import { FilterGroupOption } from '@framework/FindOptions';



export function start(options: { routes: RouteObject[] }) {

  Navigator.addSettings(new EntitySettings(CategoryEntity, c => import('./Category')));
  Navigator.addSettings(new EntitySettings(ProductEntity, p => import('./Product')));
  Navigator.addSettings(new EntitySettings(SupplierEntity, s => import('./Supplier')));

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
      pinned: { splitText: true, disableOnNull: true },
    } as FilterGroupOption]
  });

}
