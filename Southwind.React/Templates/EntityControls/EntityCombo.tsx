import * as React from 'react'
import { Link } from 'react-router'
import * as moment from 'moment'
import { Input, Tab } from 'react-bootstrap'
import {  } from 'react-widgets'
import { ModifiableEntity, Lite, IEntity, Entity, EntityControlMessage, JavascriptMessage, toLite, is, liteKey } from 'Framework/Signum.React/Scripts/Signum.Entities'
import * as Navigator from 'Framework/Signum.React/Scripts/Navigator'
import * as Constructor from 'Framework/Signum.React/Scripts/Constructor'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { FindOptions } from 'Framework/Signum.React/Scripts/FindOptions'
import { TypeContext, StyleContext, StyleOptions, FormGroupStyle } from 'Framework/Signum.React/Scripts/TypeContext'
import { PropertyRoute, PropertyRouteType, MemberInfo, getTypeInfo, getTypeInfos, TypeInfo, IsByAll } from 'Framework/Signum.React/Scripts/Reflection'
import { LineBase, LineBaseProps, FormGroup, FormControlStatic, runTasks} from 'Framework/Signum.React/Scripts/Lines/LineBase'
import { EntityBase, EntityBaseProps} from 'Southwind.React/Templates/EntityControls/EntityBase'


export interface EntityComboProps extends EntityBaseProps {
    ctx: TypeContext<ModifiableEntity | Lite<IEntity>>;

    data?: Lite<Entity>[];
}

export class EntityCombo extends EntityBase<EntityComboProps> {

    calculateDefaultState(state: EntityComboProps) {
        state.remove = false;
        state.create = false;
        state.view = false;
        state.find = false;

        if (!state.data) {
            if (this.state && this.state.type.name == state.type.name)
                state.data = this.state.data;

            if (!state.data) {
                Finder.API.findAllLites({ types: state.type.name })
                    .then(data => this.setState({ data: data } as any));
            }
        }
    }

    handleOnChange = (event: React.FormEvent) => {
        var current = event.currentTarget as HTMLSelectElement;
        
        if (current.value != liteKey(this.getLite())) {
            if (!current.value) {
                this.setValue(null);
            } else {
                var lite = this.state.data.filter(a=> liteKey(a) == current.value).single();

                this.convert(lite).then(v=> this.setValue(v));
            }
        }
    }

    getLite() {
        var v = this.state.ctx.value;
        if (v == null)
            return null;

        if ((v as ModifiableEntity).Type)
            return toLite(v as ModifiableEntity);

        return v as Lite<Entity>;
    }

    renderInternal() {

        var s = this.state;

        var hasValue = !!s.ctx.value;

        var lite = this.getLite();

        var elements: Lite<Entity>[] = [null].concat(s.data);
        if (lite && !elements.some(a=> is(a, lite)))
            elements.insertAt(1, lite);

        return <FormGroup ctx={s.ctx} title={s.labelText}>
            <div className="SF-entity-combo">
                <div className="input-group">
                <select className="form-control" onChange={this.handleOnChange} value={liteKey(lite) || "" }>
                      {elements.map((e, i) => <option key={i} value={e ? liteKey(e) : ""}>{e ? e.toStr : " - "}</option>) }
                    </select>
                    <span className="input-group-btn">
                        {!hasValue && this.renderCreateButton(true) }
                        {!hasValue && this.renderFindButton(true) }
                        {hasValue && this.renderViewButton(true) }
                        {hasValue && this.renderRemoveButton(true) }
                        </span>
                    </div>
                </div>
            </FormGroup>;
    }
}

