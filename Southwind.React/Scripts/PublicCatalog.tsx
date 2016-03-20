/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />

import * as React from 'react'
import { ajaxGet } from "../../Framework/Signum.React/Scripts/Services"
import * as numeral from "numeral"

import { CategoryEntity, ProductEntity } from './Southwind/Southwind.Entities.ts'


export interface CategoryWithProducts {
    category: CategoryEntity;
    products: ProductEntity[];
}

export default class PublicCatalog extends React.Component<{}, { categories?: CategoryWithProducts[] }> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        ajaxGet<CategoryWithProducts[]>({ url: "/api/catalog" })
            .then(cat => this.setState({ categories: cat }));
    }

    render() {
        var maxDimensions: React.CSSProperties = { maxWidth: "96px", maxHeight: "96px" };

        var result = (
            <div>
                <h2>Southwind Product Catalog</h2>
                { this.state.categories && this.state.categories.map(c =>
                    <div key={c.category.id}>
                        <div className="media">
                            { c.category.picture && <img className="pull-left" style={maxDimensions} src={"data:image/jpeg;base64," + c.category.picture.binaryFile}/> }
                            <div className="media-body">
                                <h4 className="media-heading">{c.category.categoryName}</h4>
                                {c.category.description}
                            </div>
                        </div>

                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>{ProductEntity.nicePropertyName(p => p.productName) }</th>
                                    <th>{ProductEntity.nicePropertyName(p => p.unitPrice) }</th>
                                    <th>{ProductEntity.nicePropertyName(p => p.quantityPerUnit) }</th>
                                    <th>{ProductEntity.nicePropertyName(p => p.unitsInStock) }</th>
                                </tr>
                            </thead>
                            <tbody>
                                { c.products.orderBy(a => a.id).orderBy(a => a.reorderLevel).map(p => <tr key={p.id}>
                                    <td>{p.productName}</td>
                                    <td>{numeral(p.unitPrice).format("0.00") } {ProductEntity.memberInfo(p => p.unitPrice).unit}</td>
                                    <td>{p.quantityPerUnit}</td>
                                    <td>{p.unitsInStock}</td>
                                </tr>)
                                }
                            </tbody>
                        </table>
                    </div>
                ) }
            </div>
        );

        return result;
    }
}
