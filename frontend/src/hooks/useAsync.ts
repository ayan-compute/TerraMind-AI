import { useEffect, useState } from 'react'

export function useAsync<T>(load: () => Promise<T>) {
  const [run, setRun] = useState(0)
  const [s, setS] = useState<{ data?: T; error?: Error }>({})
  useEffect(() => {
    let live = true
    setS({})
    load().then((data) => live && setS({ data }), (error: Error) => live && setS({ error }))
    return () => { live = false }
  }, [run]) // eslint-disable-line react-hooks/exhaustive-deps
  return { ...s, loading: !s.data && !s.error, retry: () => setRun((n) => n + 1) }
}
