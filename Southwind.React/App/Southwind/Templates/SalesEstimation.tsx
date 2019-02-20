import * as React from 'react'
import { ProductEntity, ProductPredictorPublication } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, FormControlReadonly, FormGroup } from '@framework/Lines'
import * as Finder from '@framework/Finder';
import { is, liteKey } from '@framework/Signum.Entities';
import { ajaxPost, useAPI } from '@framework/Services';
import { Gradient, Color } from '@extensions/Basics/Color';
import { toLite } from '@framework/Signum.Entities';
import { classes } from '@framework/Globals';
import { EntityControlMessage } from '@framework/Signum.Entities';
import { PredictorEntity } from '@extensions/MachineLearning/Signum.Entities.MachineLearning';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


var gradient = new Gradient([
  { value: 0, color: Color.parse("red") },
  { value: 1, color: Color.parse("gold") },
  { value: 2, color: Color.parse("green") },
  { value: 3, color: Color.parse("blue") },
]);

export default function SalesEstimation({ ctx }: { ctx: TypeContext<ProductEntity> }) {

  function handleViewClick(e: React.MouseEvent<any>) {
    e.preventDefault();
    Finder.exploreWindowsOpen({ queryName: PredictorEntity, parentToken: "Entity.Publication", parentValue: ProductPredictorPublication.MonthlySales }, e);
  }

  const estimation = useAPI(undefined, [ctx.value.id], signal => ajaxPost<number>({ url: "~/api/salesEstimation", signal }, toLite(ctx.value)));

  const color = estimation != null ? gradient.getCachedColor(ctx.value.unitsInStock! / (Math.max(1, estimation))) : undefined;

  return (
    <FormGroup ctx={ctx} labelText="Sales next month" helpText="Monthly estimation using Predicitor extension">
      {
        estimation != null &&
        <div className={ctx.inputGroupClass}>
          <div className="input-group-prepend">
            <span className="input-group-text">
              <FontAwesomeIcon icon={["far", "lightbulb"]} />
            </span>
          </div>
          <p className={classes(ctx.formControlClass, "readonly numeric")} style={{ color: color && color.toString() }}>
            {estimation}
          </p>
          <div className="input-group-append">
            <a href="#" className={classes("sf-line-button", "sf-view", "btn input-group-text")}
              onClick={handleViewClick}
              title={EntityControlMessage.View.niceToString()}>
              <FontAwesomeIcon icon={"arrow-right"} />
            </a>
          </div>
        </div>
      }
    </FormGroup>
  );
}

