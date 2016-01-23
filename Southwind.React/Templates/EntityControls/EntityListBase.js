var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/Signum.Entities', 'Southwind.React/Templates/EntityControls/EntityBase'], function (require, exports, React, Signum_Entities_1, EntityBase_1) {
    var EntityListBase = (function (_super) {
        __extends(EntityListBase, _super);
        function EntityListBase() {
            _super.apply(this, arguments);
        }
        EntityListBase.prototype.moveUp = function (index) {
            var list = this.props.ctx.value;
            var entity = list[index];
            list.removeAt(index);
            list.insertAt(index - 1, entity);
            this.setValue(list);
        };
        EntityListBase.prototype.renderMoveUp = function (btn, index) {
            var _this = this;
            if (!this.state.move || this.state.ctx.readOnly)
                return null;
            return React.createElement("a", {"className": classes("sf-line-button", "sf-move", btn ? "btn btn-default" : null), "onClick": function () { return _this.moveUp(index); }, "title": Signum_Entities_1.EntityControlMessage.MoveUp.niceToString()}, React.createElement("span", {"className": "glyphicon glyphicon-chevron-up"}));
        };
        EntityListBase.prototype.moveDown = function (index) {
            var list = this.props.ctx.value;
            var entity = list[index];
            list.removeAt(index);
            list.insertAt(index + 1, entity);
            this.setValue(list);
        };
        EntityListBase.prototype.renderMoveDown = function (btn, index) {
            var _this = this;
            if (!this.state.move || this.state.ctx.readOnly)
                return null;
            return React.createElement("a", {"className": classes("sf-line-button", "sf-move", btn ? "btn btn-default" : null), "onClick": function () { return _this.moveDown(index); }, "title": Signum_Entities_1.EntityControlMessage.MoveUp.niceToString()}, React.createElement("span", {"className": "glyphicon glyphicon-chevron-down"}));
        };
        return EntityListBase;
    })(EntityBase_1.EntityBase);
    exports.EntityListBase = EntityListBase;
});
//# sourceMappingURL=EntityListBase.js.map