import * as React from 'react'
import { ajaxGet } from "@framework/Services"
import numbro from "numbro"

import { CategoryEntity, ProductEntity } from './Southwind/Southwind.Entities'
import { useAPI } from '../../Framework/Signum.React/Scripts/Hooks'

export interface CategoryWithProducts {
  category: CategoryEntity;
  products: ProductEntity[];
}

export default function PublicCatalog() {

  const categories = useAPI(undefined, () => ajaxGet<CategoryWithProducts[]>({ url: "~/api/catalog" }), []);

  const maxDimensions: React.CSSProperties = { maxWidth: "96px", maxHeight: "96px" };

  const result = (
    <div>
      <h2>Southwind Product Catalog</h2>
      {categories && categories.map(c =>
        <div key={c.category.id}>
          <div className="media">
            {c.category.picture && <img className="d-flex mr-3" style={maxDimensions} src={"data:image/jpeg;base64," + c.category.picture.binaryFile} />}
            <div className="media-body">
              <h4 className="mt-0">{c.category.categoryName}</h4>
              {c.category.description}
            </div>
          </div>

          <table className="table table-hover">
            <thead>
              <tr>
                <th>{ProductEntity.nicePropertyName(p => p.productName)}</th>
                <th>{ProductEntity.nicePropertyName(p => p.unitPrice)}</th>
                <th>{ProductEntity.nicePropertyName(p => p.quantityPerUnit)}</th>
                <th>{ProductEntity.nicePropertyName(p => p.unitsInStock)}</th>
              </tr>
            </thead>
            <tbody>
              {c.products.orderBy(a => a.id).orderBy(a => a.reorderLevel).map(p => <tr key={p.id}>
                <td>{p.productName}</td>
                <td>{numbro(p.unitPrice).format("0.00")} {ProductEntity.memberInfo(p => p.unitPrice).unit}</td>
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

