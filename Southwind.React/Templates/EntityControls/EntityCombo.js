var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/Signum.Entities', 'Framework/Signum.React/Scripts/Finder', 'Framework/Signum.React/Scripts/Lines/LineBase', 'Southwind.React/Templates/EntityControls/EntityBase'], function (require, exports, React, Signum_Entities_1, Finder, LineBase_1, EntityBase_1) {
    var EntityCombo = (function (_super) {
        __extends(EntityCombo, _super);
        function EntityCombo() {
            var _this = this;
            _super.apply(this, arguments);
            this.handleOnChange = function (event) {
                var current = event.currentTarget;
                if (current.value != Signum_Entities_1.liteKey(_this.getLite())) {
                    if (!current.value) {
                        _this.setValue(null);
                    }
                    else {
                        var lite = _this.state.data.filter(function (a) { return Signum_Entities_1.liteKey(a) == current.value; }).single();
                        _this.convert(lite).then(function (v) { return _this.setValue(v); });
                    }
                }
            };
        }
        EntityCombo.prototype.calculateDefaultState = function (state) {
            var _this = this;
            state.remove = false;
            state.create = false;
            state.view = false;
            state.find = false;
            if (!state.data) {
                if (this.state && this.state.type.name == state.type.name)
                    state.data = this.state.data;
                if (!state.data) {
                    Finder.API.findAllLites({ types: state.type.name })
                        .then(function (data) { return _this.setState({ data: data }); });
                }
            }
        };
        EntityCombo.prototype.getLite = function () {
            var v = this.state.ctx.value;
            if (v == null)
                return null;
            if (v.Type)
                return Signum_Entities_1.toLite(v);
            return v;
        };
        EntityCombo.prototype.renderInternal = function () {
            var s = this.state;
            var hasValue = !!s.ctx.value;
            var lite = this.getLite();
            var elements = [null].concat(s.data);
            if (lite && !elements.some(function (a) { return Signum_Entities_1.is(a, lite); }))
                elements.insertAt(1, lite);
            return React.createElement(LineBase_1.FormGroup, {"ctx": s.ctx, "title": s.labelText}, React.createElement("div", {"className": "SF-entity-combo"}, React.createElement("div", {"className": "input-group"}, React.createElement("select", {"className": "form-control", "onChange": this.handleOnChange, "value": Signum_Entities_1.liteKey(lite) || ""}, elements.map(function (e, i) { return React.createElement("option", {"key": i, "value": e ? Signum_Entities_1.liteKey(e) : ""}, e ? e.toStr : " - "); })), React.createElement("span", {"className": "input-group-btn"}, !hasValue && this.renderCreateButton(true), !hasValue && this.renderFindButton(true), hasValue && this.renderViewButton(true), hasValue && this.renderRemoveButton(true)))));
        };
        return EntityCombo;
    })(EntityBase_1.EntityBase);
    exports.EntityCombo = EntityCombo;
});
//# sourceMappingURL=EntityCombo.js.map