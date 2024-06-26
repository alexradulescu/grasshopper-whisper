'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message } from '@ai-sdk/react'


export interface Chat {
  id: string
  system?: string
  title?: string
  messages: Array<Message>
  dateTime: string | number
}

export interface ChatsStoreState {
  selectedChatId: string
  chatList: Record<string, Chat>
  isStoreHydrated: boolean
  setStoreHydrated: (isHydrated: boolean) => void
  setSelectedChatId: (id: string) => void
  addUpdateChat: (chat: Chat) => void
  setChatList: (updatedChatList: Record<string, Chat>) => void
  updateTitle: (title: string, chatId: string) => void
}

export const useChatsStore = create<ChatsStoreState>()(
  persist(
    (set) => ({
      selectedChatId: '',
      chatList: {},
      isStoreHydrated: false,
      setStoreHydrated: (isHydrated) => set({ isStoreHydrated: isHydrated }),
      setSelectedChatId: (id) => set({ selectedChatId: id }),
      addUpdateChat: (chat) => set((state) => ({ chatList: { ...state.chatList, [chat.id]: chat } })),
      updateTitle: (title, chatId) =>
        set((state) => ({ chatList: { ...state.chatList, [chatId]: { ...state.chatList[chatId], title } } })),
      setChatList: (updatedChatList) => set((state) => ({ chatList: updatedChatList }))
    }),
    {
      name: 'chats-zustand-storage',
      onRehydrateStorage:
        ({ setStoreHydrated }) =>
        () =>
          setStoreHydrated(true)
    }
  )
)