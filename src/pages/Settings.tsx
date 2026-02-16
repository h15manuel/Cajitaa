import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Palette, Moon, Sun, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

const presetColors = ['#1abc9c', '#3498db', '#9b59b6', '#e74c3c', '#f39c12', '#2ecc71', '#e91e63', '#00bcd4'];

export default function SettingsPage() {
  const [isDark, setIsDark] = useState(() => !document.documentElement.classList.contains('light'));
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('primaryColor') || '#1abc9c');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const applyColor = (hex: string) => {
    const hsl = hexToHSL(hex);
    if (!hsl) return;
    setPrimaryColor(hex);
    localStorage.setItem('primaryColor', hex);
    const val = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
    document.documentElement.style.setProperty('--primary', val);
    document.documentElement.style.setProperty('--ring', val);
    // Compute foreground
    const fgL = hsl.l > 50 ? 6 : 98;
    document.documentElement.style.setProperty('--primary-foreground', `${hsl.h} ${hsl.s}% ${fgL}%`);
  };

  // Restore on mount
  useEffect(() => {
    const saved = localStorage.getItem('primaryColor');
    if (saved) applyColor(saved);
    const theme = localStorage.getItem('theme');
    if (theme === 'light') document.documentElement.classList.add('light');
  }, []);

  return (
    <div className="space-y-4 pt-2 max-w-lg mx-auto">
      {/* Theme toggle */}
      <div className="m3-surface-elevated p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            <div>
              <p className="text-sm font-medium text-foreground">Modo Oscuro</p>
              <p className="text-xs text-muted-foreground">{isDark ? 'Activado' : 'Desactivado'}</p>
            </div>
          </div>
          <Switch checked={isDark} onCheckedChange={setIsDark} />
        </div>
      </div>

      {/* Color picker */}
      <div className="m3-surface-elevated p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-primary" />
          <p className="text-sm font-medium text-foreground">Color Primario</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {presetColors.map(color => (
            <button
              key={color}
              onClick={() => applyColor(color)}
              className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              style={{ backgroundColor: color }}
            >
              {primaryColor === color && <Check className="w-4 h-4 text-white drop-shadow-md" />}
            </button>
          ))}
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Color personalizado (hex)</Label>
          <div className="flex gap-2 mt-1">
            <div className="w-10 h-10 rounded-2xl border border-border" style={{ backgroundColor: primaryColor }} />
            <Input
              value={primaryColor}
              onChange={e => {
                const v = e.target.value;
                setPrimaryColor(v);
                if (/^#[0-9a-fA-F]{6}$/.test(v)) applyColor(v);
              }}
              placeholder="#1abc9c"
              className="rounded-2xl bg-secondary border-border font-mono"
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="m3-surface p-4">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Control de Caja</p>
            <p className="text-xs text-muted-foreground">v1.0 · PWA Material Design 3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
