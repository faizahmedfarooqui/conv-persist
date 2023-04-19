(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = void 0;
    const parse = (history) => {
        const lines = history.split('\n');
        const conversation = [];
        let currentRole = null;
        let currentContent = '';
        lines.forEach((line, index) => {
            let roleAndContent = line.split(': ');
            if (roleAndContent.length === 2) {
                const role = roleAndContent[0].toLowerCase();
                if (['system', 'assistant', 'user'].includes(role)) {
                    if (currentRole) {
                        conversation.push({ role: currentRole, content: currentContent.trim() });
                        currentContent = '';
                    }
                    currentRole = role;
                }
            }
            if (currentRole) {
                currentContent += `${line}\n`;
            }
            if (index === lines.length - 1 && currentRole) {
                conversation.push({ role: currentRole, content: currentContent.trim() });
            }
        });
        return conversation;
    };
    exports.parse = parse;
});
