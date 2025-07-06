# Simple Password Manager

![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=Electron&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-0.0.1--beta-orange?style=for-the-badge)

A secure and modern password manager built with Electron and React, inspired by KeePass but with a fresh, intuitive interface.

[📥 Download](https://github.com/jonax1337/simple-password-manager/releases) • [🐛 Report Bug](https://github.com/jonax1337/simple-password-manager/issues) • [💡 Request Feature](https://github.com/jonax1337/simple-password-manager/issues)

## ✨ Features

- 🔐 **AES Encryption** - Military-grade encryption for all data
- 💾 **Local Storage** - Your passwords never leave your device  
- 🔑 **Master Password** - Single password to rule them all
- 🎨 **Multiple Themes** - Light, dark, cute, and system themes
- 🎯 **Smart Icons** - 30+ brand logos (Google, Facebook, etc.) and emojis
- 📁 **Hierarchical Folders** - Organize with nested folder structure
- 🔍 **Smart Search** - Find entries instantly
- 🔧 **Password Generator** - Create strong passwords with custom rules
- 📂 **Recent Files** - Quick access to last used database
- 🖱️ **File Association** - Double-click .pmdb files to open directly
- ⌨️ **Keyboard Shortcuts** - Work faster with hotkeys
- 💻 **Cross-Platform** - Works on Windows, macOS, and Linux

## 🚀 Quick Start

### For End Users

1. **Download** the latest installer from [Releases](https://github.com/jonax1337/simple-password-manager/releases)
2. **Install** the application
3. **Create** your first database or **open** an existing one
4. **Start** managing your passwords securely!

### For Developers

#### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

#### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/jonax1337/simple-password-manager.git
cd simple-password-manager

# Install dependencies
npm install

# Install electron-store for settings
npm install electron-store
```

#### Development

```bash
# Start development server
npm run dev
```

This starts both React development server and Electron application with hot reload.

#### Building

```bash
# Build for production
npm run build

# Create installer (Windows)
npm run electron-build -- --win

# Create installer (macOS)  
npm run electron-build -- --mac

# Create installer (Linux)
npm run electron-build -- --linux

# Build for all platforms
npm run dist
```

Built applications will be in the `release/` folder.

## 📖 Usage Guide

<details>
<summary><strong>🗂️ Database Management</strong></summary>

### Creating a New Database
1. Launch the application
2. Click **Create New Database** or `Ctrl+N`
3. Choose a location and filename for your `.pmdb` file
4. Set a strong master password
5. Start adding your password entries

### Opening an Existing Database
1. Click **Open Database** or `Ctrl+O`
2. Select your `.pmdb` file (or double-click it in Explorer)
3. Enter your master password to unlock

> **💡 Tip**: Recently opened databases are automatically suggested on startup!

</details>

<details>
<summary><strong>🔑 Managing Password Entries</strong></summary>

### Adding New Entries
1. Click **Add Entry** or press `Ctrl+Alt+Win+N`
2. Fill in the details:
   - **Title**: Recognizable name (e.g., "Gmail", "Work Email")
   - **Folder**: Choose or create an organization folder
   - **URL**: Website URL (clickable for quick access)
   - **Username**: Your username or email
   - **Password**: Use the generator for strong passwords
   - **Icon**: Pick from 30+ brand logos, emojis, or general icons
   - **Notes**: Additional information or security questions

### Using the Password Generator
1. Click **Generate** in the password field or press `Ctrl+G`
2. Customize options:
   - **Length**: 4-128 characters
   - **Character types**: Letters, numbers, symbols
   - **Exclude similar**: Avoid confusing characters (i, l, 1, L, o, 0, O)
3. Copy and use the generated password

</details>

<details>
<summary><strong>📁 Organization & Search</strong></summary>

### Folder Management
- **Create folders**: Right-click in the folder tree
- **Nested structure**: Organize with subfolders (Work → Email → Gmail)
- **Move entries**: Drag & drop or edit entry folder
- **Folder icons**: Automatic icons based on content

### Finding Entries
- **Search bar**: Type to find entries by title, username, or URL
- **Folder filtering**: Click folders to show only those entries
- **Recent files**: Last opened database loads automatically

</details>

<details>
<summary><strong>🎨 Themes & Customization</strong></summary>

### Available Themes
- **Light**: Clean and bright interface
- **Dark**: Easy on the eyes for night use  
- **Cute**: Playful pink-themed design
- **System**: Automatically matches your OS theme

### Changing Themes
1. Click **Style** in the menu bar
2. Select your preferred theme
3. Theme is saved and applied automatically

</details>

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | Create New Database |
| `Ctrl+O` | Open Database |
| `Ctrl+S` | Save Database |
| `Ctrl+Shift+S` | Save Database As |
| `Ctrl+Alt+Win+N` | Add New Entry |
| `Ctrl+G` | Generate Password |
| `Ctrl+Q` | Quit Application |

## 🏗️ Technical Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icon system
- **React Icons** - Brand-specific icons

### Backend  
- **Electron** - Cross-platform desktop framework
- **Node.js** - JavaScript runtime
- **CryptoJS** - AES encryption implementation
- **Electron Store** - Settings persistence

### Development
- **React Scripts** - Build tooling
- **Electron Builder** - Application packaging
- **Concurrently** - Development workflow

## 🔒 Security & Privacy

| Feature | Implementation |
|---------|----------------|
| Encryption | AES-256 industry standard |
| Storage | Local files only, never cloud |
| Master Password | Never stored, memory-only |
| File Format | Encrypted .pmdb files |
| Zero Knowledge | Your data stays on your device |

> **🛡️ Security Note**: Your master password is never stored anywhere. Make sure to remember it or keep it in a secure backup location!

## 🐛 Troubleshooting

<details>
<summary><strong>Application Issues</strong></summary>

**App won't start**
- Ensure Node.js 16+ is installed
- Delete `node_modules` folder and run `npm install`
- Check for conflicting antivirus software

**Database won't open**  
- Verify correct master password
- Check file permissions
- Try moving database to a different location

**Performance is slow**
- Keep database under 10MB
- Restart the application
- Clear unused database files

</details>

<details>
<summary><strong>Development Issues</strong></summary>

**Build fails**
- Run `npm install electron-store` if missing
- Clear build cache with `npm run build`
- Check Node.js version compatibility

**Electron won't start**
- Kill any running electron processes
- Delete `.electron` cache folder
- Run `npm run react-dev` and `npm run electron-dev` separately

</details>

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🐛 Report Bugs**: [Create an issue](https://github.com/jonax1337/simple-password-manager/issues)
2. **💡 Suggest Features**: [Request a feature](https://github.com/jonax1337/simple-password-manager/issues)
3. **🔧 Submit PRs**: Fork, develop, and submit a pull request
4. **📖 Improve Docs**: Help make the documentation better

### Development Setup
```bash
git clone https://github.com/jonax1337/simple-password-manager.git
cd simple-password-manager
npm install
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


---

⭐ Star this project if you find it useful!