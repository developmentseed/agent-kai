import { ArtifactImage, ArtifactMessages } from '$artifacts/config';

export type ArtifactChatMessage<T, D> = {
  traceId: string;
  id: string;
  timestamp: string;
  type: T;
  message: null;
  data: D;
};

export type ChatMessage =
  | {
      traceId?: undefined;
      type: 'user';
      message: string;
      data?: never;
      id: string;
      timestamp: string;
    }
  | {
      traceId?: undefined;
      type: 'error';
      message: string;
      data?: object;
      id: string;
      timestamp: string;
    }
  | {
      traceId: string;
      type: 'assistant';
      message: string;
      data?: never;
      id: string;
      timestamp: string;
    }
  | ArtifactMessages;

export interface AgentMessage {
  content: string;

  /** Extra payload data associated with the message (tool calls, etc.). */
  additional_kwargs: Record<string, unknown>;

  /** Response metadata (headers, token counts, etc.). */
  response_metadata: Record<string, unknown>;

  /** A string that is unique to the message type. */
  type: string;

  /** Optional human-readable name. */
  name?: string | null;

  /** Optional unique identifier (numbers coerced to string in Python). */
  id?: string | null;
}
export interface AgentStreamMessage {
  trace_id: string;
  state: AgentStateMessage;
}

export interface AgentStateMessage {
  messages: ReadonlyArray<AgentMessage>;
  error?: unknown | null;

  /** AgentState-specific fields */
  parameter_infos: ArtifactParameter[];
  polytope_request?: ArtifactPolytope | null;
  dt_plot?: ArtifactPlot | null;
  aoi?: ArtifactAOI | null;
  image?: ArtifactImage | null;

  remaining_steps: number;
  onyx_chat_session_id?: string | null;
  onyx_chat_auth_cookie?: string | null;
}
