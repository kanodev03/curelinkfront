import { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { Pill, Send } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import RoleGuard from '../components/RoleGuard';
import Alert from '../components/Alert';

export default function MedicineSearch() {
  const [messages, setMessages] = useState([]); // {role: 'user'|'assistant', text, medicines?}
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        text: 'Ask me about a symptom or a medicine name, and I will list related medicines with their main details.',
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setLoading(true);
    setAlert(null);

    try {
      // Try symptom-based first
      let res = await API.get(`/medicines/recommendations`, {
        params: { symptom: question },
      });
      let items = Array.isArray(res.data) ? res.data : res.data?.items || [];

      // If nothing came back, fall back to direct medicine search
      if (!Array.isArray(items) || items.length === 0) {
        const params = new URLSearchParams();
        params.append('query', question);
        res = await API.get(`/medicines/search?${params.toString()}`);
        items = Array.isArray(res.data) ? res.data : res.data?.items || [];
      }

      if (!Array.isArray(items) || items.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: "I couldn't find medicines related to that. Try another symptom or a different medicine name.",
          },
          ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'Here are some medicines that match what you asked:',
            medicines: items,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Could not search medicines right now. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['patient']}>
      <div className="min-h-screen" style={{ backgroundColor: '#EEEEEE' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-4 flex items-center gap-2">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ backgroundColor: '#038474' }}
            >
              <Pill size={18} color="white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">Medicine assistant</h1>
              <p className="text-xs text-gray-600">
                Chat about symptoms or medicine names to see matching medicines.
              </p>
            </div>
          </header>

          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          <div
            className="rounded border border-gray-200 flex flex-col"
            style={{ backgroundColor: '#F7F7F7', height: '500px' }}
          >
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-full sm:max-w-[80%] rounded px-3 py-2 text-xs sm:text-sm"
                    style={
                      msg.role === 'user'
                        ? { backgroundColor: '#096187', color: '#FFFFFF' }
                        : { backgroundColor: '#FFFFFF', color: '#222222' }
                    }
                  >
                    <p className="mb-1 whitespace-pre-line">{msg.text}</p>
                    {msg.medicines && msg.medicines.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.medicines.map((m, i) => (
                          <div
                            key={i}
                            className="border border-gray-200 rounded px-2 py-2 bg-[#FDFDFD]"
                          >
                            <div className="flex justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold text-gray-900">
                                  {m.name || 'Unknown'}{' '}
                                  {m.genericName && (
                                    <span className="text-gray-500">
                                      ({m.genericName})
                                    </span>
                                  )}
                                </p>
                                {m.category && (
                                  <p className="text-[10px] text-gray-600 mt-0.5">
                                    {m.category}
                                  </p>
                                )}
                              </div>
                              {typeof m.rating === 'number' && m.rating > 0 && (
                                <p className="text-[10px] text-[#038474]">
                                  ⭐ {m.rating.toFixed(1)}
                                </p>
                              )}
                            </div>
                            {m.description && (
                              <p className="text-[11px] text-gray-700 mt-1">
                                {m.description}
                              </p>
                            )}
                            {Array.isArray(m.uses) && m.uses.length > 0 && (
                              <p className="text-[10px] text-gray-600 mt-1">
                                <span className="font-semibold">Uses:</span>{' '}
                                {m.uses.slice(0, 3).join(', ')}
                              </p>
                            )}
                            {Array.isArray(m.precautions) && m.precautions.length > 0 && (
                              <p className="text-[10px] text-gray-600 mt-1">
                                <span className="font-semibold">Precautions:</span>{' '}
                                {m.precautions.slice(0, 2).join('; ')}
                              </p>
                            )}
                          </div>
                        ))}
                        <p className="text-[10px] text-gray-500">
                          This information is general and not a prescription. Always talk to a
                          doctor or pharmacist before taking medication.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <LoadingSpinner />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-gray-200 bg-white px-2 py-2 flex gap-2 items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe a symptom or enter a medicine name..."
                className="flex-1 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#038474]"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-3 py-1 rounded text-xs sm:text-sm text-white"
                style={{ backgroundColor: '#038474', opacity: loading || !input.trim() ? 0.7 : 1 }}
              >
                <span className="hidden sm:inline">Send</span>
                <span className="sm:hidden">
                  <Send size={14} />
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
