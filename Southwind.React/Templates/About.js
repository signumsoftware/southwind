/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react'], function (require, exports, React) {
    var About = (function (_super) {
        __extends(About, _super);
        function About() {
            _super.apply(this, arguments);
        }
        About.prototype.render = function () {
            return (React.createElement("div", null, "About me"));
        };
        return About;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = About;
});
//# sourceMappingURL=About.js.map