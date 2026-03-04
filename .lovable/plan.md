

# Plan: Editar movimientos + Eliminar cajero de depósitos

## Cambios

### 1. Eliminar campo "cajero" de depósitos (`src/components/EntryDialog.tsx`)
- Cambiar `entryConfig[DEPOSIT].needsCashier` de `true` a `false`
- El campo cajero ya no se mostrará para depósitos

### 2. Agregar función `editEntry` al estado (`src/hooks/useAppState.ts`)
- Nueva función `editEntry(id, updates)` que busca el entry por ID y actualiza los campos proporcionados (amount, observation, company)
- Recalcula `tipsTotal` si se edita una propina

### 3. Crear componente `EditEntryDialog` (`src/components/EditEntryDialog.tsx`)
- Dialog que recibe un `CashEntry` existente y permite editar:
  - **Monto** (todos los tipos)
  - **Empresa** (solo créditos)
  - **Observación** (todos los tipos)
- Pre-llena los campos con los valores actuales
- Al confirmar, llama a `editEntry`

### 4. Hacer clickeables los movimientos en el Dashboard (`src/pages/Index.tsx`)
- Cada entry en "Movimientos de Hoy" abre el `EditEntryDialog` al hacer click
- Eliminar referencia a `entry.cashier` en la visualización de depósitos

### 5. Exponer `editEntry` en el contexto (`src/contexts/AppContext.tsx`)
- Ya se expone automáticamente vía `ReturnType<typeof useAppState>`

