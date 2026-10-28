import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber,
  defaultMessage = 'Hello Teja, I would like to discuss a website project for my business.',
}) => {
  const { settings } = useSettings();
  const effectiveNumber = phoneNumber || settings?.whatsappNumber || '919490955048';
  const cleanNumber = effectiveNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 group flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:bg-[#20ba5a] hover:scale-105 active:scale-95"
      aria-label="Direct WhatsApp Chat"
    >
      <MessageCircle className="h-4 w-4 fill-white" />
      <span className="hidden sm:inline">WhatsApp Us</span>
      <span className="inline-block h-2 w-2 rounded-full bg-white opacity-80 animate-pulse"></span>
    </a>
  );
};
