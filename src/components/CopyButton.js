'use client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CopyButton({ value, className = '', iconSize = 13 }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy"
      className={`inline-flex items-center justify-center transition-colors ${className}`}
    >
      {copied ? <Check size={iconSize} className="text-green-500" /> : <Copy size={iconSize} />}
    </button>
  );
}
