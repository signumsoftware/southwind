var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/Finder', 'Framework/Signum.React/Scripts/Reflection', 'Framework/Signum.React/Scripts/Lines/LineBase', 'Framework/Signum.React/Scripts/Signum.Entities', 'Framework/Signum.React/Scripts/Lines/Typeahead', 'Southwind.React/Templates/EntityControls/EntityBase'], function (require, exports, React, Finder, Reflection_1, LineBase_1, Signum_Entities_1, Typeahead_1, EntityBase_1) {
    var EntityLine = (function (_super) {
        __extends(EntityLine, _super);
        function EntityLine() {
            var _this = this;
            _super.apply(this, arguments);
            this.handleOnSelect = function (lite, event) {
                _this.convert(lite)
                    .then(function (entity) { return _this.setValue(entity); });
                return lite.toStr;
            };
            this.renderItem = function (item, query) {
                return;
            };
        }
        EntityLine.prototype.calculateDefaultState = function (state) {
            _super.prototype.calculateDefaultState.call(this, state);
            state.autoComplete = !state.type.isEmbedded && state.type.name != Reflection_1.IsByAll;
            state.autoCompleteGetItems = function (query) { return Finder.API.findLiteLike({
                types: state.type.name,
                subString: query,
                count: 5
            }); };
            state.autoCompleteRenderItem = function (lite, query) { return Typeahead_1.default.highlightedText(lite.toStr, query); };
        };
        EntityLine.prototype.renderInternal = function () {
            var s = this.state;
            var hasValue = !!s.ctx.value;
            return React.createElement(LineBase_1.FormGroup, {"ctx": s.ctx, "title": s.labelText}, React.createElement("div", {"className": "SF-entity-line"}, React.createElement("div", {"className": "input-group"}, hasValue ? this.renderLink() : this.renderAutoComplete(), React.createElement("span", {"className": "input-group-btn"}, !hasValue && this.renderCreateButton(true), !hasValue && this.renderFindButton(true), hasValue && this.renderViewButton(true), hasValue && this.renderRemoveButton(true)))));
        };
        EntityLine.prototype.renderAutoComplete = function () {
            var s = this.state;
            if (!s.autoComplete || s.ctx.readOnly)
                return React.createElement(LineBase_1.FormControlStatic, {"ctx": s.ctx});
            return React.createElement(Typeahead_1.default, {"inputAttrs": { className: "form-control sf-entity-autocomplete" }, "getItems": s.autoCompleteGetItems, "renderItem": s.autoCompleteRenderItem, "onSelect": this.handleOnSelect});
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
    })(EntityBase_1.EntityBase);
    exports.EntityLine = EntityLine;
});
//# sourceMappingURL=EntityLine.js.map