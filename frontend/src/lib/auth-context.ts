import * as React from 'react'
import { AuthContext } from '@/types/auth'

export const AuthContextTag = React.createContext<AuthContext | null>(null)
