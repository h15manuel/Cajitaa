import React from 'react';
import { Settings as SettingsIcon, Palette, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-4 pt-2 max-w-lg mx-auto">
      <div className="m3-surface-elevated p-5">
        <div className="flex items-center gap-3 mb-4">
          <SettingsIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Ajustes</h2>
        </div>
        <div className="space-y-3">
          <div className="bg-secondary rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Tema y Colores</p>
                <p className="text-xs text-muted-foreground">Personalización de colores próximamente</p>
              </div>
            </div>
          </div>
          <div className="bg-secondary rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Modo Oscuro</p>
                <p className="text-xs text-muted-foreground">Activo por defecto</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
