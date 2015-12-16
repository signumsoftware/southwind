var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/Finder', 'Framework/Signum.React/Scripts/Reflection', 'Templates/SearchControl/SearchControl'], function (require, exports, React, Finder, Reflection, SearchControl_1) {
    var SearchPage = (function (_super) {
        __extends(SearchPage, _super);
        function SearchPage(props) {
            _super.call(this, props);
            this.state = { findOptions: Finder.parseFindOptionsPath(this.props.routeParams.queryName, this.props.location.query) };
        }
        SearchPage.prototype.render = function () {
            var fo = this.state.findOptions;
            return (React.createElement("div", {"id": "divSearchPage"}, React.createElement("h2", null, React.createElement("span", {"className": "sf-entity-title"}, Reflection.queryNiceName(fo.queryName)), " ", React.createElement("a", {"className": "sf-popup-fullscreen", "href": "#"}, React.createElement("span", {"className": "glyphicon glyphicon-new-window"}))), React.createElement(SearchControl_1.default, {"avoidFullScreenButton": true, "findOptions": fo})));
        };
        return SearchPage;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SearchPage;
});
//# sourceMappingURL=SearchPage.js.map