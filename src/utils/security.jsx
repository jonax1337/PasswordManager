import { encryptData, decryptData } from './crypto';

// Security configuration
const SECURITY_CONFIG = {
  MAX_FAILED_ATTEMPTS: 10,
  LOCKOUT_DURATIONS: [
    0,      // 0 attempts
    0,      // 1 attempt
    0,      // 2 attempts
    5000,   // 3 attempts - 5 seconds
    15000,  // 4 attempts - 15 seconds
    30000,  // 5 attempts - 30 seconds
    60000,  // 6 attempts - 1 minute
    300000, // 7 attempts - 5 minutes
    600000, // 8 attempts - 10 minutes
    1800000, // 9 attempts - 30 minutes
    -1      // 10+ attempts - permanent lockout
  ]
};

// Security manager class
class SecurityManager {
  constructor() {
    this.securityData = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      if (window.electronAPI && window.electronAPI.getSecurityData) {
        // Load security data from encrypted storage
        const encryptedData = await window.electronAPI.getSecurityData();
        if (encryptedData) {
          try {
            // Decrypt security data using a fixed key (not user password)
            const systemKey = await this.getSystemKey();
            const decryptResult = decryptData(encryptedData, systemKey);
            this.securityData = JSON.parse(decryptResult.data);
          } catch (error) {
            console.warn('Failed to decrypt security data, creating new:', error);
            this.securityData = {};
          }
        } else {
          this.securityData = {};
        }
      } else {
        console.warn('Security API not available, using fallback mode');
        this.securityData = {};
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize security manager:', error);
      this.securityData = {};
      this.isInitialized = true;
    }
  }

  async getSystemKey() {
    // Generate or retrieve a system-specific key for encrypting security data
    if (window.electronAPI && window.electronAPI.getSystemKey) {
      return await window.electronAPI.getSystemKey();
    }
    return 'default-system-key'; // Fallback for testing
  }

  async saveSecurityData() {
    if (!this.isInitialized) return;
    
    try {
      if (window.electronAPI && window.electronAPI.saveSecurityData) {
        const systemKey = await this.getSystemKey();
        const encryptedData = encryptData(JSON.stringify(this.securityData), systemKey);
        await window.electronAPI.saveSecurityData(encryptedData);
      } else {
        console.warn('Security save API not available');
      }
    } catch (error) {
      console.error('Failed to save security data:', error);
    }
  }

  getFileSecurityData(filePath) {
    if (!this.securityData[filePath]) {
      this.securityData[filePath] = {
        failedAttempts: 0,
        lastFailedAttempt: null,
        lockedUntil: null,
        permanentlyLocked: false,
        attempts: [] // History of attempts
      };
    }
    return this.securityData[filePath];
  }

  async recordFailedAttempt(filePath) {
    await this.initialize();
    
    const fileData = this.getFileSecurityData(filePath);
    const now = Date.now();
    
    fileData.failedAttempts += 1;
    fileData.lastFailedAttempt = now;
    fileData.attempts.push({
      timestamp: now,
      success: false
    });
    
    // Keep only last 50 attempts for performance
    if (fileData.attempts.length > 50) {
      fileData.attempts = fileData.attempts.slice(-50);
    }
    
    // Check if permanently locked
    if (fileData.failedAttempts >= SECURITY_CONFIG.MAX_FAILED_ATTEMPTS) {
      fileData.permanentlyLocked = true;
      fileData.lockedUntil = null; // Permanent lockout
    } else {
      // Set temporary lockout
      const lockoutDuration = SECURITY_CONFIG.LOCKOUT_DURATIONS[fileData.failedAttempts];
      if (lockoutDuration > 0) {
        fileData.lockedUntil = now + lockoutDuration;
      }
    }
    
    await this.saveSecurityData();
    
    return {
      failedAttempts: fileData.failedAttempts,
      isLocked: this.isLocked(filePath),
      isPermanentlyLocked: fileData.permanentlyLocked,
      lockoutDuration: this.getLockoutDuration(filePath),
      remainingAttempts: SECURITY_CONFIG.MAX_FAILED_ATTEMPTS - fileData.failedAttempts
    };
  }

  async recordSuccessfulAttempt(filePath) {
    await this.initialize();
    
    const fileData = this.getFileSecurityData(filePath);
    const now = Date.now();
    
    // Reset failed attempts on successful login
    fileData.failedAttempts = 0;
    fileData.lastFailedAttempt = null;
    fileData.lockedUntil = null;
    fileData.permanentlyLocked = false;
    
    fileData.attempts.push({
      timestamp: now,
      success: true
    });
    
    // Keep only last 50 attempts for performance
    if (fileData.attempts.length > 50) {
      fileData.attempts = fileData.attempts.slice(-50);
    }
    
    await this.saveSecurityData();
  }

  isLocked(filePath) {
    if (!this.isInitialized) return false;
    
    const fileData = this.getFileSecurityData(filePath);
    const now = Date.now();
    
    // Check permanent lockout
    if (fileData.permanentlyLocked) {
      return true;
    }
    
    // Check temporary lockout
    if (fileData.lockedUntil && now < fileData.lockedUntil) {
      return true;
    }
    
    return false;
  }

  isPermanentlyLocked(filePath) {
    if (!this.isInitialized) return false;
    
    const fileData = this.getFileSecurityData(filePath);
    return fileData.permanentlyLocked;
  }

  getLockoutDuration(filePath) {
    if (!this.isInitialized) return 0;
    
    const fileData = this.getFileSecurityData(filePath);
    const now = Date.now();
    
    if (fileData.permanentlyLocked) {
      return -1; // Permanent lockout
    }
    
    if (fileData.lockedUntil && now < fileData.lockedUntil) {
      return fileData.lockedUntil - now;
    }
    
    return 0;
  }

  getFailedAttempts(filePath) {
    if (!this.isInitialized) return 0;
    
    const fileData = this.getFileSecurityData(filePath);
    return fileData.failedAttempts;
  }

  getRemainingAttempts(filePath) {
    const failedAttempts = this.getFailedAttempts(filePath);
    return Math.max(0, SECURITY_CONFIG.MAX_FAILED_ATTEMPTS - failedAttempts);
  }

  getSecurityStatus(filePath) {
    if (!this.isInitialized) {
      return {
        isLocked: false,
        isPermanentlyLocked: false,
        failedAttempts: 0,
        remainingAttempts: SECURITY_CONFIG.MAX_FAILED_ATTEMPTS,
        lockoutDuration: 0
      };
    }
    
    return {
      isLocked: this.isLocked(filePath),
      isPermanentlyLocked: this.isPermanentlyLocked(filePath),
      failedAttempts: this.getFailedAttempts(filePath),
      remainingAttempts: this.getRemainingAttempts(filePath),
      lockoutDuration: this.getLockoutDuration(filePath)
    };
  }

  async resetLockout(filePath) {
    await this.initialize();
    
    const fileData = this.getFileSecurityData(filePath);
    fileData.failedAttempts = 0;
    fileData.lastFailedAttempt = null;
    fileData.lockedUntil = null;
    fileData.permanentlyLocked = false;
    
    await this.saveSecurityData();
  }

  async clearAllSecurityData() {
    this.securityData = {};
    await this.saveSecurityData();
  }

  getSecurityConfigPath() {
    // Return the path where security data is stored for user reference
    return window.electronAPI ? window.electronAPI.getSecurityConfigPath() : 'security.json';
  }
}

// Export singleton instance
export const securityManager = new SecurityManager();

// Export configuration for reference
export { SECURITY_CONFIG };