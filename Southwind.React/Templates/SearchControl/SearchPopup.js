var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'react-bootstrap', 'Framework/Signum.React/Scripts/Modals', 'Framework/Signum.React/Scripts/FindOptions', 'Framework/Signum.React/Scripts/Signum.Entities', 'Framework/Signum.React/Scripts/Reflection', 'Templates/SearchControl/SearchControl'], function (require, exports, React, react_bootstrap_1, Modals_1, FindOptions_1, Signum_Entities_1, Reflection, SearchControl_1) {
    var SearchPopup = (function (_super) {
        __extends(SearchPopup, _super);
        function SearchPopup(props) {
            var _this = this;
            _super.call(this, props);
            this.selectedEntites = [];
            this.handleSelectionChanged = function (selected) {
                _this.selectedEntites = selected;
                _this.forceUpdate();
            };
            this.handleOkClicked = function () {
                _this.okPressed = true;
                _this.setState({ show: false });
            };
            this.handleCancelClicked = function () {
                _this.okPressed = false;
                _this.setState({ show: false });
            };
            this.handleOnExited = function () {
                _this.props.onExited(_this.okPressed ? _this.selectedEntites : null);
            };
            this.state = { show: true };
        }
        SearchPopup.prototype.render = function () {
            var okEnabled = this.props.isMany ? this.selectedEntites.length > 0 : this.selectedEntites.length == 1;
            return React.createElement(react_bootstrap_1.Modal, {"bsSize": "lg", "onHide": this.handleCancelClicked, "show": this.state.show, "onExited": this.handleOnExited}, React.createElement(react_bootstrap_1.Modal.Header, {"closeButton": this.props.findMode == FindOptions_1.FindMode.Explore}, this.props.findMode == FindOptions_1.FindMode.Find &&
                React.createElement("div", {"className": "btn-toolbar", "style": { float: "right" }}, React.createElement("button", {"className": "btn btn-primary sf-entity-button sf-close-button sf-ok-button", "disabled": !okEnabled, "onClick": this.handleOkClicked}, Signum_Entities_1.JavascriptMessage.ok.niceToString()), React.createElement("button", {"className": "btn btn-default sf-entity-button sf-close-button sf-cancel-button", "onClick": this.handleCancelClicked}, Signum_Entities_1.JavascriptMessage.cancel.niceToString())), React.createElement("h4", null, React.createElement("span", {"className": "sf-entity-title"}, " ", this.props.title), React.createElement("a", {"className": "sf-popup-fullscreen", "href": "#"}, React.createElement("span", {"className": "glyphicon glyphicon-new-window"})))), React.createElement(react_bootstrap_1.Modal.Body, null, React.createElement(SearchControl_1.default, {"avoidFullScreenButton": true, "findOptions": this.props.findOptions, "onSelectionChanged": this.handleSelectionChanged})));
        };
        SearchPopup.open = function (findOptions, title) {
            return Modals_1.openModal(React.createElement(SearchPopup, {"findOptions": findOptions, "findMode": FindOptions_1.FindMode.Find, "isMany": false, "title": title || Reflection.getQueryNiceName(findOptions.queryName)}))
                .then(function (a) { return a ? a[0] : null; });
        };
        SearchPopup.openMany = function (findOptions, title) {
            return Modals_1.openModal(React.createElement(SearchPopup, {"findOptions": findOptions, "findMode": FindOptions_1.FindMode.Find, "isMany": true, "title": title || Reflection.getQueryNiceName(findOptions.queryName)}));
        };
        return SearchPopup;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SearchPopup;
});
//# sourceMappingURL=SearchPopup.js.map