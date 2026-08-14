import { FormEvent, useState } from 'react'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<string[]>([])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedMessage = input.trim()

    if (!trimmedMessage) {
      return
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      trimmedMessage,
    ])

    setInput('')
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
          <div className="message assistant-message">
            <p>
              Hi! I can help you check an order status or answer questions about
              returns and refunds.
            </p>
          </div>

          {messages.map((message, index) => (
            <div className="message user-message" key={index}>
              <p>{message}</p>
            </div>
          ))}
        </section>

        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type your message..."
            aria-label="Support message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />

          <button type="submit">Send</button>
        </form>
      </section>
    </main>
  )
}

export default App