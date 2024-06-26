'use client'

import { ChangeEvent, FC, FormEvent } from 'react'

import styles from './styles.module.css'

interface Props {
  handleSendMessage: (e: FormEvent<HTMLFormElement>) => void
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  stop: () => void
  input: string
  isLoading: boolean

}

export const ChatForm: FC<Props> = ({handleSendMessage, handleInputChange, input, isLoading}) => {
  return (
    <form className={styles.chatForm} onSubmit={handleSendMessage}>
      <textarea
        className={styles.chatInput}
        placeholder="Type your question here..."
        onChange={handleInputChange}
        value={input}
      ></textarea>
      <span className={styles.chatSendLegend}>&#9166; to Send / shift + &#9166; for New Line</span>
      <button className={`${styles.chatSendButton} ${isLoading ? styles.isLoading : ''}`} disabled={isLoading}>{isLoading ? 'Stop' : <>Send &#9166;</>}</button>
    </form>
  )
}
