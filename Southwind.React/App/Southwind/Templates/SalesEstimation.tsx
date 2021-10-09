import * as React from 'react'
import { OrderMessage, ProductEntity, ProductPredictorPublication } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, FormControlReadonly, FormGroup } from '@framework/Lines'
import * as Finder from '@framework/Finder';
import { is, liteKey } from '@framework/Signum.Entities';
import { ajaxPost } from '@framework/Services';
import { Gradient, Color } from '@extensions/Basics/Color';
import { toLite } from '@framework/Signum.Entities';
import { useAPI } from '@framework/Hooks';
import { classes } from '@framework/Globals';
import { EntityControlMessage } from '@framework/Signum.Entities';
import { PredictorEntity } from '@extensions/MachineLearning/Signum.Entities.MachineLearning';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


var gradient = new Gradient([
  { value: 0, color: Color.parse("#7B241C") },
  { value: 1, color: Color.parse("#B9770E") },
  { value: 2, color: Color.parse("#1E8449") },
  { value: 3, color: Color.parse("#1F618D") },
]);

export default function SalesEstimation({ ctx }: { ctx: TypeContext<ProductEntity> }) {

  function handleViewClick(e: React.MouseEvent<any>) {
    e.preventDefault();
    Finder.exploreWindowsOpen({ queryName: PredictorEntity, filterOptions: [{ token: "Entity.Publication", value: ProductPredictorPublication.MonthlySales }] }, e);
  }

  const estimation = useAPI(signal => ajaxPost<number>({ url: "~/api/salesEstimation", signal }, toLite(ctx.value)), [ctx.value.id]);

  const color = estimation != null ? gradient.getCachedColor(ctx.value.unitsInStock! / (Math.max(1, estimation))) : undefined;

  return (
    <FormGroup ctx={ctx} labelText={OrderMessage.SalesNextMonth.niceToString()} helpText = "Monthly estimation using Predicitor extension" >
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

