var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/Signum.Entities', 'Framework/Signum.React/Scripts/Navigator', 'Framework/Signum.React/Scripts/Finder', 'Framework/Signum.React/Scripts/Reflection', 'Framework/Signum.React/Scripts/Lines/LineBase', 'Framework/Signum.React/Scripts/Lines/Typeahead'], function (require, exports, React, Signum_Entities_1, Navigator, Finder, Reflection_1, LineBase_1, Typeahead_1) {
    var EntityBase = (function (_super) {
        __extends(EntityBase, _super);
        function EntityBase() {
            var _this = this;
            _super.apply(this, arguments);
            //defaultView() {
            //    var e = this.state.ctx.value;
            //    if (this.state.ctx.propertyRoute.member.type.isEmbedded) {
            //        return Navigator.view(e as ModifiableEntity, this.state.ctx.propertyRoute);
            //    }
            //    return Navigator.API.fetchEntityPack(e as Lite<Entity>);
            //}
            this.handleViewClick = function (event) {
                //var view = this.state.onView ?
                //    this.entity().then(e=> this.state.onView(e, )) :
                //    this.entity().then(e=> Navigator.view(
            };
            this.handleCreateClick = function (event) { };
            this.handleFindClick = function (event) {
                var result = _this.state.onFind ? _this.state.onFind() : _this.defaultFind();
                result.then(function (entity) {
                    if (!entity)
                        return;
                    _this.convert(entity).then(function (e) {
                        _this.state.ctx.value = e;
                        _this.forceUpdate();
                    });
                });
            };
            this.handleRemoveClick = function (event) {
                (_this.state.onRemove ? _this.state.onRemove(_this.state.ctx.value) : Promise.resolve(true))
                    .then(function (result) {
                    if (!result)
                        return;
                    _this.state.ctx.value = null;
                    _this.forceUpdate();
                });
            };
        }
        EntityBase.prototype.calculateDefaultState = function (state) {
            var type = state.ctx.propertyRoute.member.type;
            state.create = type.isEmbedded ? Navigator.isCreable(type.name, false) :
                type.name == Reflection_1.IsByAll ? false :
                    Reflection_1.getTypeInfos(type).some(function (ti) { return Navigator.isCreable(ti, false); });
            state.view = type.isEmbedded ? Navigator.isViewable(type.name, state.partialViewName) :
                type.name == Reflection_1.IsByAll ? true :
                    Reflection_1.getTypeInfos(type).some(function (ti) { return Navigator.isViewable(ti, state.partialViewName); });
            state.navigate = type.isEmbedded ? Navigator.isNavigable(type.name, state.partialViewName) :
                type.name == Reflection_1.IsByAll ? true :
                    Reflection_1.getTypeInfos(type).some(function (ti) { return Navigator.isNavigable(ti, state.partialViewName); });
            state.find = type.isEmbedded ? false :
                type.name == Reflection_1.IsByAll ? false :
                    Reflection_1.getTypeInfos(type).some(function (ti) { return Navigator.isFindable(ti); });
            state.viewOnCreate = true;
            state.remove = true;
        };
        EntityBase.prototype.getTypeReference = function () {
            return this.state.ctx.propertyRoute.member.type;
        };
        EntityBase.prototype.convert = function (entityOrLite) {
            var tr = this.getTypeReference();
            var isLite = entityOrLite.EntityType != null;
            var entityType = entityOrLite.EntityType || entityOrLite.Type;
            if (tr.isEmbedded) {
                if (entityType != tr.name || isLite)
                    throw new Error("Impossible to convert '" + entityType + "' to '" + tr.name + "'");
                return Promise.resolve(entityOrLite);
            }
            else {
                if (tr.name != Reflection_1.IsByAll && !tr.name.split(',').contains(entityType))
                    throw new Error("Impossible to convert '" + entityType + "' to '" + tr.name + "'");
                if (isLite == tr.isLite)
                    return Promise.resolve(entityOrLite);
                if (isLite)
                    return Navigator.API.fetchEntity(entityOrLite);
                var entity = entityOrLite;
                return Promise.resolve(Signum_Entities_1.toLite(entity, entity.isNew));
            }
        };
        EntityBase.prototype.renderViewButton = function (btn) {
            if (!this.state.view)
                return null;
            return React.createElement("a", {"className": classes("sf-line-button", "sf-view", btn ? "btn btn-default" : null), "onClick": this.handleViewClick, "title": Signum_Entities_1.EntityControlMessage.View.niceToString()}, React.createElement("span", {"className": "glyphicon glyphicon-arrow-right"}));
        };
        EntityBase.prototype.renderCreateButton = function (btn) {
            if (!this.state.create || this.state.ctx.readOnly)
                return null;
            return React.createElement("a", {"className": classes("sf-line-button", "sf-create", btn ? "btn btn-default" : null), "onClick": this.handleCreateClick, "title": Signum_Entities_1.EntityControlMessage.Create.niceToString()}, React.createElement("span", {"className": "glyphicon glyphicon-plus"}));
        };
        EntityBase.prototype.defaultFind = function () {
            return Finder.find({ queryName: this.state.type.name });
        };
        EntityBase.prototype.renderFindButton = function (btn) {
            if (!this.state.find || this.state.ctx.readOnly)
                return null;
            return React.createElement("a", {"className": classes("sf-line-button", "sf-find", btn ? "btn btn-default" : null), "onClick": this.handleFindClick, "title": Signum_Entities_1.EntityControlMessage.Find.niceToString()}, React.createElement("span", {"className": "glyphicon glyphicon-search"}));
        };
        EntityBase.prototype.renderRemoveButton = function (btn) {
            if (!this.state.remove || this.state.ctx.readOnly)
                return null;
            return React.createElement("a", {"className": classes("sf-line-button", "sf-remove", btn ? "btn btn-default" : null), "onClick": this.handleRemoveClick, "title": Signum_Entities_1.EntityControlMessage.Remove.niceToString()}, React.createElement("span", {"className": "glyphicon glyphicon-remove"}));
        };
        return EntityBase;
    })(LineBase_1.LineBase);
    exports.EntityBase = EntityBase;
    var EntityLine = (function (_super) {
        __extends(EntityLine, _super);
        function EntityLine() {
            _super.apply(this, arguments);
        }
        EntityLine.prototype.calculateDefaultState = function (state) {
            _super.prototype.calculateDefaultState.call(this, state);
            state.autoComplete = !state.type.isEmbedded && state.type.name != Reflection_1.IsByAll;
            state.autoCompleteGetItems = function (query) { return Finder.findLiteLike({
                types: state.type.name,
                subString: query,
                count: 5
            }); };
        };
        EntityLine.prototype.renderInternal = function () {
            var s = this.state;
            var hasValue = !!s.ctx.value;
            return React.createElement(LineBase_1.FormGroup, {"ctx": s.ctx, "title": s.labelText}, React.createElement("div", {"className": "SF-entity-line SF-control-container"}, React.createElement("div", {"className": "input-group"}, hasValue ? this.renderLink() : this.renderAutoComplete(), React.createElement("span", {"className": "input-group-btn"}, !hasValue && this.renderCreateButton(true), !hasValue && this.renderFindButton(true), hasValue && this.renderViewButton(true), hasValue && this.renderRemoveButton(true)))));
        };
        EntityLine.prototype.renderAutoComplete = function () {
            var s = this.state;
            if (!s.autoComplete || s.ctx.readOnly)
                return React.createElement(LineBase_1.FormControlStatic, {"ctx": s.ctx});
            return React.createElement(Typeahead_1.default, {"inputAttrs": { className: "form-control sf-entity-autocomplete" }, "getItems": s.autoCompleteGetItems});
        };
        EntityLine.prototype.renderLink = function () {
            var s = this.state;
            if (s.ctx.readOnly)
                return React.createElement(LineBase_1.FormControlStatic, {"ctx": s.ctx}, s.ctx.value.toStr);
            if (s.navigate && s.view) {
                return React.createElement("a", {"href": "#", "onClick": this.handleViewClick, "className": "form-control btn-default sf-entity-line-entity", "title": Signum_Entities_1.JavascriptMessage.navigate.niceToString()}, s.ctx.value.toStr);
            }
            else {
                return React.createElement("span", {"className": "form-control btn-default sf-entity-line-entity"}, s.ctx.value.toStr);
            }
        };
        return EntityLine;
    })(EntityBase);
    exports.EntityLine = EntityLine;
    var EntityListBase = (function (_super) {
        __extends(EntityListBase, _super);
        function EntityListBase() {
            _super.apply(this, arguments);
        }
        return EntityListBase;
    })(LineBase_1.LineBase);
    exports.EntityListBase = EntityListBase;
});
//# sourceMappingURL=EntityControls.js.map