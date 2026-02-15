import React from 'react';
import { Search, Truck } from 'lucide-react';

export default function Fleet() {
  return (
    <div className="space-y-4 pt-2 max-w-lg mx-auto">
      <div className="m3-surface-elevated p-5">
        <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 h-12">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            placeholder="Buscar patente o empresa..."
            className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="text-center py-16 text-muted-foreground">
        <Truck className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium">Buscador de Flota</p>
        <p className="text-sm mt-1">Próximamente: búsqueda fuzzy de patentes y empresas</p>
      </div>
    </div>
  );
}
