import * as React from 'react'
import { ajaxGet } from "@framework/Services"
import * as numbro from "numbro"

import { CategoryEntity, ProductEntity } from './Southwind/Southwind.Entities'


export interface CategoryWithProducts {
  category: CategoryEntity;
  products: ProductEntity[];
}

export default class PublicCatalog extends React.Component<{}, { categories?: CategoryWithProducts[] }> {

  constructor(props: {}) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    ajaxGet<CategoryWithProducts[]>({ url: "~/api/catalog" })
      .then(cat => this.setState({ categories: cat }))
      .done();
  }

  render() {
    const maxDimensions: React.CSSProperties = { maxWidth: "96px", maxHeight: "96px" };

    const result = (
      <div>
        <h2>Southwind Product Catalog</h2>
        {this.state.categories && this.state.categories.map(c =>
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
}
