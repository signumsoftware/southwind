var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'Framework/Signum.React/Scripts/FindOptions', 'Framework/Signum.React/Scripts/Signum.Entities', 'Framework/Signum.React/Scripts/Reflection'], function (require, exports, React, FindOptions_1, Signum_Entities_1, Reflection_1) {
    var MultipliedMessage = (function (_super) {
        __extends(MultipliedMessage, _super);
        function MultipliedMessage() {
            _super.apply(this, arguments);
        }
        MultipliedMessage.prototype.render = function () {
            var fo = this.props.findOptions;
            var tokensObj = fo.columnOptions.map(function (a) { return a.token; })
                .concat(fo.filterOptions.filter(function (a) { return a.operation != null; }).map(function (a) { return a.token; }))
                .concat(fo.orderOptions.map(function (a) { return a.token; }))
                .filter(function (a) { return a != null; })
                .flatMap(function (a) { return FindOptions_1.getTokenParents(a); })
                .filter(function (a) { return a.queryTokenType == FindOptions_1.QueryTokenType.Element; })
                .toObjectDistinct(function (a) { return a.fullKey; });
            var tokens = Dic.getValues(tokensObj);
            if (tokens.length == 0)
                return null;
            var message = Signum_Entities_1.ValidationMessage.TheNumberOf0IsBeingMultipliedBy1.niceToString().formatWith(Reflection_1.getTypeInfos(this.props.mainType).map(function (a) { return a.nicePluralName; }).joinComma(Signum_Entities_1.External.CollectionMessage.And.niceToString()), tokens.map(function (a) { return a.parent.niceName; }).joinComma(Signum_Entities_1.External.CollectionMessage.And.niceToString()));
            return React.createElement("div", {"className": "sf-td-multiply alert alert-warning"}, React.createElement("span", {"className": "glyphicon glyphicon-exclamation-sign"}), "\u00A0" + message);
        };
        return MultipliedMessage;
    })(React.Component);
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = MultipliedMessage;
});
//# sourceMappingURL=MultipliedMessage.js.map