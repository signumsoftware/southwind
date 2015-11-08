/// <reference path="../../framework/signum.react/typings/react/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react'], function (require, exports, React) {
    var Person = (function (_super) {
        __extends(Person, _super);
        function Person() {
            _super.apply(this, arguments);
        }
        Person.prototype.render = function () {
            return (React.createElement("div", null, "Person ", this.props.params.id, " "));
        };
        return Person;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Person;
});
//# sourceMappingURL=Person.js.map