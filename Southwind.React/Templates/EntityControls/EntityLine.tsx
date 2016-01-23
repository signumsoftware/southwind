import * as React from 'react'
import { Link } from 'react-router'
import * as Navigator from 'Framework/Signum.React/Scripts/Navigator'
import * as Constructor from 'Framework/Signum.React/Scripts/Constructor'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { FindOptions } from 'Framework/Signum.React/Scripts/FindOptions'
import { TypeContext, StyleContext, StyleOptions, FormGroupStyle } from 'Framework/Signum.React/Scripts/TypeContext'
import { PropertyRoute, PropertyRouteType, MemberInfo, getTypeInfo, getTypeInfos, TypeInfo, IsByAll } from 'Framework/Signum.React/Scripts/Reflection'
import { LineBase, LineBaseProps, FormGroup, FormControlStatic, runTasks} from 'Framework/Signum.React/Scripts/Lines/LineBase'
import { ModifiableEntity, Lite, IEntity, Entity, EntityControlMessage, JavascriptMessage, toLite, is, liteKey } from 'Framework/Signum.React/Scripts/Signum.Entities'
import Typeahead from 'Framework/Signum.React/Scripts/Lines/Typeahead'
import SelectorPopup from 'Templates/SelectorPopup'
import { EntityBase, EntityBaseProps} from 'Southwind.React/Templates/EntityControls/EntityBase'



export interface EntityLineProps extends EntityBaseProps {

    ctx: TypeContext<ModifiableEntity | Lite<IEntity>>;

    autoComplete?: boolean;
    autoCompleteGetItems?: (query: string) => Promise<Lite<IEntity>[]>;
    autoCompleteRenderItem?: (lite: Lite<IEntity>, query: string) => React.ReactNode;
}

export class EntityLine extends EntityBase<EntityLineProps> {

    calculateDefaultState(state: EntityLineProps) {
        super.calculateDefaultState(state);
        state.autoComplete = !state.type.isEmbedded && state.type.name != IsByAll;
        state.autoCompleteGetItems = (query) => Finder.API.findLiteLike({
            types: state.type.name,
            subString: query,
            count: 5
        });

        state.autoCompleteRenderItem = (lite, query) => Typeahead.highlightedText(lite.toStr, query);
    }

    handleOnSelect = (lite: Lite<IEntity>, event: React.SyntheticEvent) => {
        this.convert(lite)
            .then(entity=> this.setValue(entity));
        return lite.toStr;
    }
    
    renderInternal() {

        var s = this.state;

        var hasValue = !!s.ctx.value;

        return <FormGroup ctx={s.ctx} title={s.labelText}>
            <div className="SF-entity-line">
                <div className="input-group">
                    { hasValue ? this.renderLink() : this.renderAutoComplete() }
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

    renderAutoComplete() {

        var s = this.state;

        if (!s.autoComplete || s.ctx.readOnly)
            return <FormControlStatic ctx={s.ctx}></FormControlStatic>;

        return <Typeahead
            inputAttrs={{ className: "form-control sf-entity-autocomplete" }}
            getItems={s.autoCompleteGetItems}
            renderItem={s.autoCompleteRenderItem}
            onSelect={this.handleOnSelect}/>;
    }

    renderItem = (item: Lite<IEntity>, query: string) => {
        return 
    }


    renderLink() {

        var s = this.state;

        if (s.ctx.readOnly)
            return <FormControlStatic ctx={s.ctx}>{s.ctx.value.toStr }</FormControlStatic>

        if (s.navigate && s.view) {
            return <a href="#" onClick={this.handleViewClick}
                className="form-control btn-default sf-entity-line-entity"
                title={JavascriptMessage.navigate.niceToString() }>
                {s.ctx.value.toStr }
                </a>;
        } else {
            return <span className="form-control btn-default sf-entity-line-entity">
                {s.ctx.value.toStr }
                </span>;
        }
    }
}

