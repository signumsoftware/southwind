import * as React from 'react'
import { OrderFilterModel } from '../Southwind.Entities'
import { ISimpleFilterBuilder, FilterOption, FindOptions, FilterOperation } from '../../../../Framework/Signum.React/Scripts/Search'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class OrderFilter extends React.Component<{ ctx: TypeContext<OrderFilterModel> }, void> implements ISimpleFilterBuilder {

    render() {
        var ctx = this.props.ctx.subCtx({ formGroupStyle: "Basic" });
        return (
            <div className="form-vertical">
                <div className="row">
                    <div className="col-sm-6">
                        <EntityCombo ctx={ctx.subCtx(o => o.customer) } />
                        <ValueLine ctx={ctx.subCtx(o => o.minOrderDate) } />
                    </div>
                    <div className="col-sm-6">
                        <EntityLine ctx={ctx.subCtx(o => o.employee) } />
                        <ValueLine ctx={ctx.subCtx(o => o.maxOrderDate) } />
                    </div>
                </div>
            </div>
        );
    }

    getFilters(): FilterOption[] {

        var result: FilterOption[] = []; 

        var val = this.props.ctx.value;

        if (val.customer)
            result.push({ columnName: "Customer", value: val.customer });

        if (val.employee)
            result.push({ columnName: "Employee", value: val.employee });

        if (val.minOrderDate)
            result.push({ columnName: "OrderDate", value: val.minOrderDate, operation: "GreaterThanOrEqual" });

        if (val.maxOrderDate)
            result.push({ columnName: "OrderDate", value: val.maxOrderDate, operation: "LessThan" });

        return result;
    }

    static extract(fo: FindOptions) {
        var filters = fo.filterOptions.clone();

        var extract = (columnName: string, operation: FilterOperation) => {
            var f = filters.filter(f => f.columnName == columnName && f.operation == operation).firstOrNull();
            if (!f)
                return null;

            filters.remove(f);
            return f.value;
        }

        var result = OrderFilterModel.New(fm => {
            fm.customer = extract("Customer", "EqualTo");
            fm.employee = extract("Employee", "EqualTo");
            fm.minOrderDate = extract("OrderDate", "GreaterThanOrEqual");
            fm.maxOrderDate = extract("OrderDate", "LessThan");
        }); 

        if (filters.length)
            return null;

        return result;
    }
}
