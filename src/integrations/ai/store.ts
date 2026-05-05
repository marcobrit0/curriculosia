import type { WritableDraft } from "immer";

import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { create } from "zustand/react";

export type AIProvider = "vercel-ai-gateway" | "openai" | "gemini" | "anthropic" | "ollama";

type TestStatus = "unverified" | "success" | "failure";

// Local preference for which credential path to use. Authoritative dispatch
// happens server-side based on FLAG_AI_MODE + plan; this is only a UX hint.
export type AIMode = "byo" | "managed";

type AIStoreState = {
  enabled: boolean;
  mode: AIMode;
  provider: AIProvider;
  model: string;
  apiKey: string;
  baseURL: string;
  testStatus: TestStatus;
};

type AIStoreActions = {
  canEnable: () => boolean;
  setEnabled: (value: boolean) => void;
  setMode: (value: AIMode) => void;
  set: (fn: (draft: WritableDraft<AIStoreState>) => void) => void;
  reset: () => void;
};

type AIStore = AIStoreState & AIStoreActions;

const initialState: AIStoreState = {
  enabled: false,
  mode: "byo",
  provider: "openai",
  model: "",
  apiKey: "",
  baseURL: "",
  testStatus: "unverified",
};

export const useAIStore = create<AIStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      set: (fn) => {
        set((draft) => {
          const prev = {
            provider: draft.provider,
            model: draft.model,
            apiKey: draft.apiKey,
            baseURL: draft.baseURL,
          };

          fn(draft);

          if (
            draft.provider !== prev.provider ||
            draft.model !== prev.model ||
            draft.apiKey !== prev.apiKey ||
            draft.baseURL !== prev.baseURL
          ) {
            draft.testStatus = "unverified";
            draft.enabled = false;
          }
        });
      },
      reset: () => set(() => initialState),
      canEnable: () => {
        const { mode, testStatus } = get();
        if (mode === "managed") return true;
        return testStatus === "success";
      },
      setEnabled: (value: boolean) => {
        const canEnable = get().canEnable();
        if (value && !canEnable) return;
        set((draft) => {
          draft.enabled = value;
        });
      },
      setMode: (value: AIMode) => {
        set((draft) => {
          if (draft.mode === value) return;
          draft.mode = value;
          // Switching mode invalidates the BYO test result; let the user re-enable.
          draft.enabled = value === "managed";
          if (value === "byo") {
            draft.testStatus = "unverified";
          }
        });
      },
    })),
    {
      name: "ai-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        enabled: state.enabled,
        mode: state.mode,
        provider: state.provider,
        model: state.model,
        apiKey: state.apiKey,
        baseURL: state.baseURL,
        testStatus: state.testStatus,
      }),
    },
  ),
);
