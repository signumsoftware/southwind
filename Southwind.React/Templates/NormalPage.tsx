
import * as React from 'react'
import * as Navigator from 'Framework/Signum.React/Scripts/Navigator'
import { ResultTable, FindOptions, FilterOption, QueryDescription } from 'Framework/Signum.React/Scripts/FindOptions'
import { Entity, Lite, is, toLite, LiteMessage } from 'Framework/Signum.React/Scripts/Signum.Entities'
import { TypeContext, StyleOptions } from 'Framework/Signum.React/Scripts/TypeContext'
import { getTypeInfo, TypeInfo, PropertyRoute, ReadonlyBinding } from 'Framework/Signum.React/Scripts/Reflection'


interface NormalPageProps extends ReactRouter.RouteComponentProps<{}, { type: string; id?: string }> {
    showOperations?: boolean;
    partialViewName?: string;
    title?: string;
}

interface NormalPageState {
    entity?: Entity;
    canExecute?: { [key: string]: string };
    validationErrors?: { [key: string]: string };
    component?: React.ComponentClass<{ ctx: TypeContext<Entity> }>;
    entitySettings?: Navigator.EntitySettingsBase;
    typeInfo?: TypeInfo;
}

export default class NormalPage extends React.Component<NormalPageProps, NormalPageState> {

    static defaultProps: NormalPageProps = {
        showOperations: true,
        partialViewName: null,
    }

    constructor(props) {
        super(props);
        this.state = this.calculateState(props);
        this.loadEntity(props)
            .then(() => this.loadComponent());
    }

    componentWillReceiveProps(props) {
        this.setState(this.calculateState(props));
        this.loadEntity(props)
            .then(() => this.loadComponent());
    }
    
    calculateState(props: NormalPageProps) {
        var typeInfo = getTypeInfo(props.routeParams.type);

        var entitySettings = Navigator.getSettings(typeInfo.name);

        return { entitySettings: entitySettings, typeInfo: typeInfo, entity: null };
    }

    loadEntity(props: NormalPageProps) : Promise<void> {

        var ti = this.state.typeInfo;

        var id = ti.members["Id"].type == "number" &&
            this.props.routeParams.id != "" ? parseInt(props.routeParams.id) : props.routeParams.id;

        var lite: Lite<Entity> = {
            EntityType: ti.name,
            id: id,
        };

        return Navigator.API.fetchEntityPack(lite)
            .then(pack=> this.setState({ entity: pack.entity, canExecute: pack.canExecute }));
    }

    loadComponent(): Promise<void> {

        var partialViewName = this.props.partialViewName || this.state.entitySettings.onPartialView(this.state.entity);

        return Navigator.requireComponent(partialViewName).then(c=>
            this.setState({ component: c }));
    }
    
    render() {     
        return (<div id="divMainPage" data-isnew={this.props.routeParams.id == null} className="form-horizontal">
            {this.renderEntityControl()}
            </div>);
    }

    renderEntityControl() {

        if (!this.state.entity)
            return null;
        

        var styleOptions: StyleOptions = {
            readOnly: this.state.entitySettings.onIsReadonly()
        };

        var ctx = new TypeContext<Entity>(null, styleOptions, PropertyRoute.root(this.state.typeInfo), new ReadonlyBinding(this.state.entity));

        return (<div className="normal-control">
            {this.renderTitle(this.state.typeInfo) }
            {Navigator.renderWidgets({ entity: this.state.entity }) }
            <div className="btn-toolbar sf-button-bar">
                {Navigator.renderButtons({ entity: this.state.entity, canExecute: this.state.canExecute }) }
                </div>
            {this.renderValidationErrors() }
        {Navigator.renderEmbeddedWidgets({ entity: this.state.entity }, Navigator.EmbeddedWidgetPosition.Top) }
            <div id="divMainControl" className="sf-main-control" data-test-ticks={new Date().valueOf() }>
                     {this.state.component && React.createElement(this.state.component, { ctx: ctx }) }
                </div>
                  {Navigator.renderEmbeddedWidgets({ entity: this.state.entity }, Navigator.EmbeddedWidgetPosition.Bottom) }
            </div>);
    }


    renderTitle(typeInfo: TypeInfo) {

        return <h3>
                <span className="sf-entity-title">{ this.props.title || this.state.entity.toStr}</span>
                <br/>
                <small className="sf-type-nice-name">{Navigator.getTypeTitel(this.state.entity)}</small>
            </h3>

    }

    renderValidationErrors() {
        if (!this.state.validationErrors || Dic.getKeys(this.state.validationErrors).length == 0)
            return null;

        return <ul className="validaton-summary alert alert-danger">
            {Dic.getValues(this.state.validationErrors).map(error=> <li>{error}</li>) }
            </ul>;
    }
}



