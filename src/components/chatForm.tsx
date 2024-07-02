'use client'

import { ChangeEvent, FC, FormEvent, KeyboardEvent } from 'react'
import { ArrowUDownLeft, Stop } from '@phosphor-icons/react'

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
        placeholder="Type your message here..."
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoFocus
        value={input}
        id="chatInput"
      ></textarea>
      <label className={styles.chatFormFooter} htmlFor="chatInput">
        <span className={styles.chatSendLegend}>&#9166; to Send / SHIFT + &#9166; for new line</span>
        <button className={styles.chatSendButton} data-is-loading={isLoading}>
          {isLoading ? (
            <>
              <Stop size={16} />
              Stop
            </>
          ) : (
            <>
              Send <ArrowUDownLeft size={16} />
            </>
          )}
        </button>
      </label>
    </form>
  )
}
