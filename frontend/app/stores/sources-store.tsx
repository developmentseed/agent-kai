import { create } from 'zustand';
import { cerror } from '$utils/dev';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const SOURCES_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface SourceRecord {
  title?: string;
  description?: string;
  url: string;
  image?: string;
}

interface SourceListEntry {
  date: number;
  fetching: boolean;
  data: SourceRecord;
}

interface SourceState {
  sources: Map<string, SourceListEntry>;
}

interface SourceActions {
  reset: () => void;
  getSource: (url: string) => SourceRecord;
  fetchSource: (url: string, force?: boolean) => Promise<void>;
}

const initialState: SourceState = {
  sources: new Map()
};

const useSourceStore = create<SourceState & SourceActions>((set, get) => ({
  ...initialState,

  reset: () => set(initialState),
  fetchSource: async (url: string, force?: boolean) => {
    if (!force && get().sources.has(url)) {
      const { date, fetching } = get().sources.get(url)!;
      const now = Date.now();
      // Don't refetch if cached recently
      if (fetching || now - date < SOURCES_CACHE_DURATION) {
        return;
      }
    }

    set((state) => {
      const newSources = new Map(state.sources);
      newSources.set(url, { date: Date.now(), fetching: true, data: { url } });
      return { sources: newSources };
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/opengraph?url=${encodeURIComponent(url)}`
      );
      const data: SourceRecord = await response.json();
      set((state) => {
        const newSources = new Map(state.sources);
        newSources.set(url, { date: Date.now(), fetching: false, data });
        return { sources: newSources };
      });
    } catch (error) {
      cerror('Failed to fetch source metadata:', error);
    }
  },

  getSource: (url: string) => {
    if (get().sources.has(url)) {
      const { data } = get().sources.get(url)!;
      return data;
    }

    return { url };
  }
}));

export default useSourceStore;
