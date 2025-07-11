# 🔐 Simple Password Manager

A secure, offline password manager built with modern web technologies. Keep all your passwords safe with military-grade encryption while enjoying a beautiful, intuitive interface.

[![Electron](https://img.shields.io/badge/Electron-37.2.1-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.13-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![CryptoJS](https://img.shields.io/badge/CryptoJS-AES--256-FF6B35?style=for-the-badge&logo=javascript&logoColor=white)](https://cryptojs.gitbook.io/docs/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE.md)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)](https://github.com/jonax1337/simple-password-manager/releases)

## ✨ Features

### Security First
- **AES-256 encryption with PBKDF2** - Military-grade security with 100,000 iterations
- **Advanced brute-force protection** - Automatic lockout after failed attempts
- **Persistent security tracking** - Protection survives app restarts
- **Offline-only operation** - Your data never leaves your device
- **Zero-knowledge architecture** - Your master password is never stored
- **Open source** - Security experts can verify the code

### Beautiful Interface
- **Modern design** with smooth animations and intuitive navigation
- **Multiple themes** - Light, dark, and system themes
- **Responsive layout** that adapts to your screen size
- **Drag-and-drop organization** for effortless password management

### Powerful Features
- **Unlimited password storage** organized in folders
- **Advanced password generator** with customizable options
- **Global search** across all entries and folders
- **KeePass import** - Migrate from existing KeePass databases
- **Keyboard shortcuts** for power users
- **Multi-window support** - Open multiple databases simultaneously
- **Auto-save functionality** - Never lose your work
- **Custom icons** for folders and entries
- **Password strength indicator** - Know how secure your passwords are
- **Copy to clipboard** with automatic clearing for security

## 🚀 Quick Start

### Installation

Download the latest release for your platform:

- **Windows**: Download the `.exe` installer
- **macOS**: Download the `.dmg` package
- **Linux**: Download the `.AppImage` file

[Download Latest Release](https://github.com/jonax1337/simple-password-manager/releases)

### First Use

1. **Launch the application**
2. **Create a new database** or import from KeePass
3. **Set your master password** (this is the only password you'll need to remember)
4. **Choose where to save** your encrypted database file
5. **Start adding your passwords** with the built-in generator

## ⚙️ How It Works

### Security Architecture
Your passwords are protected by multiple layers of security:

**Encryption**: AES-256 encryption with PBKDF2 key derivation (100,000 iterations) and unique salt per database. This makes brute-force attacks computationally infeasible.

**Key Derivation**: Your master password is never stored. Instead, it's used with PBKDF2 to derive the encryption key on-demand, with a unique salt for each database.

**Brute-Force Protection**: The application tracks failed login attempts and implements progressive lockouts:
- 1-2 failed attempts: Warning displayed
- 3-5 failed attempts: Temporary lockout (5-30 seconds)
- 6-9 failed attempts: Extended lockout (1-30 minutes)
- 10+ failed attempts: Permanent database lockout

**User-Specific Locking**: Security tracking is tied to the user running the application. If one user locks a database, other users on the same system can still access it with the correct master password. This prevents one user from accidentally locking out others from shared databases.

**Attack Persistence**: Security tracking survives application restarts and system reboots, preventing attackers from bypassing protections by restarting the app.

### Database Format
All data is stored in encrypted `.pmdb` files that contain:
- Your password entries with usernames, URLs, and notes
- Folder structure for organization
- Entry metadata like creation and modification dates
- Cryptographic salt for enhanced security
- Version information for future compatibility

**Security Storage**: Failed attempt tracking is stored separately in an encrypted security file, preventing tampering while maintaining your privacy.

### Offline Operation
The application works completely offline. No internet connection is required, and your data never leaves your device unless you choose to back it up yourself.

## 📖 User Guide

### Adding Passwords

1. Click the **+** button in the toolbar
2. Fill in the website, username, and password
3. Use the **password generator** for strong, unique passwords
4. Add notes for security questions or additional information
5. Choose a folder to organize your entry

### Organizing with Folders

- **Create folders** by right-clicking in the sidebar
- **Drag and drop** entries between folders
- **Nest folders** for detailed organization
- **Add custom icons** to folders for visual recognition

### Searching

- Use **global search** with `Ctrl+F` to find anything
- Search works across titles, usernames, URLs, and notes
- Results are highlighted and easy to navigate

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New database | `Ctrl+N` |
| Open database | `Ctrl+O` |
| Save | `Ctrl+S` |
| Add entry | `Ctrl+Alt+Win+N` |
| Search | `Ctrl+F` |
| Password generator | `Ctrl+G` |
| Close/Cancel | `Escape` |

### Importing from KeePass

1. **Create a new database** or open an existing one
2. **Click "Import from KeePass"** in the welcome screen
3. **Select your .kdbx file** and enter the password
4. **All entries and folders** will be imported automatically

## 🔧 Advanced Features

### Themes and Customization
- **Light theme** for daytime use
- **Dark theme** for low-light environments
- **System theme** that follows your OS preference
- **Resizable sidebar** to fit your workflow

### Performance
The application is optimized for large databases:
- **Virtual scrolling** for smooth performance with thousands of entries
- **Efficient search** with instant results
- **Optimized rendering** for smooth animations
- **Memory management** - Efficient handling of large password databases
- **Fast startup** - Quick application launch times
- **Responsive UI** - Smooth interactions even with large datasets

### Multi-Window Support
- **Open multiple databases** simultaneously
- **Independent windows** for different purposes
- **Secure isolation** between database instances

## 🛡️ Security Best Practices

### Master Password
- Use a strong, unique master password (16+ characters recommended)
- Consider using a passphrase with multiple words
- Never share your master password with anyone
- Keep it in a secure location if written down
- **Remember**: After 10 failed attempts, your database will be permanently locked

### Backup Strategy
- **Regular backups** of your `.pmdb` file
- **Multiple backup locations** (USB drive, encrypted cloud storage)
- **Test backups** periodically to ensure they work
- **Keep backups secure** with the same care as your main file
- **Security files**: Don't backup the security tracking files (they reset protections)

### Password Generation
- **Use the built-in generator** for all new passwords
- **Enable all character types** for maximum security
- **Use long passwords** (16+ characters when possible)
- **Generate unique passwords** for every account
- **Monitor password strength** with the built-in entropy calculator

### Understanding Database Lockout

**How Lockout Works**:
The application protects against brute-force attacks by tracking failed login attempts for each database file. When you enter an incorrect master password repeatedly, the system implements progressive lockouts:

1. **Attempts 1-2**: Simple warning with remaining attempts shown
2. **Attempts 3-5**: Short lockouts (5-30 seconds) to slow down attacks
3. **Attempts 6-9**: Extended lockouts (1-30 minutes) for persistent attacks
4. **Attempt 10+**: Permanent lockout - database becomes inaccessible

**Important**: The lockout is **user-specific** and tied to your user account on the computer. If you lock a database, other users on the same system can still access it with the correct master password.

**Security File Location**: 
The lockout information is stored in an encrypted security file in your application data folder:
- **Windows**: `C:\Users\[YourName]\AppData\Roaming\simple-password-manager\security.encrypted`
- **macOS**: `~/Library/Application Support/simple-password-manager/security.encrypted`
- **Linux**: `~/.config/simple-password-manager/security.encrypted`

### Lockout Recovery
If your database becomes permanently locked:
1. **Locate the security file**: The exact path is shown in the lockout message
2. **Close the application** completely
3. **Delete the security file** (usually `security.encrypted` in app data folder)
4. **Restart the application** - lockout will be reset
5. **Use correct master password** to avoid re-lockout

**Recovery Examples**:
```bash
# Windows (Command Prompt)
del "C:\Users\[YourName]\AppData\Roaming\simple-password-manager\security.encrypted"

# macOS/Linux (Terminal)
rm ~/.config/simple-password-manager/security.encrypted
```

**Important Notes**:
- Deleting the security file resets ALL lockout protections for ALL databases
- Other users on the same computer are not affected by your lockout
- Keep your master password secure to avoid lockouts entirely
- The database file itself is never damaged - only access is restricted

## 🔧 Troubleshooting

### Common Issues

**Application won't start**
- Download the correct version for your operating system
- Check if antivirus software is blocking the application
- Try running as administrator (Windows) or check security settings (macOS)

**Cannot open database**
- Verify your master password is correct (case-sensitive)
- Check that the database file hasn't been corrupted
- Try copying the file to a different location
- **Check for lockout**: Look for security warnings in the login screen

**Database permanently locked**
- **Don't panic**: Your data is safe, just protected from brute-force attacks
- **User-specific**: Only affects your user account - others can still access the database
- **Find security file**: Look for the path shown in the error message
- **Delete security file**: Remove `security.encrypted` from app data folder
- **Restart app**: Lockout protection will be reset for all databases
- **Use correct password**: Be extra careful to avoid re-lockout

**Import not working**
- Ensure the KeePass file opens correctly in KeePass first
- Verify you're using the correct password for the import
- Try importing a smaller test database first

### Getting Help

For additional support:
1. Check [existing issues](https://github.com/jonax1337/simple-password-manager/issues)
2. Create a [new issue](https://github.com/jonax1337/simple-password-manager/issues/new) with details
3. Include your operating system and app version

Never share your master password or database files in support requests.

## 💻 Development

### Technology Stack
- **Electron 37.2.1** - Cross-platform desktop application framework
- **React 18.3.1** - Modern UI library with hooks
- **Tailwind CSS 3.4.13** - Utility-first CSS framework
- **CryptoJS 4.2.0** - Encryption library for AES-256 with PBKDF2
- **Electron Store** - Secure settings storage
- **Node.js Crypto** - System-level cryptographic operations

### Building from Source

```bash
# Clone the repository
git clone https://github.com/jonax1337/simple-password-manager.git
cd simple-password-manager

# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build
npm run electron-build
```

### Project Structure
```
src/
├── components/
│   ├── screens/         # Main application screens
│   ├── dialogs/         # Modal dialogs
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── contexts/            # React context providers
└── utils/               # Utility functions

public/
├── electron.js          # Main Electron process
├── preload.js          # Secure preload script
└── icons/              # Application icons
```

### Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Test your changes thoroughly
5. Submit a pull request with a clear description

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE.md) for details.

## 🔒 Privacy

This application:
- **Does not collect** any personal data
- **Does not connect** to the internet
- **Does not send** any telemetry or analytics
- **Stores all data** locally on your device
