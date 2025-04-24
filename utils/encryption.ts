import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

// Get encryption key from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-this';

// Function to encrypt data
export const encryptData = (data: any): string => {
  try {
    // Convert data to string if it's not already
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Encrypt the data
    const encrypted = CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Function to decrypt data
export const decryptData = (encryptedData: string): any => {
  try {
    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
    
    // Parse if it's JSON
    try {
      return JSON.parse(decrypted);
    } catch {
      // If not valid JSON, return as is
      return decrypted;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};