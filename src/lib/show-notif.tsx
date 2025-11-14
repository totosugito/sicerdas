import { toast } from "sonner";
import * as React from "react";
import { Alert, AlertTitle } from '@/components/ui/alert'
import { CheckIcon, X } from "lucide-react";

export const showNotifSuccess = ({ message }: { message: React.ReactNode }) => {
  return (
    toast.custom((t) => (
      <Alert className='rounded-md border-l-6 border-green-600 bg-green-600/10 text-green-600 dark:border-green-400 dark:bg-green-400/10 dark:text-green-400'
        onClick={() => toast.dismiss(t)}>
        <div className="flex flex-row items-center gap-2">
          <CheckIcon className="h-5 w-5 shrink-0" />
          <AlertTitle>{message}</AlertTitle>
        </div>
      </Alert>
    ))
  )
}

export const showNotifError = ({ message }: { message: React.ReactNode }) => {
  return (
    toast.custom((t) => (
      <Alert className='rounded-md border-l-6 border-red-600 bg-red-600/10 text-red-600 dark:border-red-400 dark:bg-red-400/10 dark:text-red-400'
        onClick={() => toast.dismiss(t)}>
        <div className="flex flex-row items-center gap-2">
          <X className="h-5 w-5 shrink-0" />
          <AlertTitle>{message}</AlertTitle>
        </div>
      </Alert>
    ))
  )
}