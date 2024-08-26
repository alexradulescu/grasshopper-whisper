'use client'

import { FC, memo, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

import styles from '@/components/styles.module.css'
import { useChatsStore } from '@/hooks/useChatStore'
import { usePromptStore } from '@/hooks/usePromptStore'

function PromptList() {
  const { setSelectedPromptId, promptList } = usePromptStore()

  return (
    <div className={styles.chatHistoryWrapper}>
      {Object.values(promptList).map((prompt) => (
        <div className={styles.chatHistoryItem} key={prompt.id}>
          <button
            key={prompt.id}
            className={styles.chatHistoryButton}
            onClick={() => setSelectedPromptId(prompt.id)}
            popoverTarget="promptModal"
            popoverTargetAction="hide"
          >
            <h2>{prompt.title}</h2>
            <small>{prompt.tags.join(', ')}</small>
            <p>{prompt.prompt}</p>
          </button>
        </div>
      ))}
    </div>
  )
}

function PromptSetup() {
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [tags, setTags] = useState('')
  const { addPrompt } = usePromptStore()

  const handleSavePrompt = () => {
    addPrompt(title, prompt, tags.split(', '))
    setTitle('')
    setPrompt('')
    setTags('')
  }

  return (
    <div id="createPrompt" popover="auto" className={styles.modal}>
      <h2>Setup your own custom prompt</h2>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags" />
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Prompt text" />
      <button onClick={handleSavePrompt}>Save Prompt</button>
    </div>
  )
}

function App() {
  const { selectedPromptId, promptList } = usePromptStore()

  const selectedPrompt = selectedPromptId && promptList[selectedPromptId] ? promptList[selectedPromptId] : null

  return (
    <div className="app">
      {selectedPrompt ? (
        <div className="selected-prompt" style={{ color: '#fff' }}>
          <h2>Selected Prompt</h2>
          <h3>{selectedPrompt.title}</h3>
          <small>{selectedPrompt.tags.join(', ')}</small>
          <p>{selectedPrompt.prompt}</p>
        </div>
      ) : (
        <p>No prompt selected</p>
      )}
      <button popoverTarget="promptModal">Select Prompt</button>
      <div id="promptModal" popover="auto">
        <PromptList />
        <button popoverTarget="createPrompt" id="setup-prompt-button">
          Setup Prompt
        </button>
        <PromptSetup />
      </div>
    </div>
  )
}

export default App

export const ChatConfig: FC = () => {
  const isLtTablet = useMediaQuery('(max-width: 960px)')

  // const { chatList, updatePrompt, selectedChatId } = useChatsStore()
  const { selectedPromptId, promptList } = usePromptStore()

  const selectedPrompt = selectedPromptId && promptList[selectedPromptId] ? promptList[selectedPromptId] : null

  return (
    <div className={styles.chatConfigWrapper} id="chatConfig" {...{ popover: isLtTablet ? 'auto' : undefined }}>
      {selectedPrompt ? (
        <div className="selected-prompt" style={{ color: '#fff' }}>
          <h3>{selectedPrompt.title}</h3>
          <small>{selectedPrompt.tags.join(', ')}</small>
          <p>{selectedPrompt.prompt}</p>
        </div>
      ) : (
        <p>No prompt selected</p>
      )}
      <button popoverTarget="promptModal">Select Prompt</button>
      <div id="promptModal" popover="auto" className={styles.modal}>
        <PromptList />
        <button popoverTarget="createPrompt" id="setup-prompt-button">
          Setup Prompt
        </button>
        <PromptSetup />
      </div>
    </div>
  )
}

export const ChatConfigMemo = memo(ChatConfig)
