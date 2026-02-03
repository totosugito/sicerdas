import { toast } from "sonner";
import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckIcon, X } from "lucide-react";

export const showNotifSuccess = ({ title, message }: { title?: React.ReactNode, message: React.ReactNode }) => {
  return (
    toast.custom((t) => (
      <Alert className='rounded-md border-l-6 border-green-600 bg-green-100 text-green-600 dark:border-green-400 dark:bg-green-100 dark:text-green-400'
        onClick={() => toast.dismiss(t)}>
        <div className="flex flex-row items-center gap-2">
          <CheckIcon className="h-5 w-5 shrink-0" />
          <AlertTitle>{title ? title : message}</AlertTitle>
        </div>
        {title && <AlertDescription>{message}</AlertDescription>}
      </Alert>
    ))
  )
}

export const showNotifError = ({ title, message }: { title?: React.ReactNode, message: React.ReactNode }) => {
  return (
    toast.custom((t) => (
      <Alert className='rounded-md border-l-6 border-red-600 bg-red-100 text-red-600 dark:border-red-400 dark:bg-red-100 dark:text-red-400'
        onClick={() => toast.dismiss(t)}>
        <div className="flex flex-row items-center gap-2">
          <X className="h-5 w-5 shrink-0" />
          <AlertTitle>{title ? title : message}</AlertTitle>
        </div>
        {title && <AlertDescription>{message}</AlertDescription>}
      </Alert>
    ))
  )
}

export const showNotifWarning = ({ title, message }: { title?: React.ReactNode, message: React.ReactNode }) => {
  return (
    toast.custom((t) => (
      <Alert className='rounded-md border-l-6 border-yellow-600 bg-yellow-100 text-yellow-600 dark:border-yellow-400 dark:bg-yellow-100 dark:text-yellow-400'
        onClick={() => toast.dismiss(t)}>
        <div className="flex flex-row items-center gap-2">
          <X className="h-5 w-5 shrink-0" />
          <AlertTitle>{title ? title : message}</AlertTitle>
        </div>
        {title && <AlertDescription>{message}</AlertDescription>}
      </Alert>
    ))
  )
}

export const showNotifInfo = ({ title, message }: { title?: React.ReactNode, message: React.ReactNode }) => {
  return (
    toast.custom((t) => (
      <Alert className='rounded-md border-l-6 border-blue-600 bg-blue-100 text-blue-600 dark:border-blue-400 dark:bg-blue-100 dark:text-blue-400'
        onClick={() => toast.dismiss(t)}>
        <div className="flex flex-row items-center gap-2">
          <X className="h-5 w-5 shrink-0" />
          <AlertTitle>{title ? title : message}</AlertTitle>
        </div>
        {title && <AlertDescription>{message}</AlertDescription>}
      </Alert>
    ))
  )
}

