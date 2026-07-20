/**
 * Configuration and type definitions for handling artifacts.
 *
 * This module provides type definitions and utilities for processing various
 * artifact types
 *
 * @module artifacts/config
 */
import { PiFileImage, PiPolygon } from 'react-icons/pi';
import {
  ChatArtifactCallout,
  ChatArtifactCalloutProps
} from '$components/chat-artifact';
import {
  AgentStreamMessage,
  ArtifactChatMessage,
  ChatMessage
} from '$stores/types';
import { ArtifactAOI } from './components/chat-artifact-aoi';
import { ArtifactImage } from './components/chat-artifact-image';

export interface ArtifactUIConfig<T> {
  callout: React.FC<
    Pick<ChatArtifactCalloutProps, 'isOpen' | 'onToggle'> & {
      message: Extract<ArtifactMessages, { type: T }>;
    }
  >;
  component: React.FC<{
    id: string;
    data: Extract<ArtifactMessages, { type: T }>['data'];
  }>;
}

/*
 * ============================================================================
 * How to add a new artifact
 * ============================================================================
 *
 * This guide explains how to add a new artifact type to the application.
 *
 * 1. Define the artifact type and data structure
 * --------------------------------------------------------------------------
 *
 * First, you need to define the type and data structure for the new artifact.
 * This is done in this file (`frontend/app/artifacts/config.tsx`).
 *
 * Add a new type to the `ArtifactMessages` union type. For example, to add a
 * new artifact for displaying a chart, you would add a new interface for the
 * chart data and then add it to the `ArtifactMessages` type.
 */

export type ArtifactAOI = GeoJSON.Feature;

export interface ArtifactImage {
  type: 'image/png';
  data?: string; // base64-encoded PNG (no data: prefix assumed)
  url?: string; // URL to the image if not embedded
}

export type ArtifactMessages =
  | ArtifactChatMessage<'aoi', ArtifactAOI>
  | ArtifactChatMessage<'image', ArtifactImage>;

/*
 * 2. Create a new component to display the artifact
 * --------------------------------------------------------------------------
 *
 * Next, create a new React component to render the artifact. These components
 * are located in the `frontend/app/artifacts/components/` directory.
 *
 * The component should accept the artifact's data as a prop and use the
 * `Artifact` component from `$components/chat-artifact` as a wrapper to
 * ensure a consistent look and feel.
 */

/*
 * 3. Register the new artifact in `ARTIFACT_UI_COMPONENTS`
 * --------------------------------------------------------------------------
 *
 * Now, you need to register the new artifact in the `ARTIFACT_UI_COMPONENTS`
 * object in this file. This registry maps artifact types to their
 * corresponding UI components.
 *
 * Add a new entry to the `ARTIFACT_UI_COMPONENTS` object. This entry should
 * include a `callout` component (for the inline preview in the chat) and the
 * `component` you just created.
 */

/**
 * Registry mapping artifact message types to their corresponding UI components.
 *
 * Each artifact type has an associated callout component (for inline previews)
 * and a full component (for detailed views).
 *
 */
export const ARTIFACT_UI_COMPONENTS = {
  aoi: {
    callout: (props) => (
      <ChatArtifactCallout
        title={`Area of Interest: ${props.message.data.properties?.name}`}
        subtitle='Selected aoi from prompt'
        icon={<PiPolygon />}
        {...props}
      />
    ),
    component: ArtifactAOI
  } as ArtifactUIConfig<'aoi'>,
  image: {
    callout: (props) => (
      <ChatArtifactCallout title='Image' icon={<PiFileImage />} {...props} />
    ),
    component: ArtifactImage
  } as ArtifactUIConfig<'image'>
};

/*
 * 4. Handle the new artifact type in `processArtifactMessage`
 * --------------------------------------------------------------------------
 *
 * Finally, you need to update the `processArtifactMessage` function in this
 * file to handle the new artifact type when it is received from the agent.
 *
 * Add a new `if` block to the function to check for the new artifact type in
 * the incoming `stateMessage` and create a new message with the correct type.
 */

/**
 * Processes an incoming agent stream message and extracts artifacts to add to
 * the chat.
 *
 *
 * @param {AgentStreamMessage} streamMessage - The incoming stream message from
 * the agent
 * @param {(message: Omit<ChatMessage, 'id'>) => void} addMessage - Callback
 * function to add processed messages to the chat
 *
 */
export function processArtifactMessage(
  streamMessage: AgentStreamMessage,
  addMessage: (message: Omit<ChatMessage, 'id'>) => void
) {
  const stateMessage = streamMessage.state;
  const traceId = streamMessage.trace_id;

  const timestamp = new Date().toISOString();

  if (stateMessage?.aoi) {
    addMessage({
      traceId,
      type: 'aoi',
      message: '',
      data: stateMessage.aoi,
      timestamp
    });
  }

  if (stateMessage?.image) {
    addMessage({
      traceId,
      type: 'image',
      message: '',
      data: stateMessage.image,
      timestamp
    });
  }
}
