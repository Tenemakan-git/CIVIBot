import { useCallback, useRef } from 'react';
import { API_URL } from '../lib/constants';
import { useConversationStore } from '../stores/conversationStore';

interface SendOptions {
  conversationId?: string | null;
  onConversationId?: (id: string) => void;
  /** Position du navigateur (optionnelle) pour l'orientation par proximité. */
  coords?: { lat: number; lng: number } | null;
}

/**
 * Consomme le flux SSE de l'endpoint agentique `POST /agent/messages`.
 * EventSource ne supporte que GET sans en-tête : on utilise donc `fetch`
 * streaming (POST + Bearer) et on parse les trames `data: {...}` manuellement.
 *
 * Événements gérés : status, agent_step, sources, quality, chunk, done, error.
 * Le flux est annulable via `cancel()` (AbortController) : tout nouvel envoi
 * annule aussi la requête précédente encore en cours.
 */
export function useAgentStream() {
  const {
    appendStreamChunk, setSources, setStreaming, appendMessage,
    resetStream, resetAgentRun, pushAgentStep, setQuality, setFolderId, setServices,
  } = useConversationStore();

  const abortRef = useRef<AbortController | null>(null);

  /** Interrompt le flux en cours (bouton stop / changement de contexte). */
  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (message: string, opts: SendOptions = {}) => {
      // Annule une éventuelle requête encore en vol avant d'en démarrer une autre.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      resetAgentRun();
      resetStream();
      setStreaming(true);

      const token = localStorage.getItem('civibot_token');
      let full = '';

      try {
        const res = await fetch(`${API_URL}/agent/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message,
            conversationId: opts.conversationId ?? undefined,
            lat: opts.coords?.lat,
            lng: opts.coords?.lng,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Lecture du flux par morceaux ; on découpe sur "\n\n" (séparateur SSE).
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const frames = buffer.split('\n\n');
          buffer = frames.pop() ?? '';

          for (const frame of frames) {
            const dataLine = frame.split('\n').find((l) => l.startsWith('data: '));
            if (!dataLine) continue;
            let data: any;
            try {
              data = JSON.parse(dataLine.slice(6));
            } catch {
              continue;
            }
            full = handleEvent(data, full);
          }
        }
      } catch {
        if (controller.signal.aborted) {
          // Annulation volontaire : on conserve la réponse partielle déjà reçue.
          if (full.trim()) {
            appendMessage({
              id: Date.now().toString(),
              sender: 'AI',
              contenu: full,
              createdAt: new Date().toISOString(),
            });
          }
          setStreaming(false);
        } else {
          appendMessage({
            id: Date.now().toString(),
            sender: 'AI',
            contenu:
              "Impossible de contacter le serveur. Vérifiez que le backend est démarré et réessayez.",
            createdAt: new Date().toISOString(),
          });
          setStreaming(false);
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }

      function handleEvent(data: any, acc: string): string {
        switch (data.type) {
          case 'status':
            if (data.conversationId) opts.onConversationId?.(data.conversationId);
            return acc;
          case 'agent_step':
            pushAgentStep({ agent: data.agent, status: data.status });
            return acc;
          case 'sources':
            setSources(data.sources ?? []);
            if (data.folderId) setFolderId(data.folderId);
            return acc;
          case 'services':
            setServices(data.services ?? [], !!data.located);
            return acc;
          case 'quality':
            setQuality({
              passed: data.passed,
              confidence: data.confidence,
              hallucinationRisk: data.hallucinationRisk,
            });
            return acc;
          case 'chunk':
            appendStreamChunk(data.content);
            return acc + data.content;
          case 'done':
            appendMessage({
              id: Date.now().toString(),
              sender: 'AI',
              contenu: acc,
              createdAt: new Date().toISOString(),
            });
            setStreaming(false);
            return acc;
          case 'error':
            appendMessage({
              id: Date.now().toString(),
              sender: 'AI',
              contenu:
                data.message ||
                "Aucune IA disponible pour le moment. Réessayez plus tard.",
              createdAt: new Date().toISOString(),
            });
            setStreaming(false);
            return acc;
          default:
            return acc;
        }
      }
    },
    [
      appendStreamChunk, setSources, setStreaming, appendMessage,
      resetStream, resetAgentRun, pushAgentStep, setQuality, setFolderId, setServices,
    ],
  );

  return { send, cancel };
}
