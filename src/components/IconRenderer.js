import React from 'react';
import { 
  Globe, Lock, Mail, User, CreditCard, Shield, Key, Phone, 
  Home, Building, Car, Gamepad2, Music, Camera, ShoppingCart,
  Heart, Star, Coffee, Briefcase, GraduationCap, MapPin,
  Monitor, Smartphone, Tablet, Wifi, Cloud, Download,
  Upload, Link, Hash, AtSign, Send, Bookmark
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

const IconRenderer = ({ icon, className = "w-5 h-5", fallback = "🔐" }) => {
  // Map of icon names to components
  const lucideIconMap = {
    Globe, Lock, Mail, User, CreditCard, Shield, Key, Phone,
    Home, Building, Car, Gamepad2, Music, Camera, ShoppingCart,
    Heart, Star, Coffee, Briefcase, GraduationCap, MapPin,
    Monitor, Smartphone, Tablet, Wifi, Cloud, Download,
    Upload, Link, Hash, AtSign, Send, Bookmark
  };
  
  // Maps for FontAwesome and Simple Icons
  const faIconMap = {
    FaGoogle, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube,
    FaSpotify, FaApple, FaMicrosoft, FaAmazon, FaFilm, FaDropbox,
    FaGithub, FaSlack, FaDiscord, FaTelegram, FaWhatsapp, FaTiktok,
    FaSnapchat, FaPinterest, FaReddit, FaTwitch, FaUber, FaAirbnb,
    FaPaypal, FaSkype, FaVideo, FaFileImage
  };
  
  const siIconMap = {
    SiAdobe, SiApple, SiGoogle, SiAmazon, SiNetflix,
    SiSpotify, SiDropbox, SiGithub, SiSlack, SiDiscord, SiTelegram,
    SiWhatsapp, SiInstagram, SiLinkedin, SiYoutube,
    SiFacebook, SiTiktok, SiSnapchat, SiPinterest, SiReddit,
    SiTwitch, SiUber, SiAirbnb, SiPaypal, SiZoom,
    SiNotion, SiTrello, SiAsana, SiJira, SiConfluence, SiCanva
  };

  if (!icon) {
    // Default fallback emoji
    return <span className="text-lg">{fallback}</span>;
  }

  if (icon.type === 'emoji') {
    return <span className="text-lg">{icon.value}</span>;
  }

  if (icon.type === 'icon') {
    // Try to find the icon in all icon maps
    const LucideIcon = lucideIconMap[icon.value];
    if (LucideIcon) {
      return <LucideIcon className={className} />;
    }
    
    // Check if it's a brand icon with Fa or Si prefix
    const faName = `Fa${icon.value}`;
    const siName = `Si${icon.value}`;
    
    const FaIcon = faIconMap[faName];
    if (FaIcon) {
      return <FaIcon className={className} />;
    }
    
    const SiIcon = siIconMap[siName];
    if (SiIcon) {
      return <SiIcon className={className} />;
    }
    
    // If the icon has an exact match in any map
    const FaExact = faIconMap[icon.value];
    if (FaExact) {
      return <FaExact className={className} />;
    }
    
    const SiExact = siIconMap[icon.value];
    if (SiExact) {
      return <SiExact className={className} />;
    }
  }

  // Fallback if icon not found
  return <span className="text-lg">{fallback}</span>;
};

export default IconRenderer;