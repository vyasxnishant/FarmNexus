import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'fill' | 'outline'
  children: ReactNode
  size?: 'md' | 'lg'
}

export function Button({ variant = 'fill', size = 'md', children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-body font-semibold rounded-lg transition-all duration-200 cursor-pointer'
  
  const sizes = {
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const variants = {
    fill: 'bg-turmeric text-monsoon hover:bg-turmeric/90 active:bg-turmeric/80 focus-visible:ring-2 focus-visible:ring-wheat focus-visible:ring-offset-2 focus-visible:ring-offset-monsoon',
    outline: 'bg-transparent border-2 border-turmeric text-turmeric hover:bg-turmeric/10 active:bg-turmeric/20 focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:ring-offset-2 focus-visible:ring-offset-monsoon',
  }

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
