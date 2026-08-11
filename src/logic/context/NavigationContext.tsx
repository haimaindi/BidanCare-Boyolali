import React, { createContext, useContext, useState, ReactNode } from "react";

interface NavigationContextType {
  activeModule: string;
  setActiveModule: (module: string) => void;
  jumpToPemeriksaan: (patientData: any, readOnly?: boolean, returnModule?: string) => void;
  pendingPatient: any | null;
  isPemeriksaanReadOnly: boolean;
  returnToModule: string | null;
  clearPendingPatient: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children, initialModule }: { children: ReactNode; initialModule: string }) {
  const [activeModule, setActiveModule] = useState(initialModule);
  const [pendingPatient, setPendingPatient] = useState<any | null>(null);
  const [isPemeriksaanReadOnly, setIsPemeriksaanReadOnly] = useState(false);
  const [returnToModule, setReturnToModule] = useState<string | null>(null);

  const jumpToPemeriksaan = (patientData: any, readOnly: boolean = false, returnModule: string | null = null) => {
    setPendingPatient(patientData);
    setIsPemeriksaanReadOnly(readOnly);
    setReturnToModule(returnModule);
    setActiveModule("antrean-pemeriksaan");
  };

  const clearPendingPatient = () => {
    setPendingPatient(null);
    setIsPemeriksaanReadOnly(false);
    // Note: we don't clear returnToModule here, we let the module consume it
  };

  return (
    <NavigationContext.Provider value={{ 
      activeModule, 
      setActiveModule, 
      jumpToPemeriksaan, 
      pendingPatient, 
      isPemeriksaanReadOnly,
      returnToModule,
      clearPendingPatient 
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
