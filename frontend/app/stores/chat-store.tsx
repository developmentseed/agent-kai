import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

import { ChatStream, ChatStreamError } from '$utils/chart-stream';
import { AgentStreamMessage, ChatMessage } from './types';
import { cerror, clog, dev } from '$utils/dev';

import devMesg from './msg.dev.json';
import useArtifactStore from './artifact-store';
import { ArtifactMessages, processArtifactMessage } from '../artifacts/config';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Message types that render as an artifact, and so should pop the artifact
// viewer open when one arrives. Extend this when adding a new artifact type
// to `ArtifactMessages`.
const ARTIFACT_MESSAGE_TYPES: ArtifactMessages['type'][] = ['aoi', 'image'];

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  currentThreadId: string | null;
}

/**
 * Actions exposed by the chat store for managing conversation state and
 * communicating with the backend.
 */
interface ChatActions {
  reset: () => void;
  /**
   * Add a message to the store.
   * @param message Message to store in the chat history.
   * @param clear When true, clear prior messages before adding this one.
   */
  addMessage: (
    message: Omit<ChatMessage, 'id' | 'timestamp'> & { timestamp?: string },
    clear?: boolean
  ) => void;
  /**
   * Send a user message to the backend and persist the resulting message state
   * locally.
   * @param message Raw text of the message to send.
   * @param clear When true, clear prior messages before sending.
   * @returns Promise resolving to an object with:
   *   - isNew: boolean indicating whether the send created a new thread
   *   - id: string identifier for the created or updated message/thread
   *     (server-assigned)
   */
  sendMessage: (
    message: string,
    clear?: boolean
  ) => Promise<{ isNew: boolean; id: string }>;
  /**
   * Submit a rating and optional textual feedback for a given trace/response.
   * @param traceId string  Identifier of the trace or response being rated.
   * @param data Object  Containing rating (number) and optional feedback
   * (string).
   * @returns Promise that resolves once the rating is accepted by the backend.
   */
  sendRating: (
    traceId: string,
    data: { rating: number; feedback?: string; issue?: string }
  ) => Promise<void>;
  /**
   * Toggle the store's loading state used to indicate ongoing async operations.
   * @param loading boolean
   */
  setLoading: (loading: boolean) => void;
  /**
   * Create and return a new thread identifier (string) suitable for starting a
   * new conversation.
   * @returns A new thread identifier string.
   */
  generateNewThread: () => string;
}

const initialState: ChatState = {
  messages: [
    {
      id: '1',
      type: 'assistant',
      message:
        "Hi, I'm your **Assistant**.  \nWhich data or information can I get you today?",
      timestamp: new Date().toISOString(),
      traceId: 'initial-message'
    }
  ],
  isLoading: false,
  currentThreadId: null
};

// Helper function to process stream messages and add them to chat
async function processStreamMessage(
  streamMessage: AgentStreamMessage,
  addMessage: (message: Omit<ChatMessage, 'id'>) => void
) {
  clog('Received stream message', streamMessage);
  const stateMessage = streamMessage.state;
  const traceId = streamMessage.trace_id;

  const timestamp = new Date().toISOString();

  // Handle AI messages
  stateMessage.messages.forEach((msg) => {
    if (msg.type === 'ai' && msg.content) {
      addMessage({
        traceId,
        type: 'assistant',
        message: msg.content,
        timestamp
      });
    }
  });

  if (stateMessage?.error) {
    addMessage({
      traceId,
      type: 'error',
      message: '',
      data: stateMessage.error,
      timestamp
    });
  }

  await processArtifactMessage(streamMessage, addMessage);
}

const chatStream = new ChatStream({ url: `${API_BASE_URL}/chat` });

const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  ...initialState,

  reset: () => {
    set(initialState);
    chatStream.abort();
  },

  addMessage: (message, clear = false) => {
    const newMessage = {
      ...message,
      id: uuidv4(),
      timestamp: message.timestamp || new Date().toISOString()
    } as ChatMessage;

    set((state) => ({
      messages: clear ? [newMessage] : [...state.messages, newMessage]
    }));
  },

  generateNewThread: () => {
    const threadId = uuidv4();
    set({ currentThreadId: threadId });
    return threadId;
  },

  sendMessage: async (message: string, clear = false) => {
    const { addMessage, setLoading, currentThreadId, generateNewThread } =
      get();

    // Generate thread ID if this is the first message
    const threadId = currentThreadId || generateNewThread();

    // Add user message
    addMessage(
      {
        type: 'user',
        message
      },
      clear
    );

    // Clear any previous tool steps and start loading
    setLoading(true);

    // window.count = window.count || 0;
    // window.done = () => setLoading(false);
    // window.message = () => {
    //   window.count++
    //   const m = devMesg.filter(m => m.type !== 'user')
    //   addMessage(m[window.count])
    // }

    // return

    const prompt = {
      thread_id: threadId,
      agent_state: {
        messages: [{ content: message, type: 'human' }]
      }
    };

    try {
      const currMessageCount = get().messages.length;
      await chatStream.sendMessage(
        prompt,
        async (streamMessage: AgentStreamMessage) => {
          try {
            await processStreamMessage(streamMessage, addMessage);
          } catch (err) {
            clog(`Failed to parse stream message`, streamMessage, err);
          }
        }
      );

      // Get new messages added during this stream
      const newMessages = get().messages.slice(currMessageCount);
      const latestArtifact = newMessages
        .reverse()
        .find((msg): msg is ArtifactMessages =>
          ARTIFACT_MESSAGE_TYPES.includes(msg.type as ArtifactMessages['type'])
        );
      if (latestArtifact) {
        // If there's an artifact message, open it in the artifact viewer
        useArtifactStore.getState().setArtifact(latestArtifact);
      }

      clog('Stream ended normally (readerDone = true)');
    } catch (error) {
      cerror('Error sending message:', error);

      if (error instanceof ChatStreamError) {
        if (error.details.status >= 400 && error.details.status < 500) {
          addMessage({
            type: 'error',
            message:
              'The service is currently unavailable. Please try again later.'
          });
        } else if (error.type === 'AbortError') {
          if (error.message === 'Request aborted by user') {
            clog('Request aborted by user, no error message shown.');
          } else {
            cerror('Request aborted due to timeout');
            addMessage({
              type: 'error',
              message:
                'The request timed out on the client side. This might be due to a complex query or server load. Please try again or rephrase your question.'
            });
          }
        } else if (error.type === 'NetworkError') {
          addMessage({
            type: 'error',
            message:
              'A network error occurred while communicating with the server. Please check your connection and try again.'
          });
        } else {
          addMessage({
            type: 'error',
            message:
              'Sorry, there was an error processing your request. Please try again.'
          });
        }
      }
    }
    setLoading(false);

    return { isNew: !currentThreadId, id: threadId };
  },

  setLoading: (loading) => set({ isLoading: loading }),

  sendRating: async (
    traceId: string,
    data: { rating: number; feedback?: string; issue?: string }
  ) => {
    const response = await fetch(`${API_BASE_URL}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        trace_id: traceId,
        rating: data.rating,
        comment: `Issue: ${data.issue}\nFeedback: \n${data.feedback}`
      })
    });

    if (!response.ok) {
      throw new Error(`Network responded with: ${response.status}`);
    }

    clog('Rating submitted successfully');
  }
}));

if (dev('mock-msg')) {
  useChatStore.setState((state) => ({
    ...state,
    messages: devMesg as ChatMessage[]
  }));
}

export default useChatStore;
