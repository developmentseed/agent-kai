import { useLayoutEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import { useSearchParams } from 'react-router';
import { Chat } from '$components/chat';
import { ChatArtifact } from '$components/chat-artifact';
import useChatStore from '$stores/chat-store';

export function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sendMessage } = useChatStore();

  useLayoutEffect(() => {
    const prompt = searchParams.get('prompt');
    if (prompt) {
      sendMessage(prompt, true);
      setSearchParams({});
    }
  }, [searchParams, sendMessage, setSearchParams]);

  return (
    <Flex flexGrow={1} direction='row' minH={0} maxW='breakpoint-2xl' w='100%'>
      <Chat />
      <ChatArtifact />
    </Flex>
  );
}
