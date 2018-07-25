import * as React from 'react'
import { ProductEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, FormControlReadonly, FormGroup } from '@framework/Lines'
import * as Finder from '@framework/Finder';
import { is } from '@framework/Signum.Entities';
import { ajaxPost } from '@framework/Services';
import { Gradient, Color } from '@extensions/Basics/Color';
import { toLite } from '@framework/Signum.Entities';
import { classes } from '@framework/Globals';
import { EntityControlMessage } from '@framework/Signum.Entities';
import { PredictorEntity } from '@extensions/MachineLearning/Signum.Entities.MachineLearning';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface SalesEstimationProps {
    ctx: TypeContext<ProductEntity>
}

interface SalesEstimationState {
    estimation?: number;
}

export default class SalesEstimation extends React.Component<SalesEstimationProps, SalesEstimationState> {

    constructor(props: SalesEstimationProps) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        this.loadData(this.props);
    }

    componentWillReceiveProps(newProps: SalesEstimationProps) {
        if (!is(newProps.ctx.value, this.props.ctx.value))
            this.loadData(newProps);
    }

    loadData(props: SalesEstimationProps) {
        ajaxPost<number>({ url: "~/api/salesEstimation" }, toLite(props.ctx.value))
            .then(estimation => this.setState({ estimation }))
            .done();
    }

    gradient = new Gradient([
        { value: 0, color: Color.parse("red") },
        { value: 1, color: Color.parse("gold") },
        { value: 2, color: Color.parse("green") },
        { value: 3, color: Color.parse("blue") },
    ]);

    render() {
        const ctx = this.props.ctx;

        const color = this.state.estimation != null ? this.gradient.getCachedColor(this.props.ctx.value.unitsInStock! / (Math.max(1, this.state.estimation))) : undefined;

        return (
            <FormGroup ctx={ctx} labelText="Sales next month" helpText="Monthly estimation using Predicitor extension">
                {
                    this.state.estimation != null &&
                    <div className={ctx.inputGroupClass}>
                        <div className="input-group-prepend">
                            <span className="input-group-text">
                                <FontAwesomeIcon icon={["far", "lightbulb"]} />
                            </span>
                        </div>
                        <p className={classes(ctx.formControlClass, "readonly numeric")} style={{ color: color && color.toString() }}>
                            {this.state.estimation}
                        </p>
                        <div className="input-group-append">
                            <a href="#" className={classes("sf-line-button", "sf-view", "btn input-group-text")}
                                onClick={this.handleViewClick}
                                title={EntityControlMessage.View.niceToString()}>
                                <FontAwesomeIcon icon={"arrow-right"} />
                            </a>
                        </div>
                    </div>
                }
            </FormGroup>
        );
    }

    handleViewClick = (e: React.MouseEvent<any>) => {
        e.preventDefault();
        Finder.exploreWindowsOpen({ queryName: PredictorEntity, parentColumn: "Name", parentValue: "SalesEstimation" }, e);
    }
}//SalesEstimation

