import * as React from 'react'
import { Link } from 'react-router'
import * as moment from 'moment'
import { Input, Tab } from 'react-bootstrap'
//import { DatePicker } from 'react-widgets'
import { ModifiableEntity, Lite, IEntity, Entity, EntityControlMessage, JavascriptMessage, toLite } from 'Framework/Signum.React/Scripts/Signum.Entities'
import * as Navigator from 'Framework/Signum.React/Scripts/Navigator'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { FindOptions } from 'Framework/Signum.React/Scripts/FindOptions'
import { TypeContext, StyleContext, StyleOptions, FormGroupStyle } from 'Framework/Signum.React/Scripts/TypeContext'
import { PropertyRoute, PropertyRouteType, MemberInfo, getTypeInfo, getTypeInfos, TypeInfo, IsByAll } from 'Framework/Signum.React/Scripts/Reflection'
import { LineBase, LineBaseProps, FormGroup, FormControlStatic, runTasks} from 'Framework/Signum.React/Scripts/Lines/LineBase'
import Typeahead from 'Framework/Signum.React/Scripts/Lines/Typeahead'


export interface EntityBaseProps extends LineBaseProps {
    view?: boolean;
    viewOnCreate?: boolean;
    navigate?: boolean;
    create?: boolean;
    find?: boolean;
    remove?: boolean;

    onView?: (entity: ModifiableEntity, pr: PropertyRoute) => Promise<ModifiableEntity>;
    onCreate?: () => Promise<ModifiableEntity>;
    onFind?: () => Promise<ModifiableEntity | Lite<IEntity>>;
    onRemove?: (entity: ModifiableEntity| Lite<IEntity>) => Promise<boolean>;

    partialViewName?: string;
    ctx: TypeContext<ModifiableEntity | Lite<IEntity>>;
}


export abstract class EntityBase<T extends EntityBaseProps> extends LineBase<T>
{

    calculateDefaultState(state: EntityBaseProps) {

        var type = state.ctx.propertyRoute.member.type;

        state.create = type.isEmbedded ? Navigator.isCreable(type.name, false) :
            type.name == IsByAll ? false :
                getTypeInfos(type).some(ti=> Navigator.isCreable(ti, false));

        state.view = type.isEmbedded ? Navigator.isViewable(type.name, state.partialViewName) :
            type.name == IsByAll ? true :
                getTypeInfos(type).some(ti=> Navigator.isViewable(ti, state.partialViewName));

        state.navigate = type.isEmbedded ? Navigator.isNavigable(type.name, state.partialViewName) :
            type.name == IsByAll ? true :
                getTypeInfos(type).some(ti=> Navigator.isNavigable(ti, state.partialViewName));

        state.find = type.isEmbedded ? false :
            type.name == IsByAll ? false :
                getTypeInfos(type).some(ti=> Navigator.isFindable(ti));

        state.viewOnCreate = true;
        state.remove = true;
    }

    getTypeReference() {
        return this.state.ctx.propertyRoute.member.type;
    }

    convert(entityOrLite: ModifiableEntity | Lite<IEntity>): Promise<ModifiableEntity | Lite<IEntity>> {

        var tr = this.getTypeReference();

        var isLite = (entityOrLite as Lite<IEntity>).EntityType != null;
        var entityType = (entityOrLite as Lite<IEntity>).EntityType || (entityOrLite as ModifiableEntity).Type;


        if (tr.isEmbedded) {
            if (entityType != tr.name || isLite)
                throw new Error(`Impossible to convert '${entityType}' to '${tr.name}'`);

            return Promise.resolve(entityOrLite as ModifiableEntity);
        } else {
            if (tr.name != IsByAll && !tr.name.split(',').contains(entityType))
                throw new Error(`Impossible to convert '${entityType}' to '${tr.name}'`);

            if (isLite == tr.isLite)
                return Promise.resolve(entityOrLite);

            if (isLite)
                return Navigator.API.fetchEntity(entityOrLite as Lite<IEntity>);
            
            var entity = entityOrLite as Entity; 

            return Promise.resolve(toLite(entity, entity.isNew));
        }
    }

    //defaultView() {
    //    var e = this.state.ctx.value;

    //    if (this.state.ctx.propertyRoute.member.type.isEmbedded) {

    //        return Navigator.view(e as ModifiableEntity, this.state.ctx.propertyRoute);
    //    }
    //    return Navigator.API.fetchEntityPack(e as Lite<Entity>);
    //}
    

    handleViewClick = (event: React.SyntheticEvent) => {
        //var view = this.state.onView ?
        //    this.entity().then(e=> this.state.onView(e, )) :
        //    this.entity().then(e=> Navigator.view(

    };
    renderViewButton(btn: boolean) {
        if (!this.state.view)
            return null;

        return <a className={classes("sf-line-button", "sf-view", btn ? "btn btn-default" : null) }
            onClick={this.handleViewClick}
            title={EntityControlMessage.View.niceToString() }>
            <span className="glyphicon glyphicon-arrow-right"/>
            </a>;
    }

    handleCreateClick = (event: React.SyntheticEvent) => {};
    renderCreateButton(btn: boolean) {
        if (!this.state.create || this.state.ctx.readOnly)
            return null;

        return <a className={classes("sf-line-button", "sf-create", btn ? "btn btn-default" : null) }
            onClick={this.handleCreateClick}
            title={EntityControlMessage.Create.niceToString() }>
            <span className="glyphicon glyphicon-plus"/>
            </a>;
    }


    defaultFind(): Promise<ModifiableEntity | Lite<IEntity>> {
        return Finder.find({ queryName: this.state.type.name } as FindOptions);
    }

    handleFindClick = (event: React.SyntheticEvent) => {
        var result = this.state.onFind ? this.state.onFind() : this.defaultFind();

        result.then(entity=> {
            if (!entity)
                return;

            this.convert(entity).then(e=> {
                this.state.ctx.value = e;
                this.forceUpdate();
            });
        });
    };
    renderFindButton(btn: boolean) {
        if (!this.state.find || this.state.ctx.readOnly)
            return null;

        return <a className={classes("sf-line-button", "sf-find", btn ? "btn btn-default" : null) }
            onClick={this.handleFindClick}
            title={EntityControlMessage.Find.niceToString() }>
            <span className="glyphicon glyphicon-search"/>
            </a>;
    }

    handleRemoveClick = (event: React.SyntheticEvent) => {
        (this.state.onRemove ? this.state.onRemove(this.state.ctx.value) : Promise.resolve(true))
            .then(result=> {
                if (!result)
                    return;

                this.state.ctx.value = null;
                this.forceUpdate();
            });
    };
    renderRemoveButton(btn: boolean) {
        if (!this.state.remove || this.state.ctx.readOnly)
            return null;

        return <a className={classes("sf-line-button", "sf-remove", btn ? "btn btn-default" : null) }
            onClick={this.handleRemoveClick}
            title={EntityControlMessage.Remove.niceToString() }>
            <span className="glyphicon glyphicon-remove"/>
            </a>;
    }
}




export interface EntityLineProps extends EntityBaseProps {
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
        this.convert(lite).then(entity=> {
            this.state.ctx.value = entity;
            this.forceUpdate();
        });
        return lite.toStr;
    }
    
    renderInternal() {

        var s = this.state;

        var hasValue = !!s.ctx.value;

        return <FormGroup ctx={s.ctx} title={s.labelText}>
            <div className="SF-entity-line SF-control-container">
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


export interface EntityComboProps extends EntityBaseProps {
}



export class EntityCombo extends EntityBase<EntityComboProps> {

    renderInternal() {
        return null;
    }
}


export interface EntityListBaseProps extends EntityBaseProps {
    move?: boolean;
}


export abstract class EntityListBase<T extends EntityListBaseProps> extends LineBase<T>
{   

}