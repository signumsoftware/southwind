import * as React from 'react'
import { ajaxGet } from "@framework/Services"
import numbro from "numbro"

import { CategoryEntity, ProductEntity, CatalogMessage } from './Southwind/Southwind.Entities'
import { useAPI } from '../../Framework/Signum.React/Scripts/Hooks'
import { Lite } from '@framework/Signum.Entities'

export interface CategoryWithProducts {
  category: Lite<CategoryEntity>;
  picture: string;
  locCategoryName: string;
  locDescription: string;
  products: ProductEntity[];
}

export default function PublicCatalog() {

  const categories = useAPI(() => ajaxGet<CategoryWithProducts[]>({ url: "~/api/catalog" }), []);

  const maxDimensions: React.CSSProperties = { maxWidth: "96px", maxHeight: "96px" };

  const result = (
    <div>
      <h2>Southwind Product Catalog</h2>
      {categories && categories.map(c =>
        <div key={c.category.id}>
          <div className="media">
            {c.picture && <img className="d-flex mr-3" style={maxDimensions} src={"data:image/jpeg;base64," + c.picture} />}
            <div className="media-body">
              <h4 className="mt-0">{c.locCategoryName}</h4>
              {c.locDescription}
            </div>
          </div>

          <table className="table table-hover">
            <thead>
              <tr>
                <th>{CatalogMessage.ProductName.niceToString()}</th>
                <th>{CatalogMessage.UnitPrice.niceToString()}</th>
                <th>{CatalogMessage.QuantityPerUnit.niceToString()}</th>
                <th>{CatalogMessage.UnitsInStock.niceToString()}</th>
              </tr>
            </thead>
            <tbody>
              {c.products.orderBy(a => a.id).orderBy(a => a.reorderLevel).map(p => <tr key={p.id}>
                <td>{p.productName}</td>
                <td>{numbro(p.unitPrice).format("0.00")} $</td>
                <td>{p.quantityPerUnit}</td>
                <td>{p.unitsInStock}</td>
              </tr>)
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return result;
}

