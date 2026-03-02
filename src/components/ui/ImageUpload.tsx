'use client';

import { useState, useRef, useMemo } from 'react';
import { Camera, Upload, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploadProps {
  currentUrl: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ImageUpload({
  currentUrl,
  onUpload,
  onRemove,
  folder = 'products',
  className = '',
  size = 'md',
}: ImageUploadProps) {
  const supabase = useMemo(() => createClient(), []);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-20 w-20',
    md: 'h-32 w-32',
    lg: 'h-40 w-40',
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${ext}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(fileName, file, { upsert: true });

    if (!error) {
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      onUpload(urlData.publicUrl);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      {currentUrl ? (
        <div className={`relative ${sizeClasses[size]} rounded-xl overflow-hidden border-2 border-mint-200`}>
          <Image src={currentUrl} alt="Upload" fill className="object-cover" sizes="160px" />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
            <button
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-white rounded-full shadow-md"
            >
              <Camera size={16} className="text-mint-600" />
            </button>
            {onRemove && (
              <button onClick={onRemove} className="p-2 bg-white rounded-full shadow-md">
                <Trash2 size={16} className="text-red-500" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`${sizeClasses[size]} rounded-xl border-2 border-dashed border-mint-300 bg-mint-50 flex flex-col items-center justify-center gap-1.5 hover:border-mint-400 hover:bg-mint-100 transition-colors disabled:opacity-50`}
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-mint-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload size={20} className="text-mint-500" />
              <span className="text-xs text-mint-600 font-medium">อัพโหลด</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

interface CameraUploadProps {
  onCapture: (url: string) => void;
  label?: string;
}

export function CameraUpload({ onCapture, label = 'ถ่ายรูปหลักฐาน' }: CameraUploadProps) {
  const supabase = useMemo(() => createClient(), []);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `payments/${uuidv4()}.${ext}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(fileName, file, { upsert: true });

    if (!error) {
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      onCapture(urlData.publicUrl);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2.5 bg-mint-100 text-mint-700 rounded-xl font-medium hover:bg-mint-200 transition-colors disabled:opacity-50 w-full justify-center"
      >
        {uploading ? (
          <div className="w-5 h-5 border-2 border-mint-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Camera size={18} />
            <span>{label}</span>
          </>
        )}
      </button>
    </div>
  );
}
