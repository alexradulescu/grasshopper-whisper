import { useCallback, useState } from 'react'

interface MutationOptions<TData, TError> {
  url: string
  onSuccess?: (data: TData) => void
  onError?: (error: TError) => void
}

interface MutationResult<TData, TError> {
  mutate: (body: any) => Promise<void>
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  data: TData | null
  error: TError | null
}

/** Simple useMutation hook
 * Example usage:
 *   const mutation = useMutation<ResponseData, Error>({
 *     url: 'https://api.example.com/data',
 *     onSuccess: (data) => console.log('Success:', data),
 *     onError: (error) => console.error('Error:', error),
 *   });
 *
 *   const handleSubmit = () => {
 *     mutation.mutate({ someKey: 'someValue' });
 *   };
 */
export function useMutation<TData = unknown, TError = unknown>({
  url,
  onSuccess,
  onError
}: MutationOptions<TData, TError>): MutationResult<TData, TError> {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<TError | null>(null)

  const mutate = useCallback(
    async (body: any) => {
      setIsLoading(true)
      setIsError(false)
      setIsSuccess(false)
      setData(null)
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
          throw new Error('Network response was not ok')
        }

        const result: TData = await response.json()
        setData(result)
        setIsSuccess(true)
        onSuccess && onSuccess(result)
      } catch (err) {
        setIsError(true)
        setError(err as TError)
        onError && onError(err as TError)
      } finally {
        setIsLoading(false)
      }
    },
    [url, onSuccess, onError]
  )

  return { mutate, isLoading, isError, isSuccess, data, error }
}
