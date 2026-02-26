export type AIProvider = 'openai' | 'groq' | 'claude' | 'gemini' | 'ollama' | 'mock'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIGenerateRequest {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
}

export interface AIGenerateResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  provider: AIProvider
}

export interface WeekendContext {
  userId: string
  userName: string
  preferences: string[]
  vibes: string[]
  currentWeekendActivities: any[]
  weeklyBudget: number
  totalSpentThisWeek: number
  availableHours: number
  recentHistory: any[]
}
