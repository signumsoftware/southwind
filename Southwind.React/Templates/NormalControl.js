var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/Navigator', 'Framework/Signum.React/Scripts/TypeContext', 'Framework/Signum.React/Scripts/Signum.Entities', 'Framework/Signum.React/Scripts/Reflection'], function (require, exports, React, Navigator, TypeContext_1, Signum_Entities_1, Reflection_1) {
    var NormalControl = (function (_super) {
        __extends(NormalControl, _super);
        function NormalControl(props) {
            var _this = this;
            _super.call(this, props);
            this.state = { entity: null, entitySettings: Navigator.getSettings(this.props.lite.EntityType) };
            Navigator.API.fetchEntityPack(this.props.lite).then(function (pack) {
                _this.setState({
                    entity: pack.entity,
                    canExecute: pack.canExecute
                });
                var partialViewName = _this.props.partialViewName || _this.state.entitySettings.onPartialView(pack.entity);
                require([partialViewName], function (Com) {
                    var keys = Dic.getKeys(Com);
                    if (keys.length != 1 || keys.indexOf("default") == -1)
                        throw new Error("The view '" + partialViewName + "' should contain just the 'export default'");
                    _this.setState({ component: Com["default"] });
                });
            });
        }
        NormalControl.prototype.render = function () {
            if (!this.state.entity)
                return null;
            var typeInfo = Reflection_1.getTypeInfo(this.state.entity.Type);
            var styleOptions = {
                readOnly: this.state.entitySettings.onIsReadonly()
            };
            var ctx = new TypeContext_1.TypeContext(null, styleOptions, Reflection_1.PropertyRoute.root(typeInfo), this.state.entity);
            return (React.createElement("div", {"className": "normal-control"}, this.renderTitle(typeInfo), Navigator.renderWidgets({ entity: this.state.entity }), React.createElement("div", {"className": "sf-button-bar"}, Navigator.renderButtons({ entity: this.state.entity, canExecute: this.state.canExecute })), this.renderValidationErrors(), Navigator.renderEmbeddedWidgets({ entity: this.state.entity }, Navigator.EmbeddedWidgetPosition.Top), React.createElement("div", {"id": "divMainControl", "className": "sf-main-control", "data-test-ticks": new Date().valueOf()}, this.state.component && React.createElement(this.state.component, { ctx: ctx })), Navigator.renderEmbeddedWidgets({ entity: this.state.entity }, Navigator.EmbeddedWidgetPosition.Bottom)));
        };
        NormalControl.prototype.renderTitle = function (typeInfo) {
            var title = this.props.title || this.state.entity.toStr;
            var typeTitle = this.state.entity.isNew ?
                Signum_Entities_1.LiteMessage.New_G.niceToString().forGenderAndNumber(typeInfo.gender).formatWith(typeInfo.niceName) :
                typeInfo.niceName + " " + this.state.entity.id;
            return React.createElement("h3", null, React.createElement("span", {"className": "sf-entity-title"}, title), React.createElement("br", null), React.createElement("small", {"className": "sf-type-nice-name"}, typeTitle));
        };
        NormalControl.prototype.renderValidationErrors = function () {
            if (!this.state.validationErrors || Dic.getKeys(this.state.validationErrors).length == 0)
                return null;
            return React.createElement("ul", {"className": "validaton-summary alert alert-danger"}, Dic.getValues(this.state.validationErrors).map(function (error) { return React.createElement("li", null, error); }));
        };
        NormalControl.defaultProps = {
            showOperations: true,
        };
        return NormalControl;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = NormalControl;
});
//# sourceMappingURL=NormalControl.js.map