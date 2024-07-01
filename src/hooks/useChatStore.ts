'use client'

import { Message } from '@ai-sdk/react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  addChatMessage: (messages: Message[], chatId: string) => void
  updateTitle: (title: string, chatId: string) => void
  deleteChat: (chatId: string) => void
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
      addChatMessage: (messages, chatId) =>
        set((state) => {
          if (!state.chatList[chatId]) return state

          const newChatList = { ...state.chatList }
          newChatList[chatId] = { ...newChatList[chatId], messages: [...newChatList[chatId].messages, ...messages] }
          return { chatList: newChatList }
        }),
      updateTitle: (title, chatId) =>
        set((state) => ({ chatList: { ...state.chatList, [chatId]: { ...state.chatList[chatId], title } } })),
      deleteChat: (chatId) =>
        set((state) => {
          if (!state.chatList[chatId]) return state

          const newChatList = { ...state.chatList }
          delete newChatList[chatId]
          return {
            chatList: newChatList,
            selectedChatId: state.selectedChatId === chatId ? '' : state.selectedChatId
          }
        })
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
