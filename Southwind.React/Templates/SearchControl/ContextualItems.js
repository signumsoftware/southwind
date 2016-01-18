var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react', 'react-bootstrap'], function (require, exports, React, react_bootstrap_1) {
    exports.onContextualItems = [];
    function getContextualItems(ctx) {
        var blockPromises = exports.onContextualItems.map(function (func) { return func(ctx); });
        return Promise.all(blockPromises).then(function (blocks) {
            var result = [];
            blocks.forEach(function (block) {
                if (block == null || block.menuItems == null || block.menuItems.length == 0)
                    return;
                if (result.length)
                    result.push(React.createElement(react_bootstrap_1.MenuItem, {"divider": true}));
                if (block.header)
                    result.push(React.createElement(react_bootstrap_1.MenuItem, {"header": true}, block.header));
                if (block.header)
                    result.splice.apply(result, [result.length, 0].concat(block.menuItems));
            });
            return result;
        });
    }
    exports.getContextualItems = getContextualItems;
    var ContextMenu = (function (_super) {
        __extends(ContextMenu, _super);
        function ContextMenu() {
            _super.apply(this, arguments);
        }
        ContextMenu.prototype.render = function () {
            var position = this.props.position;
            var props = Dic.without(this.props, { position: position, ref: null });
            var style = { left: position.pageX + "px", top: position.pageY + "px", zIndex: 9999, display: "block", position: "absolute" };
            var ul = React.createElement("ul", React.__spread({}, props, {"className": classes(props.className, "dropdown-menu sf-context-menu"), "style": style}), this.props.children);
            return ul;
            return React.createElement(react_bootstrap_1.Overlay, {"show": this.props.position != null, "rootClose": true, "onHide": this.props.onHide}, "result ");
        };
        return ContextMenu;
    })(React.Component);
    exports.ContextMenu = ContextMenu;
});
//# sourceMappingURL=ContextualItems.js.map