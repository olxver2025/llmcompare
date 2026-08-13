"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Model } from "@/data/types";

type SpeedModeContextValue = {
  fast: boolean;
  setFast: (fast: boolean) => void;
  activeModel: Model;
};

const SpeedModeContext = createContext<SpeedModeContextValue | null>(null);

function withFastTier(base: Model): Model {
  if (!base.fast) return base;
  return {
    ...base,
    pricing: base.fast.pricing,
    speed: base.fast.speed ?? base.speed,
  };
}

export function SpeedModeProvider({
  baseModel,
  children,
}: {
  baseModel: Model;
  children: ReactNode;
}) {
  const [fast, setFast] = useState(false);
  return (
    <SpeedModeContext.Provider
      value={{
        fast,
        setFast,
        activeModel: fast ? withFastTier(baseModel) : baseModel,
      }}
    >
      {children}
    </SpeedModeContext.Provider>
  );
}

export function useSpeedMode(): SpeedModeContextValue {
  const ctx = useContext(SpeedModeContext);
  if (!ctx) {
    throw new Error("useSpeedMode must be used within a SpeedModeProvider");
  }
  return ctx;
}
