var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/Lines/LineBase', 'Southwind.React/Templates/EntityControls/EntityListBase'], function (require, exports, React, LineBase_1, EntityListBase_1) {
    var EntityList = (function (_super) {
        __extends(EntityList, _super);
        function EntityList() {
            _super.apply(this, arguments);
        }
        EntityList.prototype.moveUp = function (index) {
            _super.prototype.moveUp.call(this, index);
            this.setState({ selectedIndex: this.state.selectedIndex - 1 });
        };
        EntityList.prototype.moveDown = function (index) {
            _super.prototype.moveDown.call(this, index);
            this.setState({ selectedIndex: this.state.selectedIndex + 1 });
        };
        EntityList.prototype.renderInternal = function () {
            var _this = this;
            var s = this.state;
            var list = this.state.ctx.value;
            var hasSelected = s.selectedIndex != null;
            return React.createElement(LineBase_1.FormGroup, {"ctx": s.ctx, "title": s.labelText}, React.createElement("div", {"className": "SF-entity-line"}, React.createElement("div", {"className": "input-group"}, React.createElement("select", {"className": "form-control", "size": 6}, s.ctx.value.map(function (e, i) { return React.createElement("option", {"key": i, "title": _this.getTitle(e.element)}, e.element.toStr); })), React.createElement("span", {"className": "input-group-btn btn-group-vertical"}, this.renderCreateButton(true), this.renderFindButton(true), hasSelected && this.renderViewButton(true), hasSelected && this.renderRemoveButton(true), hasSelected && this.state.move && s.selectedIndex > 0 && this.renderMoveUp(true, s.selectedIndex), hasSelected && this.state.move && s.selectedIndex < list.length - 1 && this.renderMoveDown(true, s.selectedIndex)))));
        };
        EntityList.prototype.getTitle = function (e) {
            var pr = this.props.ctx.propertyRoute;
            var type = pr && pr.member && pr.member.typeNiceName || e.EntityType || e.Type;
            var id = e.id || e.id;
            return type + (id ? " " + id : "");
        };
        return EntityList;
    })(EntityListBase_1.EntityListBase);
    exports.EntityList = EntityList;
});
//# sourceMappingURL=EntityList.js.map