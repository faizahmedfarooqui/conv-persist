var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "eventsource-parser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const eventsource_parser_1 = require("eventsource-parser");
    function default_1(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            let counter = 0;
            const res = yield fetch("https://api.openai.com/v1/chat/completions", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                method: "POST",
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: messages,
                    n: 1,
                    temperature: 0,
                    stream: true
                })
            });
            const stream = new ReadableStream({
                start(controller) {
                    var _a, e_1, _b, _c;
                    return __awaiter(this, void 0, void 0, function* () {
                        // callback
                        function onParse(event) {
                            var _a;
                            if (event.type === "event") {
                                const data = event.data;
                                // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
                                if (data === "[DONE]") {
                                    controller.close();
                                    return;
                                }
                                try {
                                    const json = JSON.parse(data);
                                    const text = ((_a = json.choices[0].delta) === null || _a === void 0 ? void 0 : _a.content) || "";
                                    if (counter < 2 && (text.match(/\n/) || []).length) {
                                        // this is a prefix character (i.e., "\n\n"), do nothing
                                        return;
                                    }
                                    const queue = encoder.encode(text);
                                    controller.enqueue(queue);
                                    counter++;
                                }
                                catch (e) {
                                    // maybe parse error
                                    controller.error(e);
                                }
                            }
                        }
                        // stream response (SSE) from OpenAI may be fragmented into multiple chunks
                        // this ensures we properly read chunks and invoke an event for each SSE event stream
                        const parser = (0, eventsource_parser_1.createParser)(onParse);
                        try {
                            // https://web.dev/streams/#asynchronous-iteration
                            for (var _d = true, _e = __asyncValues(res.body), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                                _c = _f.value;
                                _d = false;
                                try {
                                    const chunk = _c;
                                    parser.feed(decoder.decode(chunk));
                                }
                                finally {
                                    _d = true;
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    });
                },
            });
            return stream;
        });
    }
    exports.default = default_1;
});
