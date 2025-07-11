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
- **AES-256 encryption** - Military-grade security for all your passwords
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
Your passwords are encrypted using AES-256 encryption before being saved to disk. The master password you choose is used to derive the encryption key, which means even if someone gains access to your database file, they cannot read your passwords without your master password.

### Database Format
All data is stored in encrypted `.pmdb` files that contain:
- Your password entries with usernames, URLs, and notes
- Folder structure for organization
- Entry metadata like creation and modification dates

### Offline Operation
The application works completely offline. No internet connection is required, and your data never leaves your device unless you choose to back it up yourself.

## 📖 User Guide

### Adding Passwords

1. Click the **+** button in the toolbar or use `Ctrl+Alt+Win+N`
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
- Use a strong, unique master password
- Consider using a passphrase with multiple words
- Never share your master password with anyone
- Keep it in a secure location if written down

### Backup Strategy
- **Regular backups** of your `.pmdb` file
- **Multiple backup locations** (USB drive, encrypted cloud storage)
- **Test backups** periodically to ensure they work
- **Keep backups secure** with the same care as your main file

### Password Generation
- **Use the built-in generator** for all new passwords
- **Enable all character types** for maximum security
- **Use long passwords** (16+ characters when possible)
- **Generate unique passwords** for every account

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
- **CryptoJS 4.2.0** - Encryption library for AES-256
- **Electron Store** - Secure settings storage

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

Your privacy and security are our top priorities.

---

**Ready to secure your digital life?** Download Simple Password Manager today and take control of your online security.