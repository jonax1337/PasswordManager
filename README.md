# Simple Password Manager

A secure and stylish password manager application built with Electron and React, inspired by KeePass but with a modern, fresh UI.

## Features

- 🔐 **Secure Encryption**: AES encryption for password storage
- 🎨 **Modern UI**: Clean, intuitive interface with Tailwind CSS and custom themes
- 🎯 **Smart Icons**: Support for brand-specific icons (Google, Facebook, Instagram, etc.) and emojis
- 🔑 **Password Generation**: Customizable password generator with strength indicators
- 📁 **Organization**: Organize passwords with folders and hierarchical structure
- 🔍 **Search & Filter**: Quick search and filtering capabilities
- 💾 **Local Storage**: Passwords are stored locally in encrypted database files
- ⌨️ **Keyboard Shortcuts**: Efficient keyboard navigation
- 🖥️ **Cross-Platform**: Works on Windows, macOS, and Linux
- 🌙 **Multiple Themes**: Light, dark, cute, and system themes available

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository or download the source code
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Running the Application

#### Development Mode

```bash
npm run dev
```

This will start both the React development server and the Electron application.

#### Production Build

```bash
npm run build
npm run electron-build
```

This will create a production build and package the application for your platform.

### Building for Distribution

```bash
npm run dist
```

This will create distributable packages in the `dist` folder.

## Usage

### Creating a New Database

1. Launch the application
2. Go to **File → New Database**
3. Set your master password
4. Start adding your password entries

### Opening an Existing Database

1. Go to **File → Open Database**
2. Select your `.pmdb` file
3. Enter your master password to unlock

### Adding Password Entries

1. Click the **Add Entry** button or press `Ctrl+Alt+Win+N`
2. Fill in the entry details:
   - **Title**: Name for your entry (e.g., "Gmail", "Facebook")
   - **Folder**: Organization folder for your entry
   - **URL**: Website URL (optional)
   - **Username**: Your username or email
   - **Password**: Your password (use the generator for strong passwords)
   - **Icon**: Choose from brand icons, emojis, or general icons
   - **Notes**: Additional information (optional)

### Generating Strong Passwords

1. Click the **Generate** button or press `Ctrl+G` (or `Cmd+G` on Mac)
2. Customize the password options:
   - Length (4-128 characters)
   - Character types (uppercase, lowercase, numbers, symbols)
   - Exclude similar characters option
3. Copy the generated password

### Organizing Entries

- Use **Folders** to categorize your passwords with hierarchical structure
- Create subfolders for better organization
- Use the **Search** bar to quickly find specific entries
- Filter by folder using the sidebar tree view
- Choose from brand-specific icons, emojis, or general icons for visual identification

### Security Features

- **Master Password**: Your database is protected by a master password
- **AES Encryption**: All passwords are encrypted using AES encryption
- **Local Storage**: Your passwords never leave your device
- **Auto-lock**: The application requires your master password each time you open it

## File Structure

```
src/
├── components/
│   ├── LoginScreen.js      # Master password login
│   ├── MainInterface.js    # Main application interface
│   ├── Sidebar.js          # Sidebar with folder tree
│   ├── FolderTree.js       # Hierarchical folder navigation
│   ├── EntryList.js        # Password entries display
│   ├── EntryForm.js        # Add/edit password form
│   ├── PasswordGenerator.js # Password generation tool
│   ├── IconPicker.js       # Brand icons and emoji picker
│   ├── IconRenderer.js     # Icon rendering component
│   └── Titlebar.js         # Custom titlebar with menus
├── contexts/
│   └── ThemeContext.js     # Theme management
├── utils/
│   └── crypto.js           # Encryption and password utilities
├── App.js                  # Main application component
├── App.css                 # Application styles with theme support
└── index.js                # Application entry point
```

## Security Notes

- Your master password is never stored - make sure to remember it!
- Database files are encrypted and can only be opened with the correct master password
- The application uses industry-standard AES encryption
- All password operations happen locally on your device

## Keyboard Shortcuts

- `Ctrl+N`: New Database
- `Ctrl+O`: Open Database
- `Ctrl+S`: Save Database
- `Ctrl+Shift+S`: Save Database As
- `Ctrl+Alt+Win+N`: Add Entry
- `Ctrl+G`: Generate Password
- `Ctrl+Q`: Quit Application

## Contributing

This is a personal project, but contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Troubleshooting

### Application Won't Start

1. Make sure you have Node.js installed
2. Delete `node_modules` and run `npm install` again
3. Try running `npm run react-dev` and `npm run electron-dev` separately

### Database Won't Open

1. Make sure you're entering the correct master password
2. Check that the database file isn't corrupted
3. Try creating a new database if the issue persists

### Performance Issues

1. Keep your database file size reasonable (under 10MB)
2. Close the application completely and restart it
3. Clear any old database files you no longer need

## Support

For issues or questions, please create an issue in the project repository.