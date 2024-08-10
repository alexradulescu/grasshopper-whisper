'use client'

import { ChangeEvent, FC, FormEvent, KeyboardEvent, memo } from 'react'
import { ArrowUDownLeft, Stop } from '@phosphor-icons/react'

import styles from './styles.module.css'

interface Props {
  handleSendMessage: (e: FormEvent<HTMLFormElement>) => void
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  input: string
  isLoading: boolean
}

const ChatForm: FC<Props> = ({ handleSendMessage, handleInputChange, input, isLoading }) => {
  /** On Enter, send the message. Use Shift/Ctrl/Alt/Meta + Enter  to add new line. */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      // Prevent the default behavior
      if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
        e.preventDefault()
        // Add a new line character when Shift + Enter is pressed
        const { selectionStart, selectionEnd } = e.currentTarget
        const newValue = input.slice(0, selectionStart) + '\n' + input.slice(selectionEnd)
        e.currentTarget.value = newValue

        // Update the input state
        handleInputChange({
          target: { value: newValue }
        } as ChangeEvent<HTMLTextAreaElement>)

        // Move the cursor to the next line
        e.currentTarget.selectionStart = selectionStart + 1
        e.currentTarget.selectionEnd = selectionStart + 1
      } else {
        // Send the message when only Enter is pressed
        e.preventDefault()

        handleSendMessage(e as unknown as FormEvent<HTMLFormElement>)
      }
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

const areEqual = (prevProps: Props, nextProps: Props) => {
  return prevProps.input === nextProps.input && prevProps.isLoading === nextProps.isLoading
}

export const ChatFormMemo = memo(ChatForm, areEqual)
