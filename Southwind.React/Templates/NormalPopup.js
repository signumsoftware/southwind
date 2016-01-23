var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'react-bootstrap', 'Framework/Signum.React/Scripts/Modals', 'Framework/Signum.React/Scripts/Navigator', 'Framework/Signum.React/Scripts/TypeContext', 'Framework/Signum.React/Scripts/Signum.Entities', 'Framework/Signum.React/Scripts/Reflection'], function (require, exports, React, react_bootstrap_1, Modals_1, Navigator, TypeContext_1, Signum_Entities_1, Reflection_1) {
    var NormalPopup = (function (_super) {
        __extends(NormalPopup, _super);
        function NormalPopup(props) {
            var _this = this;
            _super.call(this, props);
            this.handleOkClicked = function (val) {
                _this.okClicked = true;
                _this.setState({ show: false });
            };
            this.handleCancelClicked = function () {
                _this.setState({ show: false });
            };
            this.handleOnExited = function () {
                _this.props.onExited(_this.okClicked ? _this.state.entity : null);
            };
            this.state = this.calculateState(props);
            this.loadEntity(props)
                .then(function () { return _this.loadComponent(); });
        }
        NormalPopup.prototype.componentWillReceiveProps = function (props) {
            var _this = this;
            this.setState(this.calculateState(props));
            this.loadEntity(props)
                .then(function () { return _this.loadComponent(); });
        };
        NormalPopup.prototype.calculateState = function (props) {
            var typeName = this.props.entity.EntityType || this.props.entity.Type;
            var typeInfo = Reflection_1.getTypeInfo(typeName);
            var entitySettings = Navigator.getSettings(typeInfo.name);
            return { entitySettings: entitySettings, typeInfo: typeInfo, entity: null, show: true };
        };
        NormalPopup.prototype.loadEntity = function (props) {
            var _this = this;
            var ti = this.state.typeInfo;
            var entity = this.props.entity.Type ? this.props.entity : null;
            if (entity != null && !this.props.showOperations) {
                this.setState({ entity: entity });
                return Promise.resolve(null);
            }
            else {
                return Navigator.API.fetchEntityPack(entity ? Signum_Entities_1.toLite(entity) : this.props.entity)
                    .then(function (pack) { return _this.setState({ entity: entity || pack.entity, canExecute: pack.canExecute }); });
            }
        };
        NormalPopup.prototype.loadComponent = function () {
            var _this = this;
            var partialViewName = this.props.partialViewName || this.state.entitySettings.onPartialView(this.state.entity);
            return Navigator.requireComponent(partialViewName)
                .then(function (c) { return _this.setState({ component: c }); });
        };
        NormalPopup.prototype.render = function () {
            var styleOptions = {
                readOnly: this.props.readOnly != null ? this.props.readOnly : this.state.entitySettings.onIsReadonly()
            };
            var ctx = new TypeContext_1.TypeContext(null, styleOptions, this.props.propertyRoute || Reflection_1.PropertyRoute.root(this.state.typeInfo), new Reflection_1.ReadonlyBinding(this.state.entity));
            return React.createElement(react_bootstrap_1.Modal, {"bsSize": "lg", "onHide": this.handleCancelClicked, "show": this.state.show, "onExited": this.handleOnExited, "className": "sf-popup-control"}, React.createElement(react_bootstrap_1.Modal.Header, {"closeButton": this.props.isNavigate}, !this.props.isNavigate && React.createElement(react_bootstrap_1.ButtonToolbar, {"style": { float: "right" }}, React.createElement(react_bootstrap_1.Button, {"className": "sf-entity-button sf-close-button sf-ok-button", "bsStyle": "primary"}, Signum_Entities_1.JavascriptMessage.ok.niceToString()), React.createElement(react_bootstrap_1.Button, {"className": "sf-entity-button sf-close-button sf-cancel-button", "bsStyle": "default"}, Signum_Entities_1.JavascriptMessage.cancel.niceToString())), this.renderTitle()), React.createElement(react_bootstrap_1.Modal.Body, null, Navigator.renderWidgets({ entity: this.state.entity }), React.createElement("div", {"className": "btn-toolbar sf-button-bar"}, Navigator.renderButtons({ entity: this.state.entity, canExecute: this.state.canExecute })), React.createElement("div", {"className": "sf-main-control form-horizontal", "data-test-ticks": new Date().valueOf()}, this.state.component && React.createElement(this.state.component, { ctx: ctx }))));
        };
        NormalPopup.prototype.renderTitle = function () {
            var pr = this.props.propertyRoute;
            return React.createElement("h4", null, React.createElement("span", {"className": "sf-entity-title"}, this.props.title || (this.state.entity && this.state.entity.toStr)), this.renderExpandLink(), React.createElement("br", null), React.createElement("small", null, " ", pr && pr.member && pr.member.typeNiceName || Navigator.getTypeTitel(this.state.entity)));
        };
        NormalPopup.prototype.renderExpandLink = function () {
            var entity = this.state.entity;
            if (entity == null)
                return null;
            var ti = Reflection_1.getTypeInfo(entity.Type);
            if (ti == null || !Navigator.isNavigable(ti, null))
                return null;
            return React.createElement("a", {"href": Navigator.navigateRoute(entity), "className": "sf-popup-fullscreen"}, React.createElement("span", {"className": "glyphicon glyphicon-new-window"}));
        };
        NormalPopup.open = function (options) {
            return Modals_1.openModal(React.createElement(NormalPopup, {"entity": options.entity, "readOnly": options.readOnly, "propertyRoute": options.propertyRoute, "partialViewName": options.partialViewName, "showOperations": options.showOperations, "saveProtected": options.saveProtected}));
        };
        NormalPopup.defaultProps = {
            showOperations: true,
            partialViewName: null,
        };
        return NormalPopup;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = NormalPopup;
});
//# sourceMappingURL=NormalPopup.js.map