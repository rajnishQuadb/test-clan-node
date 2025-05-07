"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptData = exports.encryptData = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Get encryption key from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-this';
// Function to encrypt data
const encryptData = (data) => {
    try {
        // Convert data to string if it's not already
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        // Encrypt the data
        const encrypted = crypto_js_1.default.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
        return encrypted;
    }
    catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};
exports.encryptData = encryptData;
// Function to decrypt data
const decryptData = (encryptedData) => {
    try {
        // Decrypt the data
        const decrypted = crypto_js_1.default.AES.decrypt(encryptedData, ENCRYPTION_KEY).toString(crypto_js_1.default.enc.Utf8);
        // Parse if it's JSON
        try {
            return JSON.parse(decrypted);
        }
        catch {
            // If not valid JSON, return as is
            return decrypted;
        }
    }
    catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};
exports.decryptData = decryptData;
//# sourceMappingURL=encryption.js.map