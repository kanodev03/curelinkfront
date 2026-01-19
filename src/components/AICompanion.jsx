import { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { Send, MessageCircle, X, Plus } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function AICompanion() {
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chats on mount
  useEffect(() => {
    if (isOpen) {
      loadChats();
    }
  }, [isOpen]);

  // Load specific chat
  useEffect(() => {
    if (currentChatId) {
      loadChat(currentChatId);
    }
  }, [currentChatId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    setLoadingChats(true);
    try {
      const res = await API.get('/chat');
      setChats(res.data);
      if (res.data.length === 0) {
        createNewChat();
      } else if (!currentChatId) {
        setCurrentChatId(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadChat = async (chatId) => {
    try {
      const res = await API.get(`/chat/${chatId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const createNewChat = async () => {
    try {
      const res = await API.post('/chat', { title: `Chat ${new Date().toLocaleDateString()}` });
      setChats([res.data, ...chats]);
      setCurrentChatId(res.data._id);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentChatId) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setLoading(true);

    try {
      const res = await API.post(`/chat/${currentChatId}/message`, {
        message: userMsg
      });
      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await API.delete(`/chat/${chatId}`);
      const updated = chats.filter((c) => c._id !== chatId);
      setChats(updated);
      if (updated.length > 0) {
        setCurrentChatId(updated[0]._id);
        loadChat(updated[0]._id);
      } else {
        setCurrentChatId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-[#038474] hover:bg-[#096187] text-white rounded-full p-4 shadow-lg transition transform hover:scale-110 flex items-center justify-center"
        title="AI Health Companion"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl flex flex-col h-[600px] w-[400px] z-50 border-2 border-[#038474]">
      {/* Header */}
      <div className="text-white p-4 rounded-t-lg flex justify-between items-center" style={{ backgroundColor: '#038474' }}>
        <div>
          <h3 className="font-bold">AI Health Companion</h3>
          <p className="text-xs opacity-90">Health guidance and support</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 p-1 rounded"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chats Sidebar */}
        <div className="w-1/3 border-r bg-[#EEEEEE] flex flex-col">
          <button
            onClick={createNewChat}
            className="m-2 p-2 bg-[#038474] text-white rounded text-sm flex items-center justify-center gap-1 hover:bg-[#096187] transition"
          >
            <Plus size={16} /> New
          </button>

          {loadingChats ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  className={`p-2 m-1 rounded text-xs transition border ${
                    currentChatId === chat._id ? 'bg-[#038474] text-white border-[#038474]' : 'bg-white hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setCurrentChatId(chat._id)}
                    >
                      <div className="truncate font-semibold">{chat.title}</div>
                      <div className="text-[10px] opacity-70">
                        {new Date(chat.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteChat(chat._id)}
                      className={`p-1 rounded ${currentChatId === chat._id ? 'hover:bg-white/20' : 'hover:bg-gray-200'}`}
                      title="Delete chat"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="w-2/3 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ backgroundColor: '#F7F7F7' }}>
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle size={32} className="mx-auto opacity-30 mb-2" />
                <p className="text-sm">Start a conversation with your AI companion</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-2 rounded text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#096187] text-white rounded-br-none'
                        : 'bg-[#038474] text-white rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-300 p-2 rounded text-sm text-gray-700">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 border-t bg-white rounded-b-lg flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ask about your health..."
              className="flex-1 border border-[#038474] rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#096187]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-[#038474] hover:bg-[#096187] text-white p-2 rounded transition disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
