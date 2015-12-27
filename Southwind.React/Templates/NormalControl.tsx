
import * as React from 'react'
import * as Navigator from 'Framework/Signum.React/Scripts/Navigator'
import { TypeContext, StyleOptions } from 'Framework/Signum.React/Scripts/TypeContext'
import { Entity, Lite, LiteMessage } from 'Framework/Signum.React/Scripts/Signum.Entities'
import { getTypeInfo, TypeInfo, PropertyRoute } from 'Framework/Signum.React/Scripts/Reflection'



interface NormalControlProps extends React.Props<NormalControl> {
    title?: string;
    lite?: Lite<Entity>;
    showOperations?: boolean;
    partialViewName?: string;
}

interface NormalControlState {
    entity?: Entity;
    canExecute?: { [key: string]: string };
    validationErrors?: { [key: string]: string };
    component?: React.ComponentClass<{ ctx: TypeContext<Entity> }>;
    entitySettings?: Navigator.EntitySettingsBase;
}

export default class NormalControl extends React.Component<NormalControlProps, NormalControlState> {

    static defaultProps: NormalControlProps = {
        showOperations: true,
    }

    constructor(props) {
        super(props);
        this.state = { entity: null, entitySettings: Navigator.getSettings(this.props.lite.EntityType) };

        Navigator.API.fetchEntityPack(this.props.lite).then(pack=> {
            this.setState({
                entity: pack.entity,
                canExecute: pack.canExecute
            });

            var partialViewName = this.props.partialViewName || this.state.entitySettings.onPartialView(pack.entity);

            require([partialViewName], Com=> {

                var keys = Dic.getKeys(Com);
                if (keys.length != 1 || keys.indexOf("default") == -1)
                    throw new Error(`The view '${partialViewName}' should contain just the 'export default'`); 

                this.setState({ component: Com["default"] });
            });
        });
    }


    render() {

        if (!this.state.entity)
            return null;

        var typeInfo = getTypeInfo(this.state.entity.Type);

        var styleOptions: StyleOptions = {
            readOnly: this.state.entitySettings.onIsReadonly()
        };

        var ctx = new TypeContext<Entity>(null, styleOptions, PropertyRoute.root(typeInfo), this.state.entity);

        return (<div className="normal-control">
            {this.renderTitle(typeInfo) }
            {Navigator.renderWidgets({ entity: this.state.entity }) }
            <div className="sf-button-bar">
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
        var title = this.props.title || this.state.entity.toStr;

        var typeTitle = this.state.entity.isNew ?
            LiteMessage.New_G.niceToString().forGenderAndNumber(typeInfo.gender).formatWith(typeInfo.niceName) :
            typeInfo.niceName + " " + this.state.entity.id;

        return <h3>
                <span className="sf-entity-title">{title}</span>
                <br/>
                <small className="sf-type-nice-name">{typeTitle}</small>
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



