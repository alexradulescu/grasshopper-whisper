'use client'

import { FC, FormEvent, memo, useEffect, useMemo, useState } from 'react'
import { Pencil, Question, TrashSimple } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { useMediaQuery } from 'usehooks-ts'

import styles from '@/components/styles.module.css'
import { Tooltip } from '@/components/Tooltip'
import { useChatsStore } from '@/hooks/useChatStore'
import { usePromptStore } from '@/hooks/usePromptStore'

const PromptSetup = () => {
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [tags, setTags] = useState('')
  const { addPrompt } = usePromptStore()

  const reset = () => {
    setTitle('')
    setPrompt('')
    setTags('')
  }

  const handleSavePrompt = (e: FormEvent) => {
    e.preventDefault()
    if (!title || !prompt || !tags) return

    addPrompt(title, prompt, tags.split(', '))
    reset()
  }

  return (
    <div id="createPrompt" popover="auto" className={styles.modal}>
      <form onSubmit={handleSavePrompt} className={styles.vStack}>
        <h2 className={styles.heading}>Setup your own custom prompt</h2>
        <label className={styles.formControl}>
          <span className={styles.label}>Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My special prompt"
            required
            className={styles.input}
          />
        </label>
        <label className={styles.formControl}>
          <span className={styles.label}>Tags</span>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="eg. web, hr, engineer, testing"
            required
            className={styles.input}
          />
        </label>
        <label className={styles.formControl}>
          <span className={styles.label}>Prompt</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="eg. You are an expert ____ and _____"
            required
            className={styles.input}
          />
        </label>
        <button className={styles.button}>Save Prompt</button>
        <button
          className={styles.button}
          popoverTarget="createPrompt"
          popoverTargetAction="hide"
          type="button"
          onClick={reset}
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

const PromptSetupMemo = memo(PromptSetup)

const PromptsModal = () => {
  const { setSelectedPromptId, promptList, deletePrompt } = usePromptStore()

  const handleEditPrompt = (id: string) => {
    // Noop for now
  }

  return (
    <section id="promptModal" popover="auto" className={styles.modal}>
      <div className={clsx(styles.vStack)}>
        <div className={clsx(styles.hStack, styles.spaceBetween, styles.alignItemsCenter, styles.fs5)}>
          <h2 className={clsx(styles.text, styles.colorGrey100, styles.fs5)}>Select a prompt</h2>
          <button
            popoverTarget="createPrompt"
            id="setup-prompt-button"
            className={clsx(styles.button, styles.colorGreen)}
          >
            Create Prompt
          </button>
        </div>
        <div className={styles.list}>
          {Object.keys(promptList).length
            ? Object.values(promptList).map((prompt) => (
                <div key={prompt.id} className={clsx(styles.hStack)}>
                  <button
                    className={styles.listItem}
                    onClick={() => setSelectedPromptId(prompt.id)}
                    popoverTarget="promptModal"
                    popoverTargetAction="hide"
                  >
                    <div className={styles.hStack}>
                      <h2>{prompt.title}</h2>
                      <div className={styles.tagList}>
                        {prompt.tags.map((tag) => (
                          <span className={styles.tag} key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p>{prompt.prompt}</p>
                  </button>
                  <button
                    className={clsx(styles.button, styles.colorRed, styles.sizeSmall)}
                    onClick={() => deletePrompt(prompt.id)}
                  >
                    <TrashSimple size={16} weight="bold" />
                  </button>
                  <button className={clsx(styles.button, styles.sizeSmall)} onClick={() => handleEditPrompt(prompt.id)}>
                    <Pencil size={16} weight="bold" />
                  </button>
                </div>
              ))
            : 'No prompts available, feel free to create some'}
        </div>
        <button
          className={clsx(styles.button, styles.fullWidth)}
          popoverTarget="promptModal"
          popoverTargetAction="hide"
        >
          Close
        </button>
      </div>
      <PromptSetupMemo />
    </section>
  )
}

const PromptsModalMemo = memo(PromptsModal)

export const DEFAULT_CHAT_CONFIG = {
  model: 'gpt-4o-2024-08-06',
  channel: 'default',
  temperature: 0.5,
  topP: 0.9,
  maxTokens: 16_384
}

/** Hardcoding default config for now. */
const CONFIG = {
  models: [
    { name: 'OpenAI GPT-4o', value: 'gpt-4o-2024-08-06', maxTokens: 16_384 },
    { name: 'OpenAI GPT-4o Mini', value: 'gpt-4o-mini-2024-07-18', maxTokens: 16_384 },
    { name: 'OpenAI GPT o1 Mini', value: 'o1-mini', maxTokens: 32_768 },
    { name: 'OpenAI GPT o1 Preview', value: 'o1-preview', maxTokens: 32_768 },
    /** For Claude, maxOutputTokens could be 8_192 but not by default according to https://docs.anthropic.com/en/docs/about-claude/models */
    // { name: 'Claude 3.5 Sonnet', value: 'claude-3.5', maxTokens: 4_096 },
    /** Assuming we're using gemini 1.5 pro or flash */
    // { name: 'Google Gemini 1.5 Pro', value: 'gemini-1.5-pro', maxTokens: 8_192 },
    /** Max Output Tokens according to https://context.ai/model/llama3-1-8b-instruct-v1. Could be 4_096 also according to less clear sources */
    // { name: 'Llama 3.1', value: 'llama-3.1', maxTokens: 2_048 }
  ],
  channels: [
    {
      name: 'Default/External',
      value: 'default',
      description: 'Default AI channel with no access to internal data',
      defaultTemperature: 0.5,
      defaultTopP: 0.9
    },
    // {
    //   name: 'Confluence',
    //   value: 'confluence',
    //   description: 'AI channel with access to Bullish Confluence internal data',
    //   defaultTemperature: 0.7,
    //   defaultTopP: 0.9
    // },
    // {
    //   name: 'Coindesk',
    //   value: 'coindesk',
    //   description: 'AI channel with access to Coindesk internal data',
    //   defaultTemperature: 0.7,
    //   defaultTopP: 0.9
    // }
  ]
}

interface Props {
  isConfigOpen: boolean
}

export const ChatConfig: FC<Props> = ({ isConfigOpen }) => {
  const isLtTablet = useMediaQuery('(max-width: 960px)')

  const { chatList, selectedChatId, updateProp } = useChatsStore()
  const { selectedPromptId, promptList, setSelectedPromptId } = usePromptStore()

  const selectedPrompt = useMemo(
    () => (selectedPromptId && promptList[selectedPromptId] ? promptList[selectedPromptId] : null),
    [selectedPromptId, promptList]
  )

  const selectedChat = chatList[selectedChatId]

  /** For older chats without the default config, set the missing values to defaults when the user open a chat */
  useEffect(() => {
    if (!selectedChat.model) updateProp('model', DEFAULT_CHAT_CONFIG.model, selectedChatId)
    if (!selectedChat.channel) updateProp('channel', DEFAULT_CHAT_CONFIG.channel, selectedChatId)
    if (!selectedChat.temperature) updateProp('temperature', DEFAULT_CHAT_CONFIG.temperature, selectedChatId)
    if (!selectedChat.topP) updateProp('topP', DEFAULT_CHAT_CONFIG.topP, selectedChatId)
    if (!selectedChat.maxTokens) updateProp('maxTokens', DEFAULT_CHAT_CONFIG.maxTokens, selectedChatId)
  }, [selectedChat.channel, selectedChat.model, selectedChat.temperature, selectedChat.topP, selectedChat.maxTokens, selectedChatId, updateProp])

  const selectedModel = useMemo(
    () => CONFIG.models.find((model) => model.value === selectedChat.model),
    [selectedChat.model]
  )

  const o1ModelSelected = useMemo(() => selectedChat.model?.includes('o1-'), [selectedChat.model])

  const handleResetDefault = () => {
    updateProp('model', DEFAULT_CHAT_CONFIG.model, selectedChatId)
    updateProp('channel', DEFAULT_CHAT_CONFIG.channel, selectedChatId)
    updateProp('temperature', DEFAULT_CHAT_CONFIG.temperature, selectedChatId)
    updateProp('topP', DEFAULT_CHAT_CONFIG.topP, selectedChatId)
    updateProp('maxTokens', DEFAULT_CHAT_CONFIG.maxTokens, selectedChatId)
    setSelectedPromptId(null)
  }

  return (
    <div
      className={clsx(styles.chatConfigWrapper, { [styles.isOpen]: isConfigOpen })}
      id="configMenu"
      {...{ popover: isLtTablet ? 'auto' : undefined }}
    >
      <h3 className={clsx(styles.fs4, styles.colorGrey200, styles.text)}>Configure</h3>
      <label className={styles.formControl}>
        <p className={styles.label}>Model</p>
        <select
          name="model"
          className={styles.input}
          value={selectedChat.model}
          onChange={(e) => {
            updateProp('model', e.target.value, selectedChatId)
          }}
        >
          {CONFIG.models.map((model) => (
            <option key={model.value} value={model.value}>
              {model.name}
            </option>
          ))}
        </select>
      </label>
      {o1ModelSelected ? <p className={clsx(styles.fs2, styles.colorRed, styles.text)}>o1 models don&#39;t currently support custom parameters (they ignore them directly) so the config below is disabled as long as an o1 model is selected.</p> : null}
      <label className={styles.formControl}>
        <p className={styles.label}>
          Channel
          <Tooltip
            disclosure={<Question size={20} />}
            content="Channel allows you to select the data source the AI can access. Default/External has no access to internal data, it is the default AI, while Confluence and Coindesk have access to internal data."
          />
        </p>
        <select
          name="channel"
          className={styles.input}
          value={selectedChat.channel}
          onChange={(e) => {
            updateProp('channel', e.target.value, selectedChatId)
          }}
          disabled={o1ModelSelected}
        >
          {CONFIG.channels.map((channel) => (
            <option key={channel.value} value={channel.value}>
              {channel.name}
            </option>
          ))}
        </select>
      </label>
      <label className={clsx(styles.formControl, styles.gap0)}>
        <div className={clsx(styles.hStack, styles.spaceBetween, styles.alignItemsCenter)}>
          <p className={styles.label}>
            Creativity Level
            <Tooltip
              disclosure={<Question size={20} />}
              content="Adjusts how creative or focused the AI's responses are. Lower values produce more predictable outputs,
              while higher values encourage more diverse and unexpected responses. Also known as 'temperature'."
            />
          </p>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            className={clsx(styles.input, styles.sizeSmall)}
            value={selectedChat.temperature}
            onChange={(e) => {
              updateProp('temperature', parseFloat(e.target.value), selectedChatId)
            }}
            disabled={o1ModelSelected}
          />
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          className={styles.input}
          value={selectedChat.temperature}
          onChange={(e) => {
            updateProp('temperature', parseFloat(e.target.value), selectedChatId)
          }}
          disabled={o1ModelSelected}
        />
      </label>
      <label className={clsx(styles.formControl, styles.gap0)}>
        <div className={clsx(styles.hStack, styles.spaceBetween, styles.alignItemsCenter)}>
          <p className={styles.label}>
            Response Diversity
            <Tooltip
              disclosure={<Question size={20} />}
              content="Controls the variety of words the AI considers when generating responses. Lower values make responses more focused and deterministic, while higher values allow for more diverse word choices. Also known as 'top-p'."
            />
          </p>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            className={clsx(styles.input, styles.sizeSmall)}
            value={selectedChat.topP}
            onChange={(e) => {
              updateProp('topP', parseFloat(e.target.value), selectedChatId)
            }}
            disabled={o1ModelSelected}
          />
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          className={styles.input}
          value={selectedChat.topP}
          onChange={(e) => {
            updateProp('topP', parseFloat(e.target.value), selectedChatId)
          }}
          disabled={o1ModelSelected}
        />
      </label>
      <label className={clsx(styles.formControl, styles.gap0)}>
        <div className={clsx(styles.hStack, styles.spaceBetween, styles.alignItemsCenter)}>
          <p className={styles.label}>
            Response Length Limit
            <Tooltip
              disclosure={<Question size={20} />}
              content="Sets the maximum length of the AI's response. Higher values allow for longer, more detailed answers, while lower values keep responses concise. Also known as 'Max Output Tokens'."
            />
          </p>
          <input
            type="number"
            min="0"
            max={selectedModel?.maxTokens || 4_096}
            step="64"
            className={clsx(styles.input, styles.sizeSmall)}
            value={selectedChat.maxTokens}
            onChange={(e) => {
              updateProp('maxTokens', parseInt(e.target.value), selectedChatId)
            }}
            disabled={o1ModelSelected}
          />
        </div>
        <input
          type="range"
          min="0"
          max={selectedModel?.maxTokens || 4_096}
          step="64"
          className={styles.input}
          value={selectedChat.maxTokens}
          onChange={(e) => {
            updateProp('maxTokens', parseInt(e.target.value), selectedChatId)
          }}
          disabled={o1ModelSelected}
        />
      </label>
      <div className={clsx(styles.formControl, styles.gap0)}>
        <p className={styles.label}>
          Custom Prompt
          <Tooltip
            disclosure={<Question size={20} />}
            content="Custom prompts allow you to set the context for the AI's response to get more targeted answers, such as `You are a software developer` or `You are a creative writer at CoinDesk`."
          />
        </p>
        <div className={styles.listItem}>
          {selectedPrompt ? (
            <>
              <h2>{selectedPrompt.title}</h2>
              <div className={styles.tagList}>
                {selectedPrompt.tags.map((tag) => (
                  <span className={styles.tag} key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <Tooltip
                disclosure={<p className={clsx(styles.alignLeft, styles.lineClamp)}>{selectedPrompt.prompt}</p>}
                content={selectedPrompt.prompt}
              />
            </>
          ) : (
            <p className={clsx(styles.colorGrey300, styles.text)}>No prompt selected</p>
          )}
        </div>
        <button popoverTarget="promptModal" className={clsx(styles.button, styles.colorGreen)} disabled={o1ModelSelected}>
          Select Prompt
        </button>
        <PromptsModalMemo />
      </div>
      <button className={styles.button} onClick={handleResetDefault}>
        Reset to Default
      </button>
    </div>
  )
}

export const ChatConfigMemo = memo(ChatConfig)
