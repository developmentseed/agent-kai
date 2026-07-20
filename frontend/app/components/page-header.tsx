import {
  Button,
  Flex,
  Heading,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';
import { useMatch } from 'react-router';
import { PiArrowsClockwise } from 'react-icons/pi';

import useChatStore from '$stores/chat-store';
import useArtifactStore from '$stores/artifact-store';
import { Logo } from './logo';
import SmartLink from './smart-link';

export function PageHeader() {
  const { reset: resetChat } = useChatStore();
  const { reset: resetArtifact } = useArtifactStore();
  const isChatPage = useMatch('/chat');

  const reset = () => {
    resetChat();
    resetArtifact();
  };

  const appTitle = useBreakpointValue({
    base: import.meta.env.VITE_APP_TITLE_SHORT,
    md: import.meta.env.VITE_APP_TITLE
  });

  return (
    <Flex
      as='header'
      borderBottom='2px solid {colors.basi.200}'
      w='100%'
      justifyContent='center'
    >
      <Flex
        justify='space-between'
        alignItems='center'
        w='100%'
        maxW='8xl'
        py={4}
        px={{
          base: 4,
          md: 8
        }}
      >
        <Flex gap={4}>
          <Heading
            display='flex'
            gap={4}
            alignItems='center'
            asChild
            size={{ base: 'md', md: 'lg' }}
          >
            <SmartLink to='/' unstyled onClick={reset}>
              <Flex alignItems='center' gap={2}>
                <Logo height={{ base: 5, md: 6 }} />
                {appTitle}
              </Flex>
            </SmartLink>
          </Heading>
        </Flex>

        <Flex as='nav'>
          <SmartLink to='/' onClick={reset} unstyled asChild>
            <Button
              variant='soft-outline'
              disabled={!isChatPage}
              px={{
                mdDown: 2
              }}
            >
              <Text as='span' hideBelow='md'>
                New Chat
              </Text>{' '}
              <PiArrowsClockwise />
            </Button>
          </SmartLink>
        </Flex>
      </Flex>
    </Flex>
  );
}
