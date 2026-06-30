import { create } from 'zustand';

interface Message {
  id: string;
  sender: 'USER' | 'AI';
  contenu: string;
  createdAt: string;
}

export interface AgentStep {
  agent: string;
  status: string;
}

export interface QualityInfo {
  passed: boolean;
  confidence: number | null;
  hallucinationRisk: number | null;
}

export interface ChatServicePoint {
  id: string;
  type: string;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string | null;
  horaires: string | null;
  url: string | null;
  distanceKm?: number | null;
}

interface ConversationStore {
  activeConversationId: string | null;
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  sources: any[];
  agentSteps: AgentStep[];
  quality: QualityInfo | null;
  folderId: string | null;
  services: ChatServicePoint[];
  servicesLocated: boolean;
  setActiveConversation: (id: string | null) => void;
  setMessages: (msgs: Message[]) => void;
  appendMessage: (msg: Message) => void;
  setStreaming: (v: boolean) => void;
  appendStreamChunk: (chunk: string) => void;
  setSources: (s: any[]) => void;
  pushAgentStep: (step: AgentStep) => void;
  setQuality: (q: QualityInfo | null) => void;
  setFolderId: (id: string | null) => void;
  setServices: (services: ChatServicePoint[], located: boolean) => void;
  resetAgentRun: () => void;
  resetStream: () => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  activeConversationId: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  sources: [],
  agentSteps: [],
  quality: null,
  folderId: null,
  services: [],
  servicesLocated: false,
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setMessages: (messages) => set({ messages }),
  appendMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setStreaming: (v) => set({ isStreaming: v }),
  appendStreamChunk: (chunk) => set((s) => ({ streamingContent: s.streamingContent + chunk })),
  setSources: (sources) => set({ sources }),
  pushAgentStep: (step) =>
    set((s) => {
      const existing = s.agentSteps.findIndex((a) => a.agent === step.agent);
      if (existing >= 0) {
        const next = [...s.agentSteps];
        next[existing] = step;
        return { agentSteps: next };
      }
      return { agentSteps: [...s.agentSteps, step] };
    }),
  setQuality: (quality) => set({ quality }),
  setFolderId: (folderId) => set({ folderId }),
  setServices: (services, servicesLocated) => set({ services, servicesLocated }),
  resetAgentRun: () =>
    set({
      agentSteps: [],
      quality: null,
      sources: [],
      folderId: null,
      services: [],
      servicesLocated: false,
    }),
  resetStream: () => set({ streamingContent: '', isStreaming: false }),
}));
