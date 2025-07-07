import React, { useState } from 'react';
import { 
  Globe, Lock, Mail, User, CreditCard, Shield, Key, Phone, 
  Home, Building, Car, Gamepad2, Music, Camera, ShoppingCart,
  Heart, Star, Coffee, Briefcase, GraduationCap, MapPin,
  Monitor, Smartphone, Tablet, Wifi, Cloud, Download,
  Upload, Link, Hash, AtSign, Send, Bookmark, X
} from 'lucide-react';

// Brand icons from react-icons
import {
  FaGoogle, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube,
  FaSpotify, FaApple, FaMicrosoft, FaAmazon, FaFilm, FaDropbox,
  FaGithub, FaSlack, FaDiscord, FaTelegram, FaWhatsapp, FaTiktok,
  FaSnapchat, FaPinterest, FaReddit, FaTwitch, FaUber, FaAirbnb,
  FaPaypal, FaSkype, FaVideo, FaFileImage
} from 'react-icons/fa';

import {
  SiAdobe, SiApple, SiGoogle, SiAmazon, SiNetflix,
  SiSpotify, SiDropbox, SiGithub, SiSlack, SiDiscord, SiTelegram,
  SiWhatsapp, SiInstagram, SiLinkedin, SiYoutube,
  SiFacebook, SiTiktok, SiSnapchat, SiPinterest, SiReddit,
  SiTwitch, SiUber, SiAirbnb, SiPaypal, SiZoom,
  SiNotion, SiTrello, SiAsana, SiJira, SiConfluence, SiCanva, SiMicrosoft
} from 'react-icons/si';

const IconPicker = ({ selectedIcon, onIconSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState('emojis');

  // Popular emojis for different categories
  const emojiCategories = {
    popular: ['🔐', '🌐', '📧', '💳', '🏦', '🛒', '🎮', '📱', '💻', '🏠', '🚗', '✈️', '🏢', '📊', '💼', '🎵', '📷', '☕', '💖', '⭐'],
    social: ['📘', '📷', '🐦', '💼', '📺', '🎵', '📱', '💬', '📞', '📧', '👥', '🌐', '📝', '📋', '🔗', '📢', '🎯', '📺', '🎬', '🎪'],
    work: ['💼', '📊', '📈', '💻', '🖥️', '📧', '📁', '📋', '📝', '🏢', '💳', '🏦', '📞', '📠', '🖨️', '💾', '📤', '📥', '🗂️', '📎'],
    entertainment: ['🎮', '🎵', '🎬', '📺', '🎯', '🎲', '🃏', '🎪', '🎨', '📚', '📖', '🎭', '🎤', '🎸', '🎹', '🥁', '🎺', '🎻', '🎧', '📻']
  };

  // Icon categories with brands and general icons
  const iconCategories = {
    general: [
      { icon: Lock, name: 'Lock' },
      { icon: Mail, name: 'Mail' },
      { icon: User, name: 'User' },
      { icon: CreditCard, name: 'CreditCard' },
      { icon: Shield, name: 'Shield' },
      { icon: Key, name: 'Key' },
      { icon: Phone, name: 'Phone' },
      { icon: Globe, name: 'Globe' }
    ],
    categories: [
      { icon: Home, name: 'Home' },
      { icon: Building, name: 'Work' },
      { icon: Car, name: 'Transportation' },
      { icon: Briefcase, name: 'Business' },
      { icon: GraduationCap, name: 'Education' },
      { icon: ShoppingCart, name: 'Shopping' },
      { icon: Gamepad2, name: 'Gaming' },
      { icon: Music, name: 'Music' },
      { icon: Camera, name: 'Photography' },
      { icon: Heart, name: 'Health' },
      { icon: Star, name: 'Favorites' },
      { icon: Coffee, name: 'Food' }
    ],
    tech: [
      { icon: Monitor, name: 'Desktop' },
      { icon: Smartphone, name: 'Mobile' },
      { icon: Tablet, name: 'Tablet' },
      { icon: Wifi, name: 'Network' },
      { icon: Cloud, name: 'Cloud' },
      { icon: Download, name: 'Download' },
      { icon: Upload, name: 'Upload' },
      { icon: Link, name: 'Website' },
      { icon: Hash, name: 'Social' },
      { icon: AtSign, name: 'Email' },
      { icon: Send, name: 'Messages' },
      { icon: Bookmark, name: 'Bookmarks' }
    ],
    brands: [
      // Tech Giants
      { icon: FaGoogle, name: 'Google' },
      { icon: FaApple, name: 'Apple' },
      { icon: FaMicrosoft, name: 'Microsoft' },
      { icon: FaAmazon, name: 'Amazon' },
      { icon: SiAdobe, name: 'Adobe' },
      
      // Social Media
      { icon: FaFacebook, name: 'Facebook' },
      { icon: FaInstagram, name: 'Instagram' },
      { icon: FaTwitter, name: 'Twitter' },
      { icon: FaLinkedin, name: 'LinkedIn' },
      { icon: FaTiktok, name: 'TikTok' },
      { icon: FaSnapchat, name: 'Snapchat' },
      { icon: FaPinterest, name: 'Pinterest' },
      { icon: SiReddit, name: 'Reddit' },
      
      // Entertainment
      { icon: FaYoutube, name: 'YouTube' },
      { icon: SiNetflix, name: 'Netflix' },
      { icon: SiSpotify, name: 'Spotify' },
      { icon: SiTwitch, name: 'Twitch' },
      
      // Communication
      { icon: FaWhatsapp, name: 'WhatsApp' },
      { icon: FaTelegram, name: 'Telegram' },
      { icon: FaDiscord, name: 'Discord' },
      { icon: FaSlack, name: 'Slack' },
      { icon: FaSkype, name: 'Skype' },
      { icon: FaVideo, name: 'Zoom' },
      
      // Productivity
      { icon: FaGithub, name: 'GitHub' },
      { icon: FaDropbox, name: 'Dropbox' },
      { icon: SiNotion, name: 'Notion' },
      { icon: SiTrello, name: 'Trello' },
      { icon: SiJira, name: 'Jira' },
      { icon: SiCanva, name: 'Canva' },
      
      // Services
      { icon: FaPaypal, name: 'PayPal' },
      { icon: SiUber, name: 'Uber' },
      { icon: SiAirbnb, name: 'Airbnb' }
    ]
  };

  const handleEmojiClick = (emoji) => {
    onIconSelect({ type: 'emoji', value: emoji });
    onClose();
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
      <div className="theme-surface rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
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

        {/* Tabs */}
        <div className="flex theme-border border-b">
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'emojis'
                ? 'theme-primary border-b-2 theme-surface'
                : 'theme-text-secondary hover:opacity-80'
            }`}
            onClick={() => setActiveTab('emojis')}
          >
            😀 Emojis
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'icons'
                ? 'theme-primary border-b-2 theme-surface'
                : 'theme-text-secondary hover:opacity-80'
            }`}
            onClick={() => setActiveTab('icons')}
          >
            🎨 Icons
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-96 smooth-scroll scrollbar-cool">
          {activeTab === 'emojis' ? (
            <div className="space-y-4">
              {Object.entries(emojiCategories).map(([category, emojis]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium theme-text mb-2 capitalize">
                    {category}
                  </h4>
                  <div className="grid grid-cols-8 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        className={`p-2 text-xl hover:opacity-80 theme-button-secondary rounded-lg transition-colors ${
                          isSelected('emoji', emoji) ? 'theme-surface ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => handleEmojiClick(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(iconCategories).map(([category, icons]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium theme-text mb-2 capitalize">
                    {category}
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
          )}
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