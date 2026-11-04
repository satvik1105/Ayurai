
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  Plus,
  MessageSquare,
  Send,
  Menu,
  X,
  Trash2,
  Leaf,
  Sparkles,
  User,
  LoaderCircle,
  ArrowDown,
} from "lucide-react";
import "./Chatbot.css";

const API_URL = "https://ayurai-backend-u1e8.onrender.com/api/chat";

const suggestedPrompts = [
  "Suggest a healthy morning routine",
  "How can I improve my digestion naturally?",
  "Give me a simple stress-relief routine",
  "Suggest a balanced vegetarian diet",
];

export default function Chatbot() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const request = useCallback(
    async (url, options = {}) => {
      const token = await getToken();

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.message || "Something went wrong.");
      }

      return data;
    },
    [getToken]
  );

  const loadConversations = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;

    setLoadingHistory(true);
    setError("");

    try {
      const data = await request(`${API_URL}/conversations`);
      setConversations(data.conversations || []);
    } catch (err) {
      setError(err.message || "Could not load chat history.");
    } finally {
      setLoadingHistory(false);
    }
  }, [isLoaded, isSignedIn, request]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function createNewChat() {
    setError("");
    setMessages([]);
    setActiveId(null);
    setSidebarOpen(false);

    try {
      const data = await request(`${API_URL}/conversations`, {
        method: "POST",
        body: JSON.stringify({ title: "New conversation" }),
      });

      setActiveId(data.conversation.id);
      setConversations((prev) => [
        data.conversation,
        ...prev.filter((item) => item.id !== data.conversation.id),
      ]);
      textareaRef.current?.focus();
    } catch (err) {
      setError(err.message || "Could not create a new chat.");
    }
  }

  async function openConversation(id) {
    setError("");
    setLoadingHistory(true);
    setSidebarOpen(false);

    try {
      const data = await request(
        `${API_URL}/conversations/${id}`
      );

      setActiveId(id);
      setMessages(data.messages || data.conversation?.messages || []);
    } catch (err) {
      setError(err.message || "Could not open this conversation.");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function deleteConversation(id, event) {
    event.stopPropagation();

    const confirmed = window.confirm("Delete this conversation?");
    if (!confirmed) return;

    try {
      await request(`${API_URL}/conversations/${id}`, {
        method: "DELETE",
      });

      setConversations((prev) => prev.filter((item) => item.id !== id));

      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message || "Could not delete this conversation.");
    }
  }

  async function sendMessage(text = input) {
    const messageText = text.trim();

    if (!messageText || loading) return;

    setError("");
    setInput("");
    setLoading(true);

    let conversationId = activeId;

    try {
      if (!conversationId) {
        const created = await request(`${API_URL}/conversations`, {
          method: "POST",
          body: JSON.stringify({ title: messageText.slice(0, 45) }),
        });

        conversationId = created.conversation.id;
        setActiveId(conversationId);
        setConversations((prev) => [
          created.conversation,
          ...prev.filter((item) => item.id !== conversationId),
        ]);
      }

      const temporaryMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: messageText,
      };

      setMessages((prev) => [...prev, temporaryMessage]);

      const data = await request(
        `${API_URL}/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ message: messageText }),
        }
      );

      setMessages((prev) => {
        const withoutTemp = prev.filter(
          (item) => !String(item.id).startsWith("temp-")
        );

        return [
          ...withoutTemp,
          data.userMessage,
          data.assistantMessage,
        ];
      });

      await loadConversations();
    } catch (err) {
      setError(err.message || "Unable to send your message.");
      // Keep the typed message available if the request fails.
      setInput(messageText);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  if (!isLoaded) {
    return (
      <div className="ay-chat-loading">
        <LoaderCircle className="ay-spin" size={25} />
        <span>Loading AyurAI...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="ay-chat-login">
        <Leaf size={34} />
        <h2>Your wellness journey starts here.</h2>
        <p>Please sign in to use AyurAI Chat.</p>
      </div>
    );
  }

  return (
    <div className="ay-chat-app">
      {sidebarOpen && (
        <button
          className="ay-sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`ay-chat-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ay-sidebar-top">
          <div className="ay-chat-brand">
            <div className="ay-brand-icon"><Leaf size={21} /></div>
            <div>
              <strong>AyurAI</strong>
              <span>WELLNESS COMPANION</span>
            </div>
          </div>

          <button
            className="ay-icon-button ay-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <button className="ay-new-chat" onClick={createNewChat}>
          <Plus size={18} />
          <span>New conversation</span>
        </button>

        <div className="ay-history-heading">YOUR CONVERSATIONS</div>

        <div className="ay-history-list">
          {loadingHistory && conversations.length === 0 ? (
            <div className="ay-history-empty">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="ay-history-empty">
              Your conversations will appear here.
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`ay-history-item ${
                  activeId === conversation.id ? "active" : ""
                }`}
                onClick={() => openConversation(conversation.id)}
              >
                <MessageSquare size={16} />
                <span>{conversation.title || "New conversation"}</span>
                <span
                  className="ay-delete-chat"
                  role="button"
                  tabIndex={0}
                  aria-label="Delete conversation"
                  onClick={(event) =>
                    deleteConversation(conversation.id, event)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      deleteConversation(conversation.id, event);
                    }
                  }}
                >
                  <Trash2 size={15} />
                </span>
              </button>
            ))
          )}
        </div>

        <div className="ay-sidebar-footer">
          <div className="ay-footer-leaf"><Leaf size={17} /></div>
          <div>
            <strong>Natural wellness</strong>
            <span>Small steps, healthier living.</span>
          </div>
        </div>
      </aside>

      <main className="ay-chat-main">
        <header className="ay-chat-header">
          <div className="ay-header-left">
            <button
              className="ay-icon-button ay-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={21} />
            </button>
            <div>
              <h2>AyurAI Assistant</h2>
              <span><i /> Your personal wellness companion</span>
            </div>
          </div>

          <div className="ay-header-tag">
            <Leaf size={15} /> Ayurveda inspired
          </div>
        </header>

        <section className="ay-chat-content">
          {messages.length === 0 ? (
            <div className="ay-chat-welcome">
              <div className="ay-welcome-icon">
                <Sparkles size={27} />
              </div>

              <span className="ay-eyebrow">WELCOME TO AYURAI</span>
              <h1>Wellness begins<br />with a conversation.</h1>
              <p>
                Ask me about Ayurveda, daily wellness habits, nutrition,
                mindfulness and building a healthier lifestyle.
              </p>

              <div className="ay-prompt-grid">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    className="ay-prompt-card"
                    onClick={() => sendMessage(prompt)}
                    disabled={loading}
                  >
                    <span>{prompt}</span>
                    <ArrowDown size={15} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="ay-message-list">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`ay-message-row ${
                    message.role === "user" ? "user" : "assistant"
                  }`}
                >
                  <div className="ay-message-avatar">
                    {message.role === "user" ? (
                      <User size={17} />
                    ) : (
                      <Leaf size={17} />
                    )}
                  </div>

                  <div className="ay-message-body">
                    <span className="ay-message-name">
                      {message.role === "user" ? "You" : "AyurAI"}
                    </span>
                    <div className="ay-message-text">{message.content}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="ay-message-row assistant">
                  <div className="ay-message-avatar"><Leaf size={17} /></div>
                  <div className="ay-message-body">
                    <span className="ay-message-name">AyurAI</span>
                    <div className="ay-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {error && <div className="ay-chat-error">{error}</div>}
        </section>

        <div className="ay-chat-composer-wrap">
          <div className="ay-chat-composer">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AyurAI anything about your wellness..."
              rows={1}
              disabled={loading}
            />
            <button
              className="ay-send-button"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              {loading ? (
                <LoaderCircle size={19} className="ay-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="ay-disclaimer">
            AyurAI offers general wellness information, not medical diagnosis
            or treatment. Consult a qualified healthcare professional for
            medical concerns.
          </p>
        </div>
      </main>
    </div>
  );
}
