'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.__PlaygroundIcon = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Icon = require('./Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _md = require('./md/');

var icons = _interopRequireWildcard(_md);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __PlaygroundIcon = exports.__PlaygroundIcon = function __PlaygroundIcon() {

    return _react2.default.createElement(
        'div',
        { style: { color: 'green', margin: 2, padding: 4 } },
        Object.keys(icons).map(function (key) {
            return _react2.default.createElement(_Icon2.default, { icon: icons[key], size: 42 });
        })
    );
};