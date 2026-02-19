"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const port = Number(process.env.PORT ?? 3000);
index_1.default.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Eban FX backend listening on port ${port}`);
});
