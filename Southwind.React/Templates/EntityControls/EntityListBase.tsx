import * as React from 'react'
import { Link } from 'react-router'
import { ModifiableEntity, Lite, IEntity, Entity, MListElement, EntityControlMessage, JavascriptMessage, toLite, is, liteKey } from 'Framework/Signum.React/Scripts/Signum.Entities'
import * as Navigator from 'Framework/Signum.React/Scripts/Navigator'
import * as Constructor from 'Framework/Signum.React/Scripts/Constructor'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { FindOptions } from 'Framework/Signum.React/Scripts/FindOptions'
import { TypeContext, StyleContext, StyleOptions, FormGroupStyle } from 'Framework/Signum.React/Scripts/TypeContext'
import { PropertyRoute, PropertyRouteType, MemberInfo, getTypeInfo, getTypeInfos, TypeInfo, IsByAll } from 'Framework/Signum.React/Scripts/Reflection'
import { LineBase, LineBaseProps, FormGroup, FormControlStatic, runTasks} from 'Framework/Signum.React/Scripts/Lines/LineBase'
import Typeahead from 'Framework/Signum.React/Scripts/Lines/Typeahead'
import SelectorPopup from 'Templates/SelectorPopup'
import { EntityBase, EntityBaseProps} from 'Southwind.React/Templates/EntityControls/EntityBase'


export interface EntityListBaseProps extends EntityBaseProps {
    move?: boolean;
    ctx: TypeContext<MListElement<(Lite<Entity> | ModifiableEntity)>[]>;
}


export abstract class EntityListBase<T extends EntityListBaseProps> extends EntityBase<T>
{   
    moveUp(index: number){
        var list = this.props.ctx.value;

        var entity = list[index]
        list.removeAt(index);
        list.insertAt(index - 1, entity);
        this.setValue(list);
    }

    renderMoveUp(btn: boolean, index: number) {
        if (!this.state.move || this.state.ctx.readOnly)
            return null;
        
        return <a className={classes("sf-line-button", "sf-move", btn ? "btn btn-default" : null) }
            onClick={() => this.moveUp(index)}
            title={EntityControlMessage.MoveUp.niceToString() }>
            <span className="glyphicon glyphicon-chevron-up"/>
            </a>;
    }

    moveDown(index: number){
        var list = this.props.ctx.value;
        var entity = list[index]
        list.removeAt(index);
        list.insertAt(index + 1, entity);
        this.setValue(list);
    }

    renderMoveDown(btn: boolean, index: number) {
        if (!this.state.move || this.state.ctx.readOnly)
            return null;

        return <a className={classes("sf-line-button", "sf-move", btn ? "btn btn-default" : null) }
            onClick={() => this.moveDown(index) }
            title={EntityControlMessage.MoveUp.niceToString() }>
            <span className="glyphicon glyphicon-chevron-down"/>
            </a>;
    }
}