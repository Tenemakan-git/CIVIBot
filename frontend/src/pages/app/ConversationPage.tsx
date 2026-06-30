import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Send, FileDown, Square } from 'lucide-react';
import { useConversationStore } from '../../stores/conversationStore';
import { useAgentStream } from '../../hooks/useAgentStream';
import { api } from '../../services/api';
import { API_URL } from '../../lib/constants';
import MessageBubble from '../../components/chat/MessageBubble';
import StreamingMessage from '../../components/chat/StreamingMessage';
import ContextPanel from '../../components/chat/ContextPanel';
import AgentTimeline from '../../components/chat/AgentTimeline';
import ChatServicesCard from '../../components/chat/ChatServicesCard';
import { useQueryClient } from '@tanstack/react-query';

export default function ConversationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const {
    messages, setMessages, isStreaming, streamingContent,
    activeConversationId, setActiveConversation, appendMessage,
    sources, resetStream, resetAgentRun, agentSteps, quality, folderId,
    services, servicesLocated,
  } = useConversationStore();

  const { send, cancel } = useAgentStream();

  // Géolocalisation best-effort (consentement navigateur) pour l'orientation.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        coordsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
    );
  }, []);

  useEffect(() => {
    if (id) {
      setActiveConversation(id);
      api.get(`/conversations/${id}/messages`)
        .then(r => setMessages(r.data))
        .catch(() => {});
    } else {
      setActiveConversation(null);
      setMessages([]);
      resetStream();
      resetAgentRun();
    }
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, agentSteps]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput('');

    appendMessage({
      id: Date.now().toString(),
      sender: 'USER',
      contenu: text,
      createdAt: new Date().toISOString(),
    });

    await send(text, {
      conversationId: activeConversationId,
      coords: coordsRef.current,
      onConversationId: (cid) => {
        if (!activeConversationId) {
          setActiveConversation(cid);
          navigate(`/app/conversations/${cid}`);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      },
    });
  };

  const downloadPdf = async () => {
    if (!folderId) return;
    const token = localStorage.getItem('civibot_token');
    const res = await fetch(`${API_URL}/folders/${folderId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dossier-civibot.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const SUGGESTIONS = [
    'Comment déclarer une naissance ?',
    'Comment créer une SARL en Côte d\'Ivoire ?',
    'Quels documents pour un mariage civil ?',
    'Comment obtenir un certificat de nationalité ?',
  ];

  const showTimeline = isStreaming || agentSteps.length > 0;

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        {messages.length === 0 && !isStreaming ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3 px-4">
              <p className="text-xl font-semibold text-gray-700">Bonjour ! Je suis CiviBot.</p>
              <p className="text-gray-400 text-sm">Confiez-moi une démarche : une équipe d'agents IA la traite pour vous.</p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {SUGGESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-left p-3 border rounded-lg text-sm text-gray-700 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(m => <MessageBubble key={m.id} message={m} />)}

            {showTimeline && (
              <div className="space-y-2">
                <AgentTimeline steps={agentSteps} streaming={isStreaming} quality={quality} />
                {services.length > 0 && (
                  <ChatServicesCard services={services} located={servicesLocated} />
                )}
                {folderId && !isStreaming && (
                  <button
                    onClick={downloadPdf}
                    className="inline-flex items-center gap-2 text-xs font-medium text-orange-700 border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition-colors"
                  >
                    <FileDown size={14} />
                    Télécharger le dossier (PDF)
                  </button>
                )}
              </div>
            )}

            {isStreaming && streamingContent && <StreamingMessage content={streamingContent} />}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="border-t p-4 bg-white">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Posez votre question sur vos démarches administratives..."
              className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              rows={2}
            />
            {isStreaming ? (
              <button
                onClick={cancel}
                title="Arrêter la génération"
                className="bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 transition-colors self-end"
              >
                <Square size={18} />
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="bg-orange-600 text-white rounded-lg px-4 py-2 hover:bg-orange-700 disabled:opacity-50 transition-colors self-end"
              >
                <Send size={18} />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">Entrée pour envoyer · Maj+Entrée pour nouvelle ligne</p>
        </div>
      </div>

      {sources.length > 0 && <ContextPanel sources={sources} />}
    </div>
  );
}
