import { useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Flex,
  ScrollArea,
  useScrollArea
} from '@chakra-ui/react';

import useChatStore from '$stores/chat-store';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';

export function Chat() {
  const { messages, sendMessage, isLoading } = useChatStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollAreaPadRef = useRef<HTMLDivElement>(null);

  const scrollArea = useScrollArea();

  // Auto-scroll to bottom when new messages are added or loading state changes
  useEffect(() => {
    const saViewport = scrollAreaRef.current;
    const saContent = saViewport?.firstChild as HTMLElement | null;
    if (!saContent || !saViewport) return;

    const bubbles = saContent.querySelectorAll('[data-bubble-type="user"]');
    const lastBubble = bubbles.item(bubbles.length - 1) as HTMLElement | null;
    if (!lastBubble) return;

    const viewportHeight = saViewport.clientHeight;

    // Do not consider the padder height.
    const distanceFromBottom =
      saContent.scrollHeight -
      lastBubble.offsetTop -
      scrollAreaPadRef.current!.clientHeight;

    // Hide block padder
    scrollAreaPadRef.current!.style.display = 'none';

    if (distanceFromBottom <= viewportHeight) {
      // Show block padder
      scrollAreaPadRef.current!.style.display = 'block';
      const padHeight = viewportHeight - distanceFromBottom - 24;
      scrollAreaPadRef.current!.style.height = `${padHeight}px`;
    }

    if (messages[messages.length - 1].type === 'user') {
      scrollArea.scrollToEdge({ edge: 'bottom', behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <Flex flexGrow={1} direction='column' minH={0} minW={0} gap={4}>
      <ScrollArea.RootProvider
        value={scrollArea}
        maxW='5xl'
        w='100%'
        flexGrow={1}
        mx='auto'
        px={4}
        scrollShadow='vertical'
      >
        <ScrollArea.Viewport ref={scrollAreaRef}>
          <ScrollArea.Content
            display='flex'
            flexDirection='column'
            minWidth='auto !important'
          >
            <ChatMessages />
            <Box ref={scrollAreaPadRef} display='none' aria-hidden='true' />
          </ScrollArea.Content>
        </ScrollArea.Viewport>

        <ScrollArea.Scrollbar />
      </ScrollArea.RootProvider>
      <Container
        px={4}
        bg='white'
        maxW='5xl'
        display='flex'
        flexDirection='column'
      >
        <ChatInput
          onSubmit={async (message) => {
            sendMessage(message);
          }}
          isLoading={isLoading}
        />
      </Container>
    </Flex>
  );
}
