import React, { useState } from 'react';
import { 
  Globe, Lock, Mail, User, CreditCard, Shield, Key, Phone, 
  Home, Building, Car, Gamepad2, Music, Camera, ShoppingCart,
  Heart, Star, Coffee, Briefcase, GraduationCap, MapPin,
  Monitor, Smartphone, Tablet, Wifi, Cloud, Download,
  Upload, Link, Hash, AtSign, Send, Bookmark, X,
  Server, Database, HardDrive, Cpu, Network, Router,
  Settings, Cog, Wrench, Bug, Code, Terminal,
  FileText, Folder, Archive, Package, Layers, Activity,
  BarChart, TrendingUp, DollarSign, CreditCard as CreditCardIcon,
  Users, UserCheck, UserX, Crown, Award, Medal,
  Calendar, Clock, Timer, Bell, Flag, Tag,
  Search, Filter, SortAsc, SortDesc, List, Grid,
  Eye, EyeOff, Edit, Trash2, Plus, Minus,
  Save, Copy, Paste, Undo, Redo,
  ZoomIn, ZoomOut, Maximize, Minimize, RotateCcw,
  Play, Pause, Stop, SkipBack, SkipForward, Volume2,
  Image, Video, Music2, Headphones, Mic, Speaker,
  Printer, Fax, Phone as PhoneIcon,
  MessageCircle, MessageSquare, Mail as MailIcon, Send as SendIcon,
  Facebook, Instagram, Twitter, Linkedin, Youtube,
  Github, Slack, Chrome,
  Smartphone as Mobile
} from 'lucide-react';

// Brand icons from react-icons
import {
  FaGoogle, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube,
  FaSpotify, FaApple, FaMicrosoft, FaAmazon, FaFilm, FaDropbox,
  FaGithub, FaSlack, FaDiscord, FaTelegram, FaWhatsapp, FaTiktok,
  FaSnapchat, FaPinterest, FaReddit, FaTwitch, FaUber, FaAirbnb,
  FaPaypal, FaVideo, FaFileImage, FaDocker, FaAws,
  FaDigitalOcean, FaGitlab, FaBitbucket,
  FaTrello, FaWordpress, FaShopify,
  FaNodeJs, FaReact, FaVuejs, FaAngular, FaPython, FaJava,
  FaPhp, FaLaravel, FaBootstrap, FaSass, FaNpm,
  FaYarn, FaGulp
} from 'react-icons/fa';

const IconPicker = ({ selectedIcon, onIconSelect, onClose }) => {


  // Icon categories with comprehensive tech and IT icons
  const iconCategories = {
    security: [
      { icon: Shield, name: 'Shield' },
      { icon: Lock, name: 'Lock' },
      { icon: Key, name: 'Key' },
      { icon: Eye, name: 'Eye' },
      { icon: EyeOff, name: 'EyeOff' },
      { icon: UserCheck, name: 'UserCheck' },
      { icon: UserX, name: 'UserX' },
      { icon: Crown, name: 'Crown' },
      { icon: Award, name: 'Award' },
      { icon: Bug, name: 'Bug' },
      { icon: Settings, name: 'Settings' },
      { icon: Cog, name: 'Cog' }
    ],
    servers: [
      { icon: Server, name: 'Server' },
      { icon: Database, name: 'Database' },
      { icon: HardDrive, name: 'HardDrive' },
      { icon: Cpu, name: 'Cpu' },
      { icon: Network, name: 'Network' },
      { icon: Router, name: 'Router' },
      { icon: Monitor, name: 'Monitor' },
      { icon: Terminal, name: 'Terminal' },
      { icon: Activity, name: 'Activity' },
      { icon: BarChart, name: 'BarChart' },
      { icon: TrendingUp, name: 'TrendingUp' },
      { icon: Layers, name: 'Layers' }
    ],
    cloud: [
      { icon: Cloud, name: 'Cloud' },
      { icon: Upload, name: 'Upload' },
      { icon: Download, name: 'Download' },
      { icon: Archive, name: 'Archive' },
      { icon: Package, name: 'Package' },
      { icon: Folder, name: 'Folder' },
      { icon: FileText, name: 'FileText' },
      { icon: Save, name: 'Save' },
      { icon: Copy, name: 'Copy' },
      { icon: FaAws, name: 'AWS' },
      { icon: FaDigitalOcean, name: 'DigitalOcean' },
      { icon: FaDocker, name: 'Docker' }
    ],
    development: [
      { icon: Code, name: 'Code' },
      { icon: Terminal, name: 'Terminal' },
      { icon: FaGithub, name: 'GitHub' },
      { icon: FaGitlab, name: 'GitLab' },
      { icon: FaBitbucket, name: 'Bitbucket' },
      { icon: FaTrello, name: 'Trello' },
      { icon: FaSlack, name: 'Slack' },
      { icon: FaNodeJs, name: 'NodeJS' },
      { icon: FaReact, name: 'React' }
    ],
    hardware: [
      { icon: Cpu, name: 'Processor' },
      { icon: HardDrive, name: 'Storage' },
      { icon: Monitor, name: 'Monitor' },
      { icon: Smartphone, name: 'Mobile' },
      { icon: Tablet, name: 'Tablet' },
      { icon: Printer, name: 'Printer' },
      { icon: Headphones, name: 'Headphones' },
      { icon: Mic, name: 'Microphone' },
      { icon: Speaker, name: 'Speaker' },
      { icon: Camera, name: 'Camera' },
      { icon: Video, name: 'Video' }
    ],
    general: [
      { icon: User, name: 'User' },
      { icon: Users, name: 'Users' },
      { icon: Mail, name: 'Mail' },
      { icon: Phone, name: 'Phone' },
      { icon: Globe, name: 'Globe' },
      { icon: Home, name: 'Home' },
      { icon: Building, name: 'Building' },
      { icon: Car, name: 'Car' },
      { icon: Heart, name: 'Heart' },
      { icon: Star, name: 'Star' },
      { icon: Coffee, name: 'Coffee' },
      { icon: Briefcase, name: 'Briefcase' }
    ],
    categories: [
      { icon: GraduationCap, name: 'Education' },
      { icon: ShoppingCart, name: 'Shopping' },
      { icon: Gamepad2, name: 'Gaming' },
      { icon: Music, name: 'Music' },
      { icon: Camera, name: 'Photography' },
      { icon: MapPin, name: 'Location' },
      { icon: Calendar, name: 'Calendar' },
      { icon: Clock, name: 'Clock' },
      { icon: Timer, name: 'Timer' },
      { icon: Bell, name: 'Bell' },
      { icon: Flag, name: 'Flag' },
      { icon: Tag, name: 'Tag' }
    ],
    infrastructure: [
      { icon: Server, name: 'Server' },
      { icon: Database, name: 'Database' },
      { icon: Network, name: 'Network' },
      { icon: Router, name: 'Router' },
      { icon: Wifi, name: 'WiFi' },
      { icon: Cloud, name: 'Cloud' },
      { icon: Shield, name: 'Security' },
      { icon: Lock, name: 'Encryption' },
      { icon: Activity, name: 'Monitoring' },
      { icon: BarChart, name: 'Analytics' },
      { icon: Settings, name: 'Configuration' },
    ],
    programming: [
      { icon: FaNodeJs, name: 'NodeJS' },
      { icon: FaReact, name: 'React' },
      { icon: FaVuejs, name: 'Vue' },
      { icon: FaAngular, name: 'Angular' },
      { icon: FaPython, name: 'Python' },
      { icon: FaJava, name: 'Java' },
      { icon: FaPhp, name: 'PHP' },
      { icon: FaLaravel, name: 'Laravel' },
      { icon: FaBootstrap, name: 'Bootstrap' },
      { icon: FaSass, name: 'Sass' },
      { icon: FaNpm, name: 'NPM' },
      { icon: FaYarn, name: 'Yarn' }
    ],
    operatingsystems: [
      { icon: Mobile, name: 'iOS' },
      { icon: Chrome, name: 'ChromeOS' },
      { icon: Terminal, name: 'Terminal' },
      { icon: Code, name: 'Shell' },
      { icon: Settings, name: 'System' },
      { icon: Cog, name: 'Config' },
      { icon: Monitor, name: 'Desktop' },
      { icon: Smartphone, name: 'Mobile' }
    ],
    devtools: [
      { icon: FaGithub, name: 'GitHub' },
      { icon: FaGitlab, name: 'GitLab' },
      { icon: FaDocker, name: 'Docker' },
      { icon: FaGulp, name: 'Gulp' },
      { icon: Terminal, name: 'Terminal' },
      { icon: Code, name: 'IDE' },
      { icon: Bug, name: 'Debug' }
    ],
    socialbrands: [
      { icon: FaFacebook, name: 'Facebook' },
      { icon: FaInstagram, name: 'Instagram' },
      { icon: FaTwitter, name: 'Twitter' },
      { icon: FaLinkedin, name: 'LinkedIn' },
      { icon: FaYoutube, name: 'YouTube' },
      { icon: FaTiktok, name: 'TikTok' },
      { icon: FaSnapchat, name: 'Snapchat' },
      { icon: FaPinterest, name: 'Pinterest' },
      { icon: FaReddit, name: 'Reddit' },
      { icon: FaTwitch, name: 'Twitch' },
      { icon: FaWhatsapp, name: 'WhatsApp' },
      { icon: FaTelegram, name: 'Telegram' },
      { icon: FaDiscord, name: 'Discord' },
      { icon: FaSlack, name: 'Slack' },
      { icon: FaVideo, name: 'Zoom' },
      { icon: FaSpotify, name: 'Spotify' },
      { icon: FaDropbox, name: 'Dropbox' },
      { icon: FaPaypal, name: 'PayPal' },
      { icon: FaUber, name: 'Uber' },
      { icon: FaAirbnb, name: 'Airbnb' },
      { icon: FaGoogle, name: 'Google' },
      { icon: FaApple, name: 'Apple' },
      { icon: FaMicrosoft, name: 'Microsoft' },
      { icon: FaAmazon, name: 'Amazon' }
    ]
  };

  const handleIconClick = (iconName) => {
    onIconSelect({ type: 'icon', value: iconName });
    onClose();
  };

  const isSelected = (type, value) => {
    return selectedIcon?.type === type && selectedIcon?.value === value;
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="theme-surface rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-slide-down">
        {/* Header */}
        <div className="flex items-center justify-between p-4 theme-border border-b">
          <h3 className="text-lg font-semibold theme-text">Choose Icon</h3>
          <button
            onClick={onClose}
            className="p-2 theme-text-secondary hover:opacity-80 theme-button-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-96 smooth-scroll scrollbar-cool">
          <div className="space-y-6">
            {Object.entries(iconCategories).map(([category, icons]) => (
              <div key={category}>
                <h4 className="text-sm font-medium theme-text mb-3 capitalize border-b theme-border pb-1">
                  {category === 'socialbrands' ? 'Social & Brands' : 
                   category === 'operatingsystems' ? 'Operating Systems' :
                   category === 'devtools' ? 'Development Tools' :
                   category}
                </h4>
                <div className="grid grid-cols-6 gap-2">
                  {icons.map(({ icon: IconComponent, name }) => (
                    <button
                      key={name}
                      className={`p-3 hover:opacity-80 theme-button-secondary rounded-lg transition-colors flex items-center justify-center ${
                        isSelected('icon', name) ? 'theme-surface ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleIconClick(name)}
                      title={name}
                    >
                      <IconComponent className="w-5 h-5 theme-text-secondary" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 theme-border border-t theme-surface">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                onIconSelect(null); // Remove icon
                onClose();
              }}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Remove Icon
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 theme-button-secondary rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;