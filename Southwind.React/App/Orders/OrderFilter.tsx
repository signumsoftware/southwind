import * as React from 'react'
import { ISimpleFilterBuilder, FilterOption, FindOptions, FindOptionsParsed, FilterOperation, FilterOptionParsed, extractFilterValue } from '@framework/Search'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext } from '@framework/Lines'
import { OrderFilterModel } from './Southwind.Entities.Orders';

export default class OrderFilter extends React.Component<{ ctx: TypeContext<OrderFilterModel> }> implements ISimpleFilterBuilder {

  render() {
    const ctx = this.props.ctx.subCtx({ formGroupStyle: "Basic" });
    return (
      <div>
        <div className="row">
          <div className="col-sm-6">
            <EntityCombo ctx={ctx.subCtx(o => o.customer)} />
            <ValueLine ctx={ctx.subCtx(o => o.minOrderDate)} />
          </div>
          <div className="col-sm-6">
            <EntityLine ctx={ctx.subCtx(o => o.employee)} />
            <ValueLine ctx={ctx.subCtx(o => o.maxOrderDate)} />
          </div>
        </div>
      </div>
    );
  }

  getFilters(): FilterOption[] {

    const result: FilterOption[] = [];

    const val = this.props.ctx.value;

    if (val.customer)
      result.push({ token: "Customer", value: val.customer });

    if (val.employee)
      result.push({ token: "Employee", value: val.employee });

    if (val.minOrderDate)
      result.push({ token: "OrderDate", value: val.minOrderDate, operation: "GreaterThanOrEqual" });

    if (val.maxOrderDate)
      result.push({ token: "OrderDate", value: val.maxOrderDate, operation: "LessThan" });

    return result;
  }

  static extract(fos: FilterOptionParsed[]) {
    const filters = fos.clone();

    const result = OrderFilterModel.New({
      customer: extractFilterValue(filters, "Customer", "EqualTo"),
      employee: extractFilterValue(filters, "Employee", "EqualTo"),
      minOrderDate: extractFilterValue(filters, "OrderDate", "GreaterThanOrEqual"),
      maxOrderDate: extractFilterValue(filters, "OrderDate", "LessThan"),
    });

    if (filters.length)
      return undefined;

    return result;
  }
}
