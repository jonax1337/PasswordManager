import React from 'react';
import { 
  Globe, Lock, Mail, User, CreditCard, Shield, Key, Phone, 
  Home, Building, Car, Gamepad2, Music, Camera, ShoppingCart,
  Heart, Star, Coffee, Briefcase, GraduationCap, MapPin,
  Monitor, Smartphone, Tablet, Wifi, Cloud, Download,
  Upload, Link, Hash, AtSign, Send, Bookmark,
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
  Play, Pause, SkipBack, SkipForward, Volume2,
  Image, Video, Music2, Headphones, Mic, Speaker,
  Printer, Phone as PhoneIcon,
  MessageCircle, MessageSquare, Mail as MailIcon, Send as SendIcon,
  Facebook, Instagram, Twitter, Linkedin, Youtube,
  Github, Slack, Chrome, Apple, Smartphone as Mobile
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

const IconRenderer = ({ icon, className = "w-5 h-5", fallback }) => {
  // Map of icon names to components
  const lucideIconMap = {
    Globe, Lock, Mail, User, CreditCard, Shield, Key, Phone,
    Home, Building, Car, Gamepad2, Music, Camera, ShoppingCart,
    Heart, Star, Coffee, Briefcase, GraduationCap, MapPin,
    Monitor, Smartphone, Tablet, Wifi, Cloud, Download,
    Upload, Link, Hash, AtSign, Send, Bookmark,
    Server, Database, HardDrive, Cpu, Network, Router,
    Settings, Cog, Wrench, Bug, Code, Terminal,
    FileText, Folder, Archive, Package, Layers, Activity,
    BarChart, TrendingUp, DollarSign, CreditCardIcon,
    Users, UserCheck, UserX, Crown, Award, Medal,
    Calendar, Clock, Timer, Bell, Flag, Tag,
    Search, Filter, SortAsc, SortDesc, List, Grid,
    Eye, EyeOff, Edit, Trash2, Plus, Minus,
    Save, Copy, Undo, Redo,
    ZoomIn, ZoomOut, Maximize, Minimize, RotateCcw,
    Play, Pause, SkipBack, SkipForward, Volume2,
    Image, Video, Music2, Headphones, Mic, Speaker,
    Printer, PhoneIcon,
    MessageCircle, MessageSquare, MailIcon, SendIcon,
    Facebook, Instagram, Twitter, Linkedin, Youtube,
    Github, Slack, Chrome, Mobile
  };
  
  // Maps for FontAwesome icons
  const faIconMap = {
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
  };

  if (!icon) {
    // Default fallback - Key icon for entries, custom fallback for folders
    if (fallback) {
      return <span className="text-lg">{fallback}</span>;
    }
    return <Key className={className} />;
  }


  if (icon.type === 'icon') {
    // Try to find the icon in all icon maps
    const LucideIcon = lucideIconMap[icon.value];
    if (LucideIcon) {
      return <LucideIcon className={className} />;
    }
    
    // Check if it's a brand icon with Fa prefix
    const faName = `Fa${icon.value}`;
    
    const FaIcon = faIconMap[faName];
    if (FaIcon) {
      return <FaIcon className={className} />;
    }
    
    // If the icon has an exact match in FontAwesome map
    const FaExact = faIconMap[icon.value];
    if (FaExact) {
      return <FaExact className={className} />;
    }
  }

  // Fallback if icon not found
  if (fallback) {
    return <span className="text-lg">{fallback}</span>;
  }
  return <Key className={className} />;
};

export default IconRenderer;