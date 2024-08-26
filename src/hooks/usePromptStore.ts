'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Prompt {
  id: string
  title: string
  prompt: string
  tags: string[]
}

interface PromptStoreState {
  selectedPromptId: string
  promptList: Record<string, Prompt>
  addPrompt: (title: string, prompt: string, tags: string[]) => void
  setSelectedPromptId: (id: string) => void
}

export const usePromptStore = create<PromptStoreState>()(
  persist(
    (set) => ({
      selectedPromptId: '',
      promptList: {},
      setSelectedPromptId: (id) =>
        set((state) => {
          if (state.promptList[id]) {
            return { selectedPromptId: id }
          }

          return state
        }),
      addPrompt: (title, prompt, tags) =>
        set((state) => {
          const newPrompt = {
            id: crypto.randomUUID(),
            title,
            prompt,
            tags
          }
          return { promptList: { [newPrompt.id]: newPrompt, ...state.promptList } }
        })
    }),
    {
      name: 'prompts-zustand-storage'
      // onRehydrateStorage:
      //   ({ setStoreHydrated }) =>
      //   () =>
      //     setStoreHydrated(true)
    }
  )
)
