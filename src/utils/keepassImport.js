// Try different import methods for kdbxweb
let kdbxweb;
try {
  // First try ES6 import
  kdbxweb = require('kdbxweb');
  console.log('kdbxweb loaded via require:', kdbxweb);
} catch (e1) {
  try {
    // Try default import
    const kdbxwebModule = require('kdbxweb');
    kdbxweb = kdbxwebModule.default || kdbxwebModule;
    console.log('kdbxweb loaded via require.default:', kdbxweb);
  } catch (e2) {
    console.error('Failed to load kdbxweb:', e1, e2);
  }
}

// Debug kdbxweb loading
console.log('Final kdbxweb loaded:', kdbxweb);
console.log('kdbxweb.Kdbx:', kdbxweb?.Kdbx);
console.log('kdbxweb.Credentials:', kdbxweb?.Credentials);

// Test function to verify kdbxweb basic functionality
export const testKdbxWeb = () => {
  try {
    if (!kdbxweb || !kdbxweb.Credentials || !kdbxweb.ProtectedValue) {
      console.error('kdbxweb not properly loaded');
      return false;
    }
    const testPassword = 'test';
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(testPassword));
    console.log('kdbxweb basic test passed:', credentials);
    return true;
  } catch (error) {
    console.error('kdbxweb basic test failed:', error);
    return false;
  }
};

/**
 * Import a KeePass database file and convert it to our format
 * @param {File} file - The KDBX file to import
 * @param {string} password - The master password for the KDBX file
 * @returns {Promise<Object>} - Promise resolving to database object in our format
 */
export const importKeePassDatabase = async (file, password) => {
  console.log('Starting KeePass import...');
  console.log('File:', file.name, 'Size:', file.size);
  
  try {
    // Check if kdbxweb is loaded
    if (!kdbxweb || !kdbxweb.Kdbx || !kdbxweb.Credentials) {
      throw new Error('KeePass library not loaded properly');
    }
    
    // Validate inputs
    if (!file) {
      throw new Error('No file provided');
    }
    if (!password) {
      throw new Error('No password provided');
    }
    
    console.log('Reading file as ArrayBuffer...');
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('ArrayBuffer size:', arrayBuffer.byteLength);
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('File is empty');
    }
    
    console.log('Creating credentials...');
    // Convert password to ArrayBuffer if needed
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));
    
    console.log('Loading KDBX database...');
    // Open the KDBX database
    const db = await kdbxweb.Kdbx.load(arrayBuffer, credentials);
    console.log('Database loaded successfully');
    
    // Convert to our database format
    const convertedDatabase = {
      entries: [],
      folders: []
    };
    
    // Process groups (folders) recursively
    const processGroup = (group, parentPath = '') => {
      const currentPath = parentPath ? `${parentPath}/${group.name}` : group.name;
      
      // Skip root group
      if (group.name !== 'Root') {
        convertedDatabase.folders.push({
          id: group.uuid.id,
          name: group.name,
          path: currentPath,
          parentPath: parentPath,
          children: []
        });
      }
      
      // Process entries in this group
      group.entries.forEach(entry => {
        // Skip entries that are just metadata
        if (entry.fields.get('Title') === 'Meta-Info') {
          return;
        }
        
        const convertedEntry = {
          id: entry.uuid.id,
          title: entry.fields.get('Title') || '',
          username: entry.fields.get('UserName') || '',
          password: entry.fields.get('Password') ? entry.fields.get('Password').getText() : '',
          url: entry.fields.get('URL') || '',
          notes: entry.fields.get('Notes') || '',
          folder: group.name === 'Root' ? '' : currentPath,
          icon: entry.icon || 0,
          createdAt: entry.times.creationTime || new Date(),
          modifiedAt: entry.times.lastModTime || new Date()
        };
        
        // Add custom fields as notes if they exist
        const customFields = [];
        entry.fields.forEach((value, key) => {
          if (!['Title', 'UserName', 'Password', 'URL', 'Notes'].includes(key)) {
            customFields.push(`${key}: ${value.getText ? value.getText() : value}`);
          }
        });
        
        if (customFields.length > 0) {
          convertedEntry.notes = convertedEntry.notes 
            ? `${convertedEntry.notes}\n\n--- Custom Fields ---\n${customFields.join('\n')}`
            : `--- Custom Fields ---\n${customFields.join('\n')}`;
        }
        
        convertedDatabase.entries.push(convertedEntry);
      });
      
      // Process subgroups recursively
      group.groups.forEach(subgroup => {
        processGroup(subgroup, currentPath);
      });
    };
    
    console.log('Processing groups and entries...');
    // Start processing from root group
    const defaultGroup = db.getDefaultGroup();
    console.log('Default group:', defaultGroup.name);
    processGroup(defaultGroup);
    
    console.log('Entries found:', convertedDatabase.entries.length);
    console.log('Folders found:', convertedDatabase.folders.length);
    
    // Build folder hierarchy
    const folderMap = {};
    convertedDatabase.folders.forEach(folder => {
      folderMap[folder.path] = folder;
    });
    
    // Organize folders into hierarchy
    const rootFolders = [];
    convertedDatabase.folders.forEach(folder => {
      if (folder.parentPath) {
        const parent = folderMap[folder.parentPath];
        if (parent) {
          parent.children.push(folder);
        }
      } else {
        rootFolders.push(folder);
      }
    });
    
    convertedDatabase.folders = rootFolders;
    
    console.log('Import completed successfully');
    return {
      success: true,
      database: convertedDatabase,
      stats: {
        entriesImported: convertedDatabase.entries.length,
        foldersImported: getAllFoldersCount(convertedDatabase.folders),
        sourceFile: file.name
      }
    };
    
  } catch (error) {
    console.error('KeePass import error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to import KeePass database';
    
    if (error.message && error.message.includes('invalid key')) {
      errorMessage = 'Invalid password. Please check your master password and try again.';
    } else if (error.message && error.message.includes('corrupt')) {
      errorMessage = 'The database file appears to be corrupted or invalid.';
    } else if (error.message && error.message.includes('unsupported')) {
      errorMessage = 'This KeePass database format is not supported.';
    }
    
    return {
      success: false,
      error: errorMessage,
      details: error.message
    };
  }
};

/**
 * Count total number of folders recursively
 */
const getAllFoldersCount = (folders) => {
  let count = 0;
  folders.forEach(folder => {
    count += 1;
    if (folder.children && folder.children.length > 0) {
      count += getAllFoldersCount(folder.children);
    }
  });
  return count;
};

/**
 * Validate KeePass file before attempting import
 * @param {File} file - The file to validate
 * @returns {boolean} - Whether the file appears to be a valid KDBX file
 */
export const validateKeePassFile = (file) => {
  // Check file extension
  const validExtensions = ['.kdbx', '.kdb'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  
  // Check file size (should be reasonable for a database)
  const maxSize = 100 * 1024 * 1024; // 100MB max
  const minSize = 100; // 100 bytes min
  
  return hasValidExtension && file.size >= minSize && file.size <= maxSize;
};