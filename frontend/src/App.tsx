import './App.css'

function App() {
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
        </section>

        <form className="chat-form">
          <input
            type="text"
            placeholder="Type your message..."
            aria-label="Support message"
          />

          <button type="submit">Send</button>
        </form>
      </section>
    </main>
  )
}

export default App