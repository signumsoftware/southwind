var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/Reflection', 'Templates/NormalControl'], function (require, exports, React, Reflection, NormalControl_1) {
    var NormalPage = (function (_super) {
        __extends(NormalPage, _super);
        function NormalPage(props) {
            _super.call(this, props);
            this.state = {};
        }
        NormalPage.prototype.render = function () {
            var type = Reflection.getTypeInfo(this.props.routeParams.type);
            var id = type.members["Id"].type == "number" && this.props.routeParams.id != "" ? parseInt(this.props.routeParams.id) : this.props.routeParams.id;
            var lite = {
                EntityType: type.name,
                id: id,
            };
            return (React.createElement("div", {"id": "divMainPage", "data-isnew": this.props.routeParams.id == null, "className": "form-horizontal"}, React.createElement(NormalControl_1.default, {"lite": lite})));
        };
        return NormalPage;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = NormalPage;
});
//# sourceMappingURL=NormalPage.js.map