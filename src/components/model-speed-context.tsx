"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Model, SpeedTier } from "@/data/types";

export type SpeedMode = "standard" | "fast" | "ultrafast";

type SpeedModeContextValue = {
  mode: SpeedMode;
  setMode: (mode: SpeedMode) => void;
  availableModes: SpeedMode[];
  activeModel: Model;
};

const SpeedModeContext = createContext<SpeedModeContextValue | null>(null);

function withSpeedTier(base: Model, tier?: SpeedTier): Model {
  if (!tier) return base;
  return {
    ...base,
    pricing: tier.pricing,
    speed: tier.speed ?? base.speed,
  };
}

export function SpeedModeProvider({
  baseModel,
  children,
}: {
  baseModel: Model;
  children: ReactNode;
}) {
  const [mode, setMode] = useState<SpeedMode>("standard");
  const availableModes: SpeedMode[] = [
    "standard",
    ...(baseModel.fast ? (["fast"] as const) : []),
    ...(baseModel.ultrafast ? (["ultrafast"] as const) : []),
  ];
  const tier =
    mode === "fast"
      ? baseModel.fast
      : mode === "ultrafast"
        ? baseModel.ultrafast
        : undefined;
  return (
    <SpeedModeContext.Provider
      value={{
        mode,
        setMode,
        availableModes,
        activeModel: withSpeedTier(baseModel, tier),
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
