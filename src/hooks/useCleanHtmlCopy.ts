import { useCallback, useEffect } from 'react'

const cleanHtml = (html: string): string => {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  const removeAttributes = (element: Element) => {
    element.removeAttribute('style')
    element.removeAttribute('class')
    element.removeAttribute('id')
    Array.from(element.children).forEach(removeAttributes)
  }

  removeAttributes(tempDiv)
  return tempDiv.innerHTML
}

export const useCleanHtmlCopy = () => {
  const handleCopy = useCallback((event: ClipboardEvent) => {
    try {
      const selection = document.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const clonedContents = range.cloneContents()

      // Create a hidden div
      const temporaryHiddenWrapper = document.createElement('hidden')
      temporaryHiddenWrapper.style.cssText = 'position:absolute;left:-9999px;top:-9999px;'
      temporaryHiddenWrapper.appendChild(clonedContents)

      // Append to body, read HTML, then remove
      document.body.appendChild(temporaryHiddenWrapper)
      const cleanedHtml = cleanHtml(temporaryHiddenWrapper.innerHTML)
      document.body.removeChild(temporaryHiddenWrapper)

      if (!event.clipboardData) {
        throw new Error('Clipboard API not supported')
      }

      event.clipboardData.setData('text/plain', selection.toString())
      event.clipboardData.setData('text/html', cleanedHtml)
      event.preventDefault()
    } catch (error) {
      console.error('Error in copy handler:', error)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('copy', handleCopy)

    return () => {
      document.removeEventListener('copy', handleCopy)
    }
  }, [handleCopy])
}
