import CryptoJS from 'crypto-js';

// Enhanced encryption with PBKDF2 and salt
export const encryptData = (data, password, useLegacy = false) => {
  // Use PBKDF2 encryption by default for new databases
  // Legacy encryption only for existing databases that were loaded as legacy
  if (useLegacy) {
    return encryptDataLegacy(data, password);
  }
  
  try {
    // Generate random salt
    const salt = CryptoJS.lib.WordArray.random(256/8);
    
    // Derive key using PBKDF2 with 100,000 iterations
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 100000,
      hasher: CryptoJS.algo.SHA256
    });
    
    // Generate random IV
    const iv = CryptoJS.lib.WordArray.random(128/8);
    
    // Encrypt data with explicit IV
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Combine salt, IV and encrypted data
    const combined = {
      salt: salt.toString(CryptoJS.enc.Hex),
      iv: iv.toString(CryptoJS.enc.Hex),
      encrypted: encrypted.toString(),
      version: 2 // Version for future compatibility
    };
    
    return JSON.stringify(combined);
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

export const decryptData = (encryptedData, password) => {
  try {
    // Parse encrypted data
    let parsedData;
    let isLegacy = false;
    
    try {
      parsedData = JSON.parse(encryptedData);
    } catch (parseError) {
      // Try legacy decryption for backward compatibility
      isLegacy = true;
      const result = decryptDataLegacy(encryptedData, password);
      return { data: result, isLegacy: true };
    }
    
    // Check if it's new format with version
    if (parsedData.version === 2 && parsedData.salt && parsedData.encrypted) {
      // New format with PBKDF2
      const salt = CryptoJS.enc.Hex.parse(parsedData.salt);
      const iv = parsedData.iv ? CryptoJS.enc.Hex.parse(parsedData.iv) : null;
      
      // Derive key using PBKDF2
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 100000,
        hasher: CryptoJS.algo.SHA256
      });
      
      // Decrypt data with IV if available
      const decryptOptions = {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      };
      
      if (iv) {
        decryptOptions.iv = iv;
      }
      
      const bytes = CryptoJS.AES.decrypt(parsedData.encrypted, key, decryptOptions);
      
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted || decrypted.length === 0) {
        throw new Error('Failed to decrypt data - invalid password');
      }
      
      // Verify it's valid JSON
      try {
        JSON.parse(decrypted);
      } catch (jsonError) {
        throw new Error('Decrypted data is not valid JSON');
      }
      
      return { data: decrypted, isLegacy: false };
    } else {
      // Try legacy decryption
      const result = decryptDataLegacy(encryptedData, password);
      return { data: result, isLegacy: true };
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

// Legacy encryption for backward compatibility
const encryptDataLegacy = (data, password) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, password).toString();
    return encrypted;
  } catch (error) {
    console.error('Legacy encryption error:', error);
    throw error;
  }
};

// Legacy decryption for old format (will be removed in future versions)
const decryptDataLegacy = (encryptedData, password) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted || decrypted.length === 0) {
      throw new Error('Failed to decrypt data - invalid password');
    }
    
    // Verify it's valid JSON
    try {
      JSON.parse(decrypted);
    } catch (jsonError) {
      throw new Error('Decrypted data is not valid JSON');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Legacy decryption error:', error);
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

  // Calculate character set size for entropy calculation
  let charsetSize = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasNumbers) charsetSize += 10;
  if (hasSpecial) charsetSize += 32; // Common special characters
  
  // Calculate entropy in bits
  const entropy = password.length * Math.log2(charsetSize);
  
  // Calculate encryption strength based on entropy
  let encryptionBits = Math.floor(entropy);
  
  // Scoring based on entropy and password requirements
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;

  if (hasLower) score += 1;
  else feedback.push('Include lowercase letters');

  if (hasUpper) score += 1;
  else feedback.push('Include uppercase letters');

  if (hasNumbers) score += 1;
  else feedback.push('Include numbers');

  if (hasSpecial) score += 1;
  else feedback.push('Include special characters');

  // Determine strength category based on entropy
  let strengthCategory;
  if (entropy < 30) {
    strengthCategory = 'very-weak';
  } else if (entropy < 50) {
    strengthCategory = 'weak';
  } else if (entropy < 70) {
    strengthCategory = 'medium';
  } else if (entropy < 90) {
    strengthCategory = 'strong';
  } else {
    strengthCategory = 'very-strong';
  }

  // Add entropy-based feedback
  if (entropy < 50) {
    feedback.push(`Increase complexity for stronger encryption (${encryptionBits} bits)`);
  }

  return { 
    strength: strengthCategory, 
    score, 
    feedback,
    entropy: entropy,
    encryptionBits: encryptionBits,
    charsetSize: charsetSize
  };
};