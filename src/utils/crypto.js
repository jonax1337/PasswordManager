import CryptoJS from 'crypto-js';

export const encryptData = (data, password) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, password).toString();
    console.log('Encryption successful, data length:', data.length, 'encrypted length:', encrypted.length);
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

export const decryptData = (encryptedData, password) => {
  try {
    console.log('Attempting to decrypt data, encrypted length:', encryptedData.length);
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    console.log('Decryption result length:', decrypted.length);
    
    if (!decrypted || decrypted.length === 0) {
      throw new Error('Failed to decrypt data - empty result');
    }
    
    // Verify it's valid JSON
    try {
      JSON.parse(decrypted);
    } catch (jsonError) {
      console.error('Decrypted data is not valid JSON:', decrypted.substring(0, 100));
      throw new Error('Decrypted data is not valid JSON');
    }
    
    console.log('Successfully decrypted and validated JSON');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

export const generatePassword = (options = {}) => {
  const {
    length = 12,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = false,
    excludeSimilar = false
  } = options;

  let charset = '';
  
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeNumbers) charset += '0123456789';
  if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (excludeSimilar) {
    charset = charset.replace(/[il1Lo0O]/g, '');
  }

  if (charset === '') {
    throw new Error('At least one character type must be selected');
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
};

export const checkPasswordStrength = (password) => {
  let score = 0;
  let feedback = [];

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  if (score <= 2) return { strength: 'weak', score, feedback };
  if (score <= 4) return { strength: 'medium', score, feedback };
  return { strength: 'strong', score, feedback };
};