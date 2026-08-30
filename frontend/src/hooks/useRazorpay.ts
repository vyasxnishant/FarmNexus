import { useState, useEffect } from 'react'

declare global {
  interface Window {
    Razorpay: any
  }
}

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState<boolean>(typeof window !== 'undefined' && Boolean(window.Razorpay))
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false)
        return
      }

      if (window.Razorpay) {
        setIsLoaded(true)
        setIsLoading(false)
        resolve(true)
        return
      }

      const existingScript = document.getElementById('razorpay-checkout-script') as HTMLScriptElement | null

      if (existingScript) {
        if (window.Razorpay) {
          setIsLoaded(true)
          setIsLoading(false)
          resolve(true)
          return
        }

        let timeoutId: any = null
        const onLoad = () => {
          if (timeoutId) clearTimeout(timeoutId)
          setIsLoaded(true)
          setIsLoading(false)
          resolve(Boolean(window.Razorpay))
        }
        const onError = () => {
          if (timeoutId) clearTimeout(timeoutId)
          setIsLoaded(false)
          setIsLoading(false)
          setError('Failed to load Razorpay Checkout SDK.')
          resolve(false)
        }

        existingScript.addEventListener('load', onLoad, { once: true })
        existingScript.addEventListener('error', onError, { once: true })

        // Fallback check in case load event already fired
        timeoutId = setTimeout(() => {
          if (window.Razorpay) {
            setIsLoaded(true)
            setIsLoading(false)
            resolve(true)
          } else {
            resolve(false)
          }
        }, 1500)

        return
      }

      setIsLoading(true)
      const script = document.createElement('script')
      script.id = 'razorpay-checkout-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        setIsLoaded(true)
        setIsLoading(false)
        resolve(true)
      }
      script.onerror = () => {
        setIsLoaded(false)
        setIsLoading(false)
        setError('Failed to load secure Razorpay Checkout SDK.')
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }

  useEffect(() => {
    loadRazorpayScript()
  }, [])

  return {
    isLoaded,
    isLoading,
    error,
    loadRazorpayScript,
  }
}
