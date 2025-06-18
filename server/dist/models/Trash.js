"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TrashSchema = new mongoose_1.default.Schema({
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const Trash = mongoose_1.default.model('Trash', TrashSchema);
exports.default = Trash;
