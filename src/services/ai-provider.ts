import { AIProvider, AIGenerateRequest, AIGenerateResponse, WeekendContext } from '@/lib/types/ai'

// OpenAI Implementation
async function generateWithOpenAI(request: AIGenerateRequest): Promise<AIGenerateResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 1000,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
    provider: 'openai',
  }
}

// Groq Implementation
async function generateWithGroq(request: AIGenerateRequest): Promise<AIGenerateResponse> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 1000,
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    provider: 'groq',
  }
}

// Claude Implementation
async function generateWithClaude(request: AIGenerateRequest): Promise<AIGenerateResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
      messages: request.messages.filter(m => m.role !== 'system'),
      system: request.messages.find(m => m.role === 'system')?.content,
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    content: data.content[0].text,
    usage: {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    },
    provider: 'claude',
  }
}

// Gemini Implementation
async function generateWithGemini(request: AIGenerateRequest): Promise<AIGenerateResponse> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: request.messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || 1000,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    content: data.candidates[0].content.parts[0].text,
    provider: 'gemini',
  }
}

// Ollama Implementation (Local)
async function generateWithOllama(request: AIGenerateRequest): Promise<AIGenerateResponse> {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3.1:latest',
      messages: request.messages,
      stream: false,
      options: {
        temperature: request.temperature || 0.7,
        num_predict: request.maxTokens || 1000,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    content: data.message.content,
    provider: 'ollama',
  }
}

// Mock Implementation
async function generateWithMock(request: AIGenerateRequest): Promise<AIGenerateResponse> {
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay

  const mockResponse = `# Weekend Plan Suggestion

Based on your preferences and available budget, here are some ideas:

## Saturday
- **Morning (9 AM)**: Yoga in the park (Free)
- **Afternoon (2 PM)**: Coffee with friends ($15)
- **Evening (7 PM)**: Movie night at home ($10 streaming)

## Sunday
- **Morning (10 AM)**: Farmers market visit ($20)
- **Afternoon (3 PM)**: Reading in your favorite spot (Free)

**Total Estimated Cost**: $45
**Available Budget**: $${(request.messages[0].content.match(/\$(\d+)/) || ['', '50'])[1]}

This plan balances social activities, relaxation, and stays within your budget. Enjoy your weekend!`

  return {
    content: mockResponse,
    provider: 'mock',
  }
}

// Main Provider Router
export async function generateAIResponse(request: AIGenerateRequest): Promise<AIGenerateResponse> {
  const provider = (process.env.AI_PROVIDER || 'mock') as AIProvider

  console.log(`[AI Provider] Using: ${provider}`)

  try {
    switch (provider) {
      case 'openai':
        return await generateWithOpenAI(request)
      case 'groq':
        return await generateWithGroq(request)
      case 'claude':
        return await generateWithClaude(request)
      case 'gemini':
        return await generateWithGemini(request)
      case 'ollama':
        return await generateWithOllama(request)
      case 'mock':
      default:
        return await generateWithMock(request)
    }
  } catch (error) {
    console.error(`[AI Provider] Error with ${provider}:`, error)
    // Fallback to mock if provider fails
    if (provider !== 'mock') {
      console.log('[AI Provider] Falling back to mock')
      return await generateWithMock(request)
    }
    throw error
  }
}

// Weekend Plan Generation
export async function generateWeekendPlan(context: WeekendContext): Promise<string> {
  const systemPrompt = `You are a friendly weekend planning assistant. Help users plan enjoyable weekends that:
- Match their interests and preferences
- Stay within their budget
- Balance different types of activities (social, relaxation, outdoor, etc.)
- Consider their available time
- Are realistic and achievable

Respond in a friendly, conversational tone with specific, actionable suggestions.`

  const userPrompt = `Help me plan my weekend!

About me:
- Name: ${context.userName}
- Preferences: ${context.preferences.join(', ')}
- Mood/Vibes: ${context.vibes.join(', ')}

Current situation:
- Weekly budget: $${context.weeklyBudget}
- Already spent: $${context.totalSpentThisWeek}
- Remaining budget: $${context.weeklyBudget - context.totalSpentThisWeek}
- Available time: ~${context.availableHours} hours

${context.currentWeekendActivities.length > 0 ? `
Already planned this weekend:
${context.currentWeekendActivities.map(a => `- ${a.title} (${a.category})`).join('\n')}
` : 'Nothing planned yet!'}

${context.recentHistory.length > 0 ? `
Recently enjoyed:
${context.recentHistory.slice(0, 3).map(h => `- ${h.activity}`).join('\n')}
` : ''}

Please suggest a weekend plan that fits my style and budget. Include specific activities, timing, and estimated costs.`

  const request: AIGenerateRequest = {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    maxTokens: 1500,
  }

  const response = await generateAIResponse(request)
  return response.content
}
