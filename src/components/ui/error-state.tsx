import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Failed to load data',
  message = 'Something went wrong while loading the data. Please try again.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-center text-sm text-gray-600 dark:text-gray-400">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-6">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  )
}

interface PageErrorStateProps extends ErrorStateProps {
  fullPage?: boolean
}

export function PageErrorState({
  fullPage = true,
  ...props
}: PageErrorStateProps) {
  if (fullPage) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <ErrorState {...props} />
      </div>
    )
  }
  return <ErrorState {...props} />
}
