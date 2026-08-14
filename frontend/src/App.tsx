import { type FormEvent, useState } from 'react'
import { processCustomerMessage } from './services/supportService'
import { type ChatMessage } from './types/chat'
import './App.css'

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-message',
    role: 'assistant',
    text: 'Hi! I can help you check an order status or answer questions about returns and refunds.',
  },
]

function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedMessage = input.trim()

    if (!trimmedMessage || isLoading) {
      return
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmedMessage,
    }

    setMessages((currentMessages) => [...currentMessages, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const responseText = await processCustomerMessage(trimmedMessage)

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: responseText,
      }

      setMessages((currentMessages) => [...currentMessages, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="support-page">
      <section className="support-container">
        <header className="support-header">
          <p className="brand-name">Northstar Retail Co.</p>
          <h1>Customer Support</h1>
          <p className="support-subtitle">
            Ask about your order status or returns and refunds.
          </p>
        </header>

        <section className="chat-area" aria-live="polite">
          {messages.map((message) => (
            <div
              className={`message ${
                message.role === 'user' ? 'user-message' : 'assistant-message'
              }`}
              key={message.id}
            >
              <p>{message.text}</p>
            </div>
          ))}

          {isLoading && (
            <div className="message assistant-message loading-message">
              <p>Thinking...</p>
            </div>
          )}
        </section>

        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type your message..."
            aria-label="Support message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isLoading}
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default App