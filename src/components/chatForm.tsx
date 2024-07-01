'use client'

import { ChangeEvent, FC, FormEvent, KeyboardEvent } from 'react'

import styles from './styles.module.css'

interface Props {
  handleSendMessage: (e: FormEvent<HTMLFormElement>) => void
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  stop: () => void
  input: string
  isLoading: boolean
}

export const ChatForm: FC<Props> = ({ handleSendMessage, handleInputChange, input, isLoading }) => {
  /** On Enter, send the message. Use Shift + Enter to add new line. */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as unknown as FormEvent<HTMLFormElement>)
    }
  }

  return (
    <form className={styles.chatForm} onSubmit={handleSendMessage}>
      <textarea
        className={styles.chatInput}
        placeholder="Type your question here..."
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoFocus
        value={input}
      ></textarea>
      <span className={styles.chatSendLegend}>&#9166; to Send / shift + &#9166; for New Line</span>
      <button className={styles.chatSendButton} disabled={isLoading}>
        {isLoading ? 'Loading...' : <>Send &#9166;</>}
      </button>
    </form>
  )
}
