"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logFilePath = path_1.default.join(__dirname, '../admin_audit.log');
function auditLogger(req, res, next) {
    const user = req.admin || req.user || {};
    const logEntry = {
        time: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        adminEmail: user.email || user.userEmail || 'unknown',
        ip: req.ip,
        body: req.body,
        query: req.query,
        params: req.params
    };
    fs_1.default.appendFile(logFilePath, JSON.stringify(logEntry) + '\n', err => {
        if (err) {
            console.error('Failed to write audit log:', err);
        }
    });
    next();
}
exports.default = auditLogger;
