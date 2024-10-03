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
  chatList: Record<string, Chat>
  isStoreHydrated: boolean
  setStoreHydrated: (isHydrated: boolean) => void
  newChat: (id: string) => void
  addChatMessage: (messages: Message[], chatId: string) => void
  updateProp: (prop: 'title', value: string, chatId: string) => void
  deleteChat: (chatId: string) => void
}

export const useChatsStore = create<ChatsStoreState>()(
  persist(
    (set) => ({
      chatList: {},
      isStoreHydrated: false,
      setStoreHydrated: (isHydrated) => set({ isStoreHydrated: isHydrated }),
      newChat: (id) =>
        set((state) => {
          const newChat = {
            id,
            title: 'New Chat',
            messages: [],
            dateTime: Date.now()
          }

          return { chatList: { [newChat.id]: newChat, ...state.chatList }, selectedChatId: newChat.id }
        }),
      addChatMessage: (messages, chatId) =>
        set((state) => {
          if (!state.chatList[chatId]) return state

          const newChatList = { ...state.chatList }
          newChatList[chatId] = { ...newChatList[chatId], messages: [...messages] }
          return { chatList: newChatList }
        }),
      updateProp: (prop, value, chatId) => {
        set((state) => {
          if (!state.chatList[chatId]) return state

          const newChatList = { ...state.chatList }
          newChatList[chatId] = { ...newChatList[chatId], [prop]: value }
          return { chatList: newChatList }
        })
      },
      deleteChat: (chatId) =>
        set((state) => {
          if (!state.chatList[chatId]) return state

          const newChatList = { ...state.chatList }
          delete newChatList[chatId]
          const newSelectedChatId = Object.keys(newChatList).length ? Object.keys(newChatList)[0] : ''
          return {
            chatList: newChatList,
            selectedChatId: newSelectedChatId
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
