
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Activity,
  ArrowUp,
  Brain,
  HeartPulse,
  Leaf,
  LoaderCircle,
  Menu,
  MessageSquare,
  Moon,
  Plus,
  Search,
  Salad,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  Copy,
  Check,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/chat";

const suggestions = [
  {
    icon: HeartPulse,
    title: "Improve my health",
    description: "Build healthier daily habits",
    prompt: "How can I improve my overall health through daily habits?",
  },
  {
    icon: Salad,
    title: "Nutrition & diet",
    description: "Understand balanced nutrition",
    prompt: "Help me understand how to build a balanced vegetarian diet.",
  },
  {
    icon: Moon,
    title: "Sleep better",
    description: "Create a healthy sleep routine",
    prompt: "What are some practical ways to improve my sleep quality?",
  },
  {
    icon: Brain,
    title: "Mental wellness",
    description: "Manage stress and focus",
    prompt: "Suggest some simple daily practices for stress management.",
  },
];

function AssistantMarkdown({ content }) {
  return (
    <div className="break-words text-[13px] leading-7 text-[#475344] sm:text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-5 text-xl font-bold tracking-tight text-[#293e2e] first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2.5 mt-5 text-lg font-bold tracking-tight text-[#304a35] first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-semibold text-[#38583d] first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 whitespace-pre-wrap leading-7">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 ml-5 list-disc space-y-1.5 marker:text-[#78936c] last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 ml-5 list-decimal space-y-1.5 marker:font-semibold marker:text-[#66845c] last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 leading-7">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[#2f4934]">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#53694f]">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-[3px] border-[#9aaf8d] bg-[#f2f5ed] py-2 pl-4 pr-3 text-[#61715b]">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-[#e8e5d9]" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[#39734a] underline decoration-[#b5c9ad] underline-offset-2 hover:text-[#185432]"
            >
              {children}
            </a>
          ),
          code: ({ children, className }) => {
            const isBlock = Boolean(className);
            return isBlock ? (
              <code className="block overflow-x-auto rounded-lg bg-[#26352b] p-3 font-mono text-xs leading-6 text-[#f2f5ed]">
                {children}
              </code>
            ) : (
              <code className="rounded bg-[#edf1e8] px-1.5 py-0.5 font-mono text-[0.9em] text-[#365b3d]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-lg bg-[#26352b] p-3 text-xs leading-6 text-[#f2f5ed]">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-[#e6e5d9]">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#edf2e8] text-[#304a35]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-[#e3e7dc] px-3 py-2 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[#efeee7] px-3 py-2 align-top">
              {children}
            </td>
          ),
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}

function AIChat({ clerkId, getToken, onClose }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState("");

  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const activeChat = chats.find(
    (chat) => chat.id === activeChatId
  );

  const messages = activeChat?.messages || [];

  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      (chat.title || "New conversation")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  const handleCopy = async (content, id) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(id);

      setTimeout(() => {
        setCopiedMessageId((current) =>
          current === id ? null : current
        );
      }, 2000);
    } catch (error) {
      setChatError("Unable to copy response. Please try again.");
    }
  };

  const apiRequest = useCallback(
    async (url, options = {}) => {
      const token = await getToken();

      if (!token) {
        throw new Error(
          "Your login session has expired. Please sign in again."
        );
      }

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
        throw new Error(
          data.error || data.message || "Something went wrong."
        );
      }

      return data;
    },
    [getToken]
  );

  const loadChats = useCallback(async () => {
    try {
      setChatError("");

      const data = await apiRequest(
        `${API_URL}/conversations`
      );

      const savedChats = (data.conversations || []).map(
        (chat) => ({
          ...chat,
          messages: [],
        })
      );

      setChats(savedChats);
    } catch (error) {
      setChatError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, activeChatId, isSending]);

  // Create a new conversation
  const createNewChat = async () => {
    try {
      setChatError("");
      setMessage("");

      const data = await apiRequest(
        `${API_URL}/conversations`,
        {
          method: "POST",
          body: JSON.stringify({
            title: "New conversation",
          }),
        }
      );

      const newChat = {
        ...data.conversation,
        messages: [],
      };

      setChats((previous) => [
        newChat,
        ...previous.filter(
          (chat) => chat.id !== newChat.id
        ),
      ]);

      setActiveChatId(newChat.id);
      setSidebarOpen(false);

      textareaRef.current?.focus();
    } catch (error) {
      setChatError(error.message);
    }
  };

  // Open an existing conversation
  const selectChat = async (id) => {
    try {
      setChatError("");

      const data = await apiRequest(
        `${API_URL}/conversations/${id}`
      );

      const loadedMessages =
        data.messages ||
        data.conversation?.messages ||
        [];

      setChats((previous) =>
        previous.map((chat) =>
          chat.id === id
            ? {
                ...chat,
                ...data.conversation,
                messages: loadedMessages,
              }
            : chat
        )
      );

      setActiveChatId(id);
      setSidebarOpen(false);
    } catch (error) {
      setChatError(error.message);
    }
  };

  // Delete a conversation
  const deleteChat = async (id, event) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) return;

    try {
      setChatError("");

      await apiRequest(
        `${API_URL}/conversations/${id}`,
        {
          method: "DELETE",
        }
      );

      setChats((previous) =>
        previous.filter((chat) => chat.id !== id)
      );

      if (activeChatId === id) {
        setActiveChatId(null);
      }
    } catch (error) {
      setChatError(error.message);
    }
  };

  // Send message and receive AI response
  const sendMessage = async (text = message) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage || isSending) return;

    setMessage("");
    setChatError("");
    setIsSending(true);
    setSidebarOpen(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    let conversationId = activeChatId;

    const temporaryId = `temp-${Date.now()}`;

    const temporaryMessage = {
      id: temporaryId,
      role: "user",
      content: trimmedMessage,
      createdAt: new Date().toISOString(),
    };

    try {
      // Create conversation when needed
      if (!conversationId) {
        const created = await apiRequest(
          `${API_URL}/conversations`,
          {
            method: "POST",
            body: JSON.stringify({
              title: trimmedMessage.slice(0, 45),
            }),
          }
        );

        conversationId = created.conversation.id;

        setActiveChatId(conversationId);

        setChats((previous) => [
          {
            ...created.conversation,
            messages: [temporaryMessage],
          },
          ...previous.filter(
            (chat) => chat.id !== conversationId
          ),
        ]);
      } else {
        setChats((previous) =>
          previous.map((chat) =>
            chat.id === conversationId
              ? {
                  ...chat,
                  messages: [
                    ...(chat.messages || []),
                    temporaryMessage,
                  ],
                }
              : chat
          )
        );
      }

      // Call AI backend
      const data = await apiRequest(
        `${API_URL}/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            message: trimmedMessage,
          }),
        }
      );

      setChats((previous) =>
        previous.map((chat) =>
          chat.id === conversationId
            ? {
                ...chat,
                title:
                  chat.title === "New conversation"
                    ? trimmedMessage.slice(0, 45)
                    : chat.title,
                messages: [
                  ...(chat.messages || []).filter(
                    (item) => item.id !== temporaryId
                  ),
                  data.userMessage,
                  data.assistantMessage,
                ],
                updatedAt: new Date().toISOString(),
              }
            : chat
        )
      );

      // Refresh conversation list
      const history = await apiRequest(
        `${API_URL}/conversations`
      );

      setChats((previous) =>
        (history.conversations || []).map((chat) => {
          const existing = previous.find(
            (item) => item.id === chat.id
          );

          return {
            ...chat,
            messages: existing?.messages || [],
          };
        })
      );
    } catch (error) {
      setChatError(error.message);

      // Remove temporary message if request failed
      setChats((previous) =>
        previous.map((chat) =>
          chat.id === conversationId
            ? {
                ...chat,
                messages: (chat.messages || []).filter(
                  (item) => item.id !== temporaryId
                ),
              }
            : chat
        )
      );

      setMessage(trimmedMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (event) => {
    setMessage(event.target.value);

    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      160
    )}px`;
  };

  const handleSuggestionClick = (prompt) => {
    sendMessage(prompt);
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    if (!date) return "";

    const today = new Date();
    const target = new Date(date);

    if (target.toDateString() === today.toDateString()) {
      return "Today";
    }

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (target.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return target.toLocaleDateString([], {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="relative flex h-[calc(100dvh-96px)] min-h-0 overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_rgba(215,229,205,0.55),_transparent_38%),linear-gradient(135deg,#f8f7f0_0%,#f1f4eb_48%,#f7f3e9_100%)] text-[#293c2e]">

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#17281d]/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[285px] flex-col
          border-r border-[#e4e9dd] bg-white/75 shadow-[12px_0_40px_rgba(39,67,43,0.035)] backdrop-blur-2xl
          transition-transform duration-300
          lg:sticky lg:top-0 lg:z-10 lg:h-[calc(100vh-96px)]
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex items-center justify-between border-b border-[#e9eee4] px-5 pb-5 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#246a43] to-[#123e29] text-white shadow-[0_8px_20px_rgba(24,84,50,0.22)] ring-1 ring-white/70">
              <Leaf size={19} />
            </div>

            <div>
              <h2 className="text-[18px] font-extrabold tracking-[-0.04em] text-[#203b2a]">
                AyurAI
              </h2>

              <p className="text-[10px] font-medium tracking-[0.12em] text-[#8b927e]">
                WELLNESS ASSISTANT
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-[#788271] hover:bg-[#e6e5d8] lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* NEW CHAT BUTTON */}
        <div className="px-4">
          <button
            type="button"
            onClick={createNewChat}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1d6340] via-[#185432] to-[#123e2b] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(24,84,50,0.19)] ring-1 ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(24,84,50,0.24)] active:translate-y-0 active:scale-[0.99]"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        {/* SEARCH */}
        <div className="px-4 pt-6">
          <div className="flex items-center gap-2 rounded-2xl border border-[#e5eadd] bg-white/80 px-3 shadow-sm transition-all focus-within:border-[#a9c3a2] focus-within:ring-4 focus-within:ring-[#dce9d6]/60">
            <Search
              size={16}
              className="shrink-0 text-[#8b927e]"
            />

            <input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search conversations..."
              className="h-10 min-w-0 flex-1 bg-transparent text-xs text-[#354b39] outline-none placeholder:text-[#a3a596]"
            />
          </div>
        </div>

        {/* CHAT HISTORY */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-7">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#879481]">
            Recent conversations
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-[#84907b]">
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
              Loading chats...
            </div>
          ) : filteredChats.length > 0 ? (
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectChat(chat.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      selectChat(chat.id);
                    }
                  }}
                  className={`group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-3 transition-colors ${
                    activeChatId === chat.id
                      ? "bg-gradient-to-r from-[#e5efe1] to-[#eef3e9] text-[#245333] shadow-sm ring-1 ring-[#d7e4d1]"
                      : "text-[#697461] hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <MessageSquare
                    size={15}
                    className="shrink-0"
                  />

                  <span className="min-w-0 flex-1 truncate text-xs font-medium">
                    {chat.title || "New conversation"}
                  </span>

                  <button
                    type="button"
                    onClick={(event) =>
                      deleteChat(chat.id, event)
                    }
                    aria-label="Delete conversation"
                    className="rounded-md p-1.5 text-[#9b9889] opacity-0 transition-all hover:bg-[#f4e4df] hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#d9d6c9] px-3 py-6 text-center">
              <MessageSquare
                size={21}
                className="mx-auto mb-2 text-[#a5a894]"
              />

              <p className="text-xs font-medium text-[#7f8875]">
                {searchQuery
                  ? "No conversations found"
                  : "Your chats will appear here"}
              </p>

              <p className="mt-1 text-[10px] text-[#a1a393]">
                Start a new conversation
              </p>
            </div>
          )}
        </div>

        {/* SIDEBAR BOTTOM */}
        <div className="border-t border-[#e9eee4] bg-white/35 p-4">
          <div className="flex items-start gap-3 rounded-2xl border border-[#e1eadb] bg-gradient-to-br from-[#f0f5eb] to-[#e7eee0] p-3.5 shadow-sm">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[#4d7451]"
            />

            <div>
              <p className="text-xs font-semibold text-[#3e5941]">
                Your wellness matters
              </p>

              <p className="mt-1 text-[10px] leading-5 text-[#77816d]">
                Your health information deserves care and privacy.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

        {/* CHAT TOP BAR */}
        <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center justify-between border-b border-white/80 bg-white/65 px-4 shadow-[0_5px_24px_rgba(42,65,42,0.035)] backdrop-blur-2xl sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open chat history"
              className="rounded-lg p-2 text-[#53674f] transition-colors hover:bg-[#e9eddf] lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-[#2d4432] sm:text-base">
                {activeChat?.title || "AI Wellness Assistant"}
              </h1>

              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#84907b] sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#75a46d]" />
                Your personal wellness companion
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[#dfe9d9] bg-gradient-to-r from-white to-[#edf4e9] px-3.5 py-2 shadow-sm">
              <Sparkles
                size={13}
                className="text-[#557b4d]"
              />

              <span className="text-[10px] font-semibold text-[#58704e]">
                AyurAI
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close AI Assistant"
              title="Back to Home"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e3eadf] bg-white/80 text-[#526b52] shadow-sm transition hover:bg-[#e9f0e5] hover:text-[#185432] active:scale-95"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        {/* MESSAGE AREA */}
        <div
          ref={messagesContainerRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >

          {messages.length === 0 ? (
            /* WELCOME SCREEN */
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-5 py-10 sm:px-8 sm:py-14">

              <div className="relative mx-auto mb-7 flex h-[76px] w-[76px] items-center justify-center rounded-[27px] bg-gradient-to-br from-[#2b754b] via-[#185432] to-[#103923] text-[#f7f4e9] shadow-[0_18px_38px_rgba(24,84,50,0.24)] ring-8 ring-white/55 before:absolute before:inset-[-9px] before:rounded-[31px] before:border before:border-[#cbdcc4]/70">
                <Leaf size={31} strokeWidth={1.6} />
              </div>

              <div className="text-center">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#7b916a]">
                  A healthier you starts here
                </p>

                <h2 className="text-3xl font-extrabold tracking-[-0.055em] text-[#203b2a] sm:text-4xl md:text-[48px]">
                  Namaste, welcome to{" "}
                  <span className="text-[#528052]">
                    AyurAI.
                  </span>
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#737f70] sm:text-[15px]">
                  Your personal space for wellness, mindful living and
                  healthier everyday choices. What would you like to
                  explore today?
                </p>
              </div>

              {/* SUGGESTION CARDS */}
              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestions.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => sendMessage(item.prompt)}
                      disabled={isSending}
                      className="group relative flex min-h-[112px] items-start gap-4 overflow-hidden rounded-[22px] border border-white/90 bg-white/75 p-4 text-left shadow-[0_8px_26px_rgba(49,67,48,0.055)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#c5d8bd] hover:bg-white hover:shadow-[0_18px_36px_rgba(49,67,48,0.11)] disabled:cursor-not-allowed sm:p-5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#edf5e9] to-[#dfeadb] text-[#3e7047] shadow-inner transition-all duration-300 group-hover:scale-105 group-hover:from-[#e1efdc] group-hover:to-[#d4e6ce]">
                        <Icon
                          size={19}
                          strokeWidth={1.8}
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[#394e39]">
                          {item.title}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-[#929487]">
                          {item.description}
                        </span>
                      </span>

                      <ArrowUp
                        size={15}
                        className="mt-1 rotate-45 text-[#a3ae97] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </button>
                  );
                })}
              </div>

              <div className="mx-auto mt-9 flex items-center gap-2 text-[10px] text-[#9a9b8e]">
                <Activity size={13} />
                <span>
                  Small steps. Better habits. Healthier living.
                </span>
              </div>
            </div>
          ) : (
            /* CONVERSATION MESSAGES */
            <div className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-8 sm:px-8 sm:py-10">
              {messages.map((item, index) => (
                <div
                  key={item.id || index}
                  className={`flex gap-3 sm:gap-4 ${
                    item.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {item.role === "assistant" && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#267147] to-[#123e29] text-white shadow-[0_7px_16px_rgba(24,84,50,0.18)] ring-2 ring-white/80">
                      <Leaf size={18} />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[80%] ${
                      item.role === "user" ? "order-first" : ""
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3.5 text-sm leading-7 shadow-sm sm:px-5 ${
                        item.role === "user"
                          ? "rounded-br-md border border-[#d8e6d2] bg-gradient-to-br from-[#eaf3e5] to-[#dfeada] text-[#304b35] shadow-[0_8px_22px_rgba(54,89,53,0.07)]"
                          : "rounded-tl-md border border-white/90 bg-white/85 text-[#475344] shadow-[0_8px_26px_rgba(49,67,48,0.055)] backdrop-blur-xl"
                      }`}
                    >
                      {item.role === "assistant" ? (
                        <AssistantMarkdown content={item.content} />
                      ) : (
                        <p className="whitespace-pre-wrap break-words text-[13px] leading-7 sm:text-sm">
                          {item.content}
                        </p>
                      )}
                    </div>

                    <p
                      className={`mt-2 text-[10px] text-[#a0a091] ${
                        item.role === "user"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {item.role === "user" ? "You" : "AyurAI"} ·{" "}
                      {formatTime(item.createdAt)}
                    </p>

                    {/* COPY ANSWER BUTTON */}
                    {item.role === "assistant" && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(item.content, item.id || index)
                          }
                          title="Copy response"
                          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[#75816e] transition-all hover:bg-[#e9eddf] hover:text-[#185432] active:scale-95"
                        >
                          {copiedMessageId === (item.id || index) ? (
                            <>
                              <Check size={14} />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {item.role === "user" && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e0ddcf] bg-white text-[#62735a]">
                      <span className="text-xs font-bold">
                        You
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* AI TYPING INDICATOR */}
              {isSending && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#267147] to-[#123e29] text-white shadow-[0_7px_16px_rgba(24,84,50,0.18)] ring-2 ring-white/80">
                    <Leaf size={18} />
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-[#e9e2d4] bg-[#fffdf7] px-4 py-3">
                    <LoaderCircle
                      size={15}
                      className="animate-spin text-[#557b4d]"
                    />

                    <span className="text-xs text-[#84907b]">
                      AyurAI is thinking...
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* ERROR MESSAGE */}
        {chatError && (
          <div className="mx-auto mb-3 w-[calc(100%-24px)] max-w-4xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {chatError}
          </div>
        )}

        {/* MESSAGE COMPOSER */}
        <div className="sticky bottom-0 z-20 shrink-0 border-t border-white/80 bg-white/65 px-3 pb-4 pt-4 shadow-[0_-10px_35px_rgba(42,65,42,0.045)] backdrop-blur-2xl sm:px-7 sm:pb-6">
          <div className="mx-auto max-w-4xl">
            <form
              onSubmit={handleSubmit}
              className="rounded-[26px] border border-[#e3eadf] bg-white/90 p-2.5 shadow-[0_12px_34px_rgba(49,67,48,0.085)] ring-1 ring-white/80 backdrop-blur-xl transition-all duration-200 focus-within:border-[#a9c3a2] focus-within:shadow-[0_16px_38px_rgba(49,67,48,0.12)] focus-within:ring-4 focus-within:ring-[#dce9d6]/60"
            >
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask AyurAI anything about wellness..."
                disabled={isSending}
                className="block max-h-40 min-h-[48px] w-full resize-none bg-transparent px-3 py-3 text-sm leading-6 text-[#354a37] outline-none placeholder:text-[#a3a394]"
              />

              <div className="flex items-center justify-between px-2 pb-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf1e7] text-[#65805b]">
                    <Leaf size={15} />
                  </span>

                  <span className="text-[10px] text-[#96998b]">
                    Wellness guidance, thoughtfully.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!message.trim() || isSending}
                  aria-label="Send message"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#267147] to-[#123e29] text-white shadow-[0_7px_16px_rgba(24,84,50,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(24,84,50,0.25)] active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:bg-[#c9d0c3]"
                >
                  {isSending ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <ArrowUp
                      size={19}
                      strokeWidth={2.3}
                    />
                  )}
                </button>
              </div>
            </form>

            <p className="mt-3 px-2 text-center text-[9px] leading-5 text-[#a09f91] sm:text-[10px]">
              AyurAI provides general wellness information, not medical
              diagnosis or treatment. Consult a qualified healthcare
              professional for medical concerns.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AIChat;
