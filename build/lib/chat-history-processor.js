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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "readline", "../helpers/parse", "./openai-stream", "fs/promises"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fs_1 = require("fs");
    const readline_1 = __importDefault(require("readline"));
    const parse_1 = require("../helpers/parse");
    const openai_stream_1 = __importDefault(require("./openai-stream"));
    const promises_1 = require("fs/promises");
    const TOKEN_LIMIT = 2048; // Set the token limit
    const CHUNK_SIZE = TOKEN_LIMIT / 2; // Set the chunk size to avoid exceeding the token limit
    class ChatHistoryProcessor {
        constructor(filepath) {
            this.filepath = filepath;
        }
        process() {
            var _a, e_1, _b, _c;
            return __awaiter(this, void 0, void 0, function* () {
                const chatHistoryStream = (0, fs_1.createReadStream)(this.filepath, { encoding: 'utf-8' });
                const rl = readline_1.default.createInterface({
                    input: chatHistoryStream,
                    output: process.stdout,
                    terminal: false,
                });
                let buffer = '';
                try {
                    for (var _d = true, rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), _a = rl_1_1.done, !_a;) {
                        _c = rl_1_1.value;
                        _d = false;
                        try {
                            const line = _c;
                            buffer += '\n' + line;
                            while (buffer.length > CHUNK_SIZE) {
                                const chunk = buffer.slice(0, CHUNK_SIZE);
                                buffer = buffer.slice(CHUNK_SIZE);
                                yield this.processChunk(chunk);
                            }
                        }
                        finally {
                            _d = true;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = rl_1.return)) yield _b.call(rl_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (buffer.length > 0) {
                    yield this.processChunk(buffer);
                }
            });
        }
        processChunk(chunk) {
            return __awaiter(this, void 0, void 0, function* () {
                // Preprocess the chunk if necessary
                const preprocessedChunk = yield this.preprocessChunk(chunk);
                // starts with the assistant prefix
                yield this.appendFile(`\nassistant: `);
                // Process the preprocessed chunk using the OpenAI API
                let processedChunk = "";
                // This data is a ReadableStream
                const data = yield (0, openai_stream_1.default)(preprocessedChunk);
                if (!data) {
                    console.log("No data from response.", data);
                    throw new Error("No data from response.");
                }
                const reader = data.getReader();
                const decoder = new TextDecoder();
                let done = false;
                while (!done) {
                    const { value, done: doneReading } = yield reader.read();
                    done = doneReading;
                    const chunkValue = decoder.decode(value);
                    processedChunk += chunkValue;
                    yield this.appendFile(chunkValue);
                }
                // Postprocess the processed chunk if necessary
                const postprocessedChunk = yield this.postprocessChunk(processedChunk);
                // Closes the results, e.g., output to console or save to a file or close opened file/process
                yield this.handleResults(postprocessedChunk);
            });
        }
        preprocessChunk(chunk) {
            return __awaiter(this, void 0, void 0, function* () {
                // Implement any necessary preprocessing, e.g., removing stop words, punctuations, etc.
                return (0, parse_1.parse)(chunk);
            });
        }
        postprocessChunk(chunk) {
            return __awaiter(this, void 0, void 0, function* () {
                // Implement any necessary postprocessing, e.g., reassembling text, etc.
                return chunk;
            });
        }
        handleResults(results) {
            return __awaiter(this, void 0, void 0, function* () {
                // ends with the user postfix
                yield this.appendFile(`\n\nuser: `);
                // do something with the results string
            });
        }
        appendFile(chunk) {
            return __awaiter(this, void 0, void 0, function* () {
                // append the results to the file
                yield (0, promises_1.appendFile)(this.filepath, chunk, { encoding: 'utf8' });
            });
        }
    }
    exports.default = ChatHistoryProcessor;
});
