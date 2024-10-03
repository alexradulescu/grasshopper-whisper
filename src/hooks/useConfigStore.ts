'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Prompt {
  id: string
  title: string
  prompt: string
  tags: string[]
}

interface ConfigStoreState {
  selectedPromptId: string | null
  promptList: Record<string, Prompt>
  addPrompt: (title: string, prompt: string, tags: string[]) => void
  editPrompt: (id: string, title: string, prompt: string, tags: string[]) => void
  deletePrompt: (id: string) => void
  setSelectedPromptId: (id: string | null) => void
  prompt?: string | null
  model?: string | null
  channel?: string | null
  temperature?: number | null
  topP?: number | null
  maxTokens?: number | null
  updateProp: (
    prop: 'model' | 'channel' | 'temperature' | 'topP' | 'maxTokens' | 'prompt',
    value: number | string | null
  ) => void
}

export const getCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.toLocaleString('default', { month: 'short' }) // 'short' gives abbreviated month name
  const day = String(now.getDate()).padStart(2, '0') // Ensure two digits for day

  return `${year}-${month}-${day}`
}

const BASE_PROMPT = `You are ChatGPT, an AI language model designed to assist users by providing helpful and accurate information. Current date: <CURRENT_DATE>. 
When interacting with users, adhere to the following principles:
Understand the Query: Accurately comprehend the user's question or request.
Provide Relevant Information: Offer information that is pertinent to the query, drawing on a wide range of knowledge.
Be Clear and Concise: Ensure that responses are easy to understand and to the point.
Maintain a Conversational Tone: Interact in a way that feels natural and engaging, similar to a human conversation.
Adapt to User Preferences: Tailor responses based on the user's stated preferences and context.
Acknowledge Knowledge Gaps: If you don't know the answer to a query, acknowledge this and do not generate false or inaccurate information.
Request Additional Information: If more information is needed to provide a quality answer, ask the user for the extra details you need.`

const DEFAULT_PROMPT: Prompt = {
  id: 'defaultPrompt',
  title: 'Default BullsAI prompt',
  prompt: BASE_PROMPT,
  tags: ['default']
}

export const useConfigStore = create<ConfigStoreState>()(
  persist(
    (set) => ({
      selectedPromptId: '',
      promptList: { [DEFAULT_PROMPT.id]: DEFAULT_PROMPT },
      setSelectedPromptId: (id) =>
        set((state) => {
          if (id === null) {
            return { selectedPromptId: DEFAULT_PROMPT.id }
          }

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
        }),
      deletePrompt: (id) =>
        set((state) => {
          if (id === DEFAULT_PROMPT.id) {
            return state.promptList
          }

          const { [id]: _, ...rest } = state.promptList

          if (state.selectedPromptId === id) {
            return { selectedPromptId: DEFAULT_PROMPT.id, promptList: rest }
          }

          return { promptList: rest }
        }),
      editPrompt: (id, title, prompt, tags) =>
        set((state) => {
          if (!state.promptList[id]) return state

          const newPromptList = { ...state.promptList }
          newPromptList[id] = { ...newPromptList[id], title, prompt, tags }
          return { promptList: newPromptList }
        }),
      updateProp: (prop, value) => {
        set(() => {
          return { [prop]: value }
        })
      }
    }),
    {
      name: 'config-zustand-storage'
      // onRehydrateStorage:
      //   ({ setStoreHydrated }) =>
      //   () =>
      //     setStoreHydrated(true)
    }
  )
)
