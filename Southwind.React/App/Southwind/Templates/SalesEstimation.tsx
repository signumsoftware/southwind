import * as React from 'react'
import { ProductEntity } from '../Southwind.Entities'
import { ValueLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, FormControlReadonly, FormGroup } from '../../../../Framework/Signum.React/Scripts/Lines'
import * as Finder from '../../../../Framework/Signum.React/Scripts/Finder';
import { is } from '../../../../Framework/Signum.React/Scripts/Signum.Entities';
import { ajaxPost } from '../../../../Framework/Signum.React/Scripts/Services';
import { Gradient, Color } from '../../../../Extensions/Signum.React.Extensions/Basics/Color';
import { toLite } from '../../../../Framework/Signum.React/Scripts/Signum.Entities';
import { classes } from '../../../../Framework/Signum.React/Scripts/Globals';
import { EntityControlMessage } from '../../../../Framework/Signum.React/Scripts/Signum.Entities';
import { PredictorEntity } from '../../../../Extensions/Signum.React.Extensions/MachineLearning/Signum.Entities.MachineLearning';


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

        const color = this.state.estimation != null && this.gradient.getCachedColor(this.props.ctx.value.unitsInStock! / (Math.max(1, this.state.estimation)));

        return (
            <FormGroup ctx={ctx} labelText="Sales next month" helpText="Monthly estimation using Predicitor extension">
                {
                    this.state.estimation != null &&
                    <div className="input-group" >
                        <div className="input-group-addon"><i className="fa fa-lightbulb-o" aria-hidden="true" /></div>
                        <p className="form-control readonly numeric" style={{ color }}>{this.state.estimation}</p>
                        <div className="input-group-btn">
                            <a className={classes("sf-line-button", "sf-view", "btn btn-light")}
                                onClick={this.handleViewClick}
                                title={EntityControlMessage.View.niceToString()}>
                                <span className="glyphicon glyphicon-arrow-right" />
                            </a>
                        </div>
                    </div>
                }
            </FormGroup>
        );
    }

    handleViewClick = (e: React.MouseEvent<any>) => {
        Finder.exploreWindowsOpen({ queryName: PredictorEntity, parentColumn: "Name", parentValue: "SalesEstimation" }, e);
    }
}//SalesEstimation

