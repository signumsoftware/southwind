var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/Navigator', 'Framework/Signum.React/Scripts/TypeContext', 'Framework/Signum.React/Scripts/Reflection'], function (require, exports, React, Navigator, TypeContext_1, Reflection_1) {
    var NormalPage = (function (_super) {
        __extends(NormalPage, _super);
        function NormalPage(props) {
            var _this = this;
            _super.call(this, props);
            this.state = this.calculateState(props);
            this.loadEntity(props)
                .then(function () { return _this.loadComponent(); });
        }
        NormalPage.prototype.componentWillReceiveProps = function (props) {
            var _this = this;
            this.setState(this.calculateState(props));
            this.loadEntity(props)
                .then(function () { return _this.loadComponent(); });
        };
        NormalPage.prototype.calculateState = function (props) {
            var typeInfo = Reflection_1.getTypeInfo(props.routeParams.type);
            var entitySettings = Navigator.getSettings(typeInfo.name);
            return { entitySettings: entitySettings, typeInfo: typeInfo, entity: null };
        };
        NormalPage.prototype.loadEntity = function (props) {
            var _this = this;
            var ti = this.state.typeInfo;
            var id = ti.members["Id"].type == "number" &&
                this.props.routeParams.id != "" ? parseInt(props.routeParams.id) : props.routeParams.id;
            var lite = {
                EntityType: ti.name,
                id: id,
            };
            return Navigator.API.fetchEntityPack(lite)
                .then(function (pack) { return _this.setState({ entity: pack.entity, canExecute: pack.canExecute }); });
        };
        NormalPage.prototype.loadComponent = function () {
            var _this = this;
            var partialViewName = this.props.partialViewName || this.state.entitySettings.onPartialView(this.state.entity);
            return Navigator.requireComponent(partialViewName).then(function (c) {
                return _this.setState({ component: c });
            });
        };
        NormalPage.prototype.render = function () {
            return (React.createElement("div", {"id": "divMainPage", "data-isnew": this.props.routeParams.id == null, "className": "form-horizontal"}, this.renderEntityControl()));
        };
        NormalPage.prototype.renderEntityControl = function () {
            if (!this.state.entity)
                return null;
            var styleOptions = {
                readOnly: this.state.entitySettings.onIsReadonly()
            };
            var ctx = new TypeContext_1.TypeContext(null, styleOptions, Reflection_1.PropertyRoute.root(this.state.typeInfo), new Reflection_1.ReadonlyBinding(this.state.entity));
            return (React.createElement("div", {"className": "normal-control"}, this.renderTitle(this.state.typeInfo), Navigator.renderWidgets({ entity: this.state.entity }), React.createElement("div", {"className": "btn-toolbar sf-button-bar"}, Navigator.renderButtons({ entity: this.state.entity, canExecute: this.state.canExecute })), this.renderValidationErrors(), Navigator.renderEmbeddedWidgets({ entity: this.state.entity }, Navigator.EmbeddedWidgetPosition.Top), React.createElement("div", {"id": "divMainControl", "className": "sf-main-control", "data-test-ticks": new Date().valueOf()}, this.state.component && React.createElement(this.state.component, { ctx: ctx })), Navigator.renderEmbeddedWidgets({ entity: this.state.entity }, Navigator.EmbeddedWidgetPosition.Bottom)));
        };
        NormalPage.prototype.renderTitle = function (typeInfo) {
            return React.createElement("h3", null, React.createElement("span", {"className": "sf-entity-title"}, this.props.title || this.state.entity.toStr), React.createElement("br", null), React.createElement("small", {"className": "sf-type-nice-name"}, Navigator.getTypeTitel(this.state.entity)));
        };
        NormalPage.prototype.renderValidationErrors = function () {
            if (!this.state.validationErrors || Dic.getKeys(this.state.validationErrors).length == 0)
                return null;
            return React.createElement("ul", {"className": "validaton-summary alert alert-danger"}, Dic.getValues(this.state.validationErrors).map(function (error) { return React.createElement("li", null, error); }));
        };
        NormalPage.defaultProps = {
            showOperations: true,
            partialViewName: null,
        };
        return NormalPage;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = NormalPage;
});
//# sourceMappingURL=NormalPage.js.map