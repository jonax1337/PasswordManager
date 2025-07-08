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

  // Define character sets
  let uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  let numberChars = '0123456789';
  let symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Apply similar character exclusion
  if (excludeSimilar) {
    uppercaseChars = uppercaseChars.replace(/[LO]/g, '');
    lowercaseChars = lowercaseChars.replace(/[il]/g, '');
    numberChars = numberChars.replace(/[10]/g, '');
  }

  // Build required characters array and full charset
  const requiredChars = [];
  let fullCharset = '';
  
  if (includeUppercase) {
    requiredChars.push(uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length)));
    fullCharset += uppercaseChars;
  }
  if (includeLowercase) {
    requiredChars.push(lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length)));
    fullCharset += lowercaseChars;
  }
  if (includeNumbers) {
    requiredChars.push(numberChars.charAt(Math.floor(Math.random() * numberChars.length)));
    fullCharset += numberChars;
  }
  if (includeSymbols) {
    requiredChars.push(symbolChars.charAt(Math.floor(Math.random() * symbolChars.length)));
    fullCharset += symbolChars;
  }

  if (fullCharset === '') {
    throw new Error('At least one character type must be selected');
  }

  // Ensure we have enough length for required characters
  if (length < requiredChars.length) {
    throw new Error('Password length must be at least as long as the number of character types selected');
  }

  // Fill remaining positions with random characters
  const remainingLength = length - requiredChars.length;
  const randomChars = [];
  for (let i = 0; i < remainingLength; i++) {
    randomChars.push(fullCharset.charAt(Math.floor(Math.random() * fullCharset.length)));
  }

  // Combine required and random characters, then shuffle
  const allChars = [...requiredChars, ...randomChars];
  
  // Fisher-Yates shuffle to randomize the order
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
  }

  return allChars.join('');
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