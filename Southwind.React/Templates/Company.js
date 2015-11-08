/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react'], function (require, exports, React) {
    var Company = (function (_super) {
        __extends(Company, _super);
        function Company() {
            _super.apply(this, arguments);
        }
        Company.prototype.render = function () {
            return (React.createElement("div", null, "Company ", this.props.params.id));
        };
        return Company;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Company;
});
//# sourceMappingURL=Company.js.map