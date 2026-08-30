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
        resolve(true)
        return
      }

      setIsLoading(true)
      const existingScript = document.getElementById('razorpay-checkout-script')
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          setIsLoaded(true)
          setIsLoading(false)
          resolve(true)
        })
        return
      }

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
        setError('Failed to load secure Razorpay Checkout SDK. Please check your internet connection.')
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

