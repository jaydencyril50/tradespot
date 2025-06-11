"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// This model will store admin-auditable activities for the platform
const mongoose_1 = __importDefault(require("mongoose"));
const ActivitySchema = new mongoose_1.default.Schema({
    type: { type: String, required: true },
    user: {
        fullName: String,
        email: String,
        spotid: String,
        _id: mongoose_1.default.Schema.Types.ObjectId,
    },
    details: mongoose_1.default.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
});
const Activity = mongoose_1.default.model('Activity', ActivitySchema);
exports.default = Activity;
