import { create } from 'zustand';
import { ArtifactMessages } from '$artifacts/config';

interface ArtifactState {
  artifact:
    | {
        isOpen: false;
      }
    | (ArtifactMessages & {
        isOpen: boolean;
      });
}

interface ArtifactActions {
  reset: () => void;
  setArtifact: (msg: ArtifactMessages) => void;
  closeArtifact: () => void;
}

const initialState: ArtifactState = {
  artifact: {
    isOpen: false
  }
};

const useArtifactStore = create<ArtifactState & ArtifactActions>((set) => ({
  ...initialState,

  reset: () => set(initialState),

  setArtifact: (msg: ArtifactMessages) =>
    set({
      artifact: {
        isOpen: true,
        ...msg
      }
    }),
  closeArtifact: () => set({ artifact: { isOpen: false } })
}));

export default useArtifactStore;
