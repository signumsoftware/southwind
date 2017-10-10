import * as React from 'react'
import { OrderFilterModel } from '../Southwind.Entities'
import { ISimpleFilterBuilder, FilterOption, FindOptions, FindOptionsParsed, FilterOperation, FilterOptionParsed } from '../../../../Framework/Signum.React/Scripts/Search'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '../../../../Framework/Signum.React/Scripts/Lines'

export default class OrderFilter extends React.Component<{ ctx: TypeContext<OrderFilterModel> }> implements ISimpleFilterBuilder {

    render() {
        const ctx = this.props.ctx.subCtx({ formGroupStyle: "Basic" });
        return (
            <div>
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

        const result: FilterOption[] = []; 

        const val = this.props.ctx.value;

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

    static extract(fos: FilterOptionParsed[]) {
        const filters = fos.clone();

        const extract = (columnName: string, operation: FilterOperation) => {
            const f = filters.filter(f => f.token!.fullKey == columnName && f.operation == operation).firstOrNull();
            if (!f)
                return undefined;

            filters.remove(f);
            return f.value;
        }

        const result = OrderFilterModel.New({
            customer: extract("Customer", "EqualTo"),
            employee: extract("Employee", "EqualTo"),
            minOrderDate: extract("OrderDate", "GreaterThanOrEqual"),
            maxOrderDate: extract("OrderDate", "LessThan"),
        });

        if (filters.length)
            return undefined;

        return result;
    }
}
