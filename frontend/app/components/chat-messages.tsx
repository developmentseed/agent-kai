import { useMemo } from 'react';
import { formatDistance } from 'date-fns';
import { Flex, Heading, Text } from '@chakra-ui/react';

import useChatStore from '$stores/chat-store';
import { ChatMessage } from '$stores/types';
import useArtifactStore from '$stores/artifact-store';
import {
  ARTIFACT_UI_COMPONENTS,
  ArtifactMessages,
  ArtifactUIConfig
} from '$artifacts/config';
import { ChatRating } from './chat-rating';
import { ChatUserBubble } from './chat-user-bubble';
import { MarkdownRenderer } from './md-renderer';
import { Logo } from './logo';

export function ChatMessages() {
  const { messages } = useChatStore();

  const groupedMessages = useMemo(
    () =>
      messages.reduce(
        (acc, msg) => {
          if (['user', 'error'].includes(msg.type)) {
            return [...acc, msg];
          }
          const lastMsg = acc[acc.length - 1];
          return Array.isArray(lastMsg)
            ? [...acc.slice(0, -1), [...lastMsg, msg]]
            : [...acc, [msg]];
        },
        [] as (ChatMessage | ChatMessage[])[]
      ),
    [messages]
  );

  return (
    <Flex as='article' direction='column' flex={1} gap={4} w='100%'>
      {groupedMessages.map((group) =>
        Array.isArray(group) ? (
          <Flex
            key={group[0].id}
            direction='column'
            gap={4}
            borderRadius='lg'
            p={4}
            layerStyle='handDrawn'
            border='2px solid {colors.basi.200}'
          >
            <Flex as='header' gap={2} alignItems='center'>
              <Logo boxSize='6' />
              <Heading as='p' size='sm'>
                Assistant
              </Heading>
              <Text
                as='time'
                fontSize='xs'
                color='basi.400'
                fontFamily='heading'
              >
                {formatDistance(new Date(group[0].timestamp), new Date())} ago
              </Text>
            </Flex>

            <Flex direction='column' gap={4}>
              {group.map((msg) => (
                <Message key={msg.id} content={msg} />
              ))}
            </Flex>
            {group[0].traceId !== 'initial-message' && (
              <Flex as='footer'>
                <ChatRating traceId={group[0].traceId!} />
              </Flex>
            )}
          </Flex>
        ) : (
          <Message key={group.id} content={group} />
        )
      )}
    </Flex>
  );
}

function Message({ content }: { content: ChatMessage }) {
  const { setArtifact, closeArtifact, artifact } = useArtifactStore();

  // @ts-expect-error Typescript has issues with accessing object by dynamic key
  const artifactUi = ARTIFACT_UI_COMPONENTS[content.type] as
    | ArtifactUIConfig<ArtifactMessages['type']>
    | undefined;

  if (content.type === 'user') {
    return (
      <ChatUserBubble
        key={content.id}
        message={content.message as string}
        timestamp={content.timestamp}
      />
    );

    // Render the artifact callout if there's one for this type.
  } else if (artifactUi) {
    const common: React.ComponentProps<typeof artifactUi.callout> = {
      isOpen: artifact.isOpen && artifact.id === content.id,
      onToggle: ({ isOpen }: { isOpen: boolean }) => {
        if (isOpen) {
          return closeArtifact();
        }
        setArtifact(content as ArtifactMessages);
      },
      message: content as ArtifactMessages
    };

    return <artifactUi.callout {...common} />;
  } else if (content.type === 'error') {
    return (
      <Flex
        borderRadius='lg'
        bg='danger.100'
        color='danger.700'
        p={4}
        maxW='60%'
        layerStyle='handDrawn'
      >
        {content.message}
      </Flex>
    );
  } else {
    return <MarkdownRenderer>{content.message}</MarkdownRenderer>;
  }
}
