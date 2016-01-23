var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/Navigator', 'Framework/Signum.React/Scripts/Constructor', 'Framework/Signum.React/Scripts/Finder', 'Framework/Signum.React/Scripts/Reflection', 'Framework/Signum.React/Scripts/Signum.Entities', 'Framework/Signum.React/Scripts/Lines/LineBase', 'Templates/SelectorPopup'], function (require, exports, React, Navigator, Constructor, Finder, Reflection_1, Signum_Entities_1, LineBase_1, SelectorPopup_1) {
    var EntityBase = (function (_super) {
        __extends(EntityBase, _super);
        function EntityBase() {
            var _this = this;
            _super.apply(this, arguments);
            this.handleViewClick = function (event) {
                var ctx = _this.state.ctx;
                var entity = _this.getCurrentEntity();
                var onView = _this.state.onView ?
                    _this.state.onView(entity, ctx.propertyRoute) :
                    _this.defaultView(entity);
                onView.then(function (e) {
                    if (e == null)
                        return;
                    _this.convert(e).then(function (m) { return _this.setValue(m); });
                });
            };
            this.handleCreateClick = function (event) {
                var onCreate = _this.props.onCreate ?
                    _this.props.onCreate() : _this.defaultCreate();
                onCreate.then(function (e) {
                    if (e == null)
                        return null;
                    if (!_this.state.viewOnCreate)
                        return Promise.resolve(e);
                    return _this.state.onView ?
                        _this.state.onView(e, _this.state.ctx.propertyRoute) :
                        _this.defaultView(e);
                }).then(function (e) {
                    if (!e)
                        return;
                    _this.convert(e).then(function (m) { return _this.setValue(m); });
                });
            };
            this.handleFindClick = function (event) {
                var result = _this.state.onFind ? _this.state.onFind() : _this.defaultFind();
                result.then(function (entity) {
                    if (!entity)
                        return;
                    _this.convert(entity).then(function (e) { return _this.setValue(e); });
                });
            };
            this.handleRemoveClick = function (event) {
                (_this.state.onRemove ? _this.state.onRemove(_this.getCurrentEntity()) : Promise.resolve(true))
                    .then(function (result) {
                    if (result == false)
                        return;
                    _this.setValue(null);
                });
            };
        }
        EntityBase.prototype.calculateDefaultState = function (state) {
            var type = state.type;
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
        EntityBase.prototype.getCurrentEntity = function () {
            return this.state.ctx.value;
        };
        EntityBase.prototype.convert = function (entityOrLite) {
            var tr = this.state.type;
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
                return Promise.resolve(Signum_Entities_1.toLite(entity, true));
            }
        };
        EntityBase.prototype.defaultView = function (value) {
            return Navigator.view({ entity: value, propertyRoute: this.state.ctx.propertyRoute });
        };
        EntityBase.prototype.renderViewButton = function (btn) {
            if (!this.state.view)
                return null;
            return React.createElement("a", {"className": classes("sf-line-button", "sf-view", btn ? "btn btn-default" : null), "onClick": this.handleViewClick, "title": Signum_Entities_1.EntityControlMessage.View.niceToString()}, React.createElement("span", {"className": "glyphicon glyphicon-arrow-right"}));
        };
        EntityBase.prototype.chooseType = function (predicate) {
            var t = this.state.type;
            if (t.isEmbedded)
                return Promise.resolve(t.name);
            var tis = Reflection_1.getTypeInfos(t).filter(predicate);
            return SelectorPopup_1.default.chooseType(tis)
                .then(function (ti) { return ti ? ti.name : null; });
        };
        EntityBase.prototype.defaultCreate = function () {
            return this.chooseType(Navigator.isCreable)
                .then(function (typeName) { return typeName ? Constructor.construct(typeName) : null; });
        };
        EntityBase.prototype.renderCreateButton = function (btn) {
            if (!this.state.create || this.state.ctx.readOnly)
                return null;
            return React.createElement("a", {"className": classes("sf-line-button", "sf-create", btn ? "btn btn-default" : null), "onClick": this.handleCreateClick, "title": Signum_Entities_1.EntityControlMessage.Create.niceToString()}, React.createElement("span", {"className": "glyphicon glyphicon-plus"}));
        };
        EntityBase.prototype.defaultFind = function () {
            return this.chooseType(Finder.isFindable)
                .then(function (qn) { return qn == null ? null : Finder.find({ queryName: qn }); });
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
});
//# sourceMappingURL=EntityBase.js.map