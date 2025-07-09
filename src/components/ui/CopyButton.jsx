import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * Eine wiederverwendbare Komponente zum Kopieren von Text mit Animations-Feedback
 * @param {Object} props - Komponenten-Props
 * @param {string} props.textToCopy - Der zu kopierende Text
 * @param {string} props.label - Optionaler Tooltip-Text (default: "Copy")
 * @param {number} props.size - Größe des Icons (default: 3 = 3/4 der Standardgröße)
 * @param {string} props.className - Zusätzliche CSS-Klassen
 * @param {function} props.onCopied - Callback-Funktion, die nach dem Kopieren aufgerufen wird
 */
const CopyButton = ({ 
  textToCopy, 
  label = "Copy", 
  size = 3,
  className = "",
  onCopied = () => {}
}) => {
  const [copied, setCopied] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  // Reset-Animation nach dem Kopieren
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setAnimateOut(true);
        setTimeout(() => {
          setCopied(false);
          setAnimateOut(false);
        }, 300); // Dauer der Fade-Out-Animation
      }, 1500); // Wie lange das Häkchen angezeigt wird
      
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    if (!textToCopy) return;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        onCopied(textToCopy);
      })
      .catch(err => {
        console.error('Fehler beim Kopieren:', err);
      });
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 theme-text-secondary hover:opacity-80 theme-button-secondary 
        rounded-md transition-colors relative ${className}`}
      title={`${label} ${copied ? '(copied!)' : ''}`}
      disabled={copied}
    >
      {!copied ? (
        <Copy className={`w-${size} h-${size}`} />
      ) : (
        <div className={`transition-opacity duration-300 ${animateOut ? 'opacity-0' : 'opacity-100'}`}>
          <Check className={`w-${size} h-${size} text-green-500`} />
        </div>
      )}
    </button>
  );
};

export default CopyButton;
