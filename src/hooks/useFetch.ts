import { useCallback, useState } from 'react'

interface FetchResult<T> {
  data: T | null
  error: string | null
  loading: boolean
  fetchData: () => Promise<T | null>
}

export const useFetch = <T>(url: string, body: any): FetchResult<T> => {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const fetchData = useCallback(async (): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const result: T = await response.json()
      setData(result)
      return result
    } catch (error: any) {
      setError(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [url, body])

  return { data, error, loading, fetchData }
}
