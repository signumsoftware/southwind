import * as React from 'react'
import { Link } from 'react-router'
import { ModifiableEntity, Lite, IEntity, Entity, EntityControlMessage, JavascriptMessage, toLite, is, liteKey } from 'Framework/Signum.React/Scripts/Signum.Entities'
import * as Navigator from 'Framework/Signum.React/Scripts/Navigator'
import * as Constructor from 'Framework/Signum.React/Scripts/Constructor'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { FindOptions } from 'Framework/Signum.React/Scripts/FindOptions'
import { TypeContext, StyleContext, StyleOptions, FormGroupStyle } from 'Framework/Signum.React/Scripts/TypeContext'
import { PropertyRoute, PropertyRouteType, MemberInfo, getTypeInfo, getTypeInfos, TypeInfo, IsByAll } from 'Framework/Signum.React/Scripts/Reflection'
import { LineBase, LineBaseProps, FormGroup, FormControlStatic, runTasks} from 'Framework/Signum.React/Scripts/Lines/LineBase'
import Typeahead from 'Framework/Signum.React/Scripts/Lines/Typeahead'
import SelectorPopup from 'Templates/SelectorPopup'
import { EntityListBase, EntityListBaseProps} from 'Southwind.React/Templates/EntityControls/EntityListBase'


export interface EntityListProps extends EntityListBaseProps {
    selectedIndex?: number;
}


export abstract class EntityList extends EntityListBase<EntityListProps>
{   
    moveUp(index: number) {
        super.moveUp(index);
        this.setState({ selectedIndex: this.state.selectedIndex - 1 } as any);
    }

    moveDown(index: number) {
        super.moveDown(index);
        this.setState({ selectedIndex: this.state.selectedIndex + 1 } as any);
    }

    renderInternal() {

        var s = this.state;
        var list = this.state.ctx.value;

        var hasSelected = s.selectedIndex != null;

        return <FormGroup ctx={s.ctx} title={s.labelText}>
            <div className="SF-entity-line">
                <div className="input-group">
                    <select className="form-control" size={6}>
                       {s.ctx.value.map((e, i) => <option  key={i} title={this.getTitle(e.element) }>{e.element.toStr}</option>) }
                        </select>
                    <span className="input-group-btn btn-group-vertical">
                        { this.renderCreateButton(true) }
                        { this.renderFindButton(true) }
                        { hasSelected && this.renderViewButton(true) }
                        { hasSelected && this.renderRemoveButton(true) }
                        { hasSelected && this.state.move && s.selectedIndex > 0 && this.renderMoveUp(true, s.selectedIndex) }
                        { hasSelected && this.state.move && s.selectedIndex < list.length - 1 && this.renderMoveDown(true, s.selectedIndex) }
                        </span>
                    </div>
                </div>
            </FormGroup>;
    }

    getTitle(e: Lite<Entity> | ModifiableEntity) {

        var pr = this.props.ctx.propertyRoute;

        var type = pr && pr.member && pr.member.typeNiceName || (e as Lite<Entity>).EntityType || (e as ModifiableEntity).Type;

        var id = (e as Lite<Entity>).id || (e as Entity).id;
        
        return type + (id ? " " + id : "");
    }
}