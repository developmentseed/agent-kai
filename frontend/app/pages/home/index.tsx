import { useNavigate } from 'react-router';
import {
  Flex,
  Heading,
  IconButton,
  List,
  Text,
  VStack
} from '@chakra-ui/react';
import { PiArrowRight } from 'react-icons/pi';

import SmartLink from '$components/smart-link';
import { ChatInput } from '$components/chat-input';

const presetPrompts = [
  {
    title: 'Area of Interest',
    message: 'Show me the capital of Portugal'
  }
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <Flex
      flex={1}
      alignItems='center'
      direction='column'
      gap={24}
      w='100%'
      mt={8}
    >
      <VStack
        gap={2}
        direction='column'
        alignItems='start'
        w='100%'
        maxW='48rem'
        px={4}
      >
        <Heading as='p'>Welcome to your assistant</Heading>
        <Text>
          Agent Kai helps you navigate the different simulations and their
          properties.
        </Text>
        <Text>Try it with one of the presets below:</Text>
      </VStack>

      <List.Root
        unstyled
        gap={8}
        px={4}
        display='grid'
        gridTemplateColumns='1fr 1fr'
        gridTemplateRows='1fr'
        w='100%'
        maxW='48rem'
      >
        {presetPrompts.map((prompt) => (
          <List.Item key={prompt.message}>
            <SmartLink
              to={`/chat?prompt=${encodeURIComponent(prompt.message)}`}
              borderRadius='lg'
              boxShadow='md'
              p={4}
              alignItems='start'
              display='flex'
              flexFlow='column'
              h='100%'
              w='100%'
              bg='white'
              layerStyle='handDrawn'
              transition='background 160ms ease-in-out, color 160ms ease-in-out'
              _hover={{
                textDecor: 'none',
                bg: 'primary.500',
                color: 'white'
              }}
            >
              <Heading as='p' size='md'>
                {prompt.title}
              </Heading>
              <Text>{prompt.message}</Text>
              <IconButton variant='ghost' ml='auto' size='sm' asChild mt='auto'>
                <PiArrowRight />
              </IconButton>
            </SmartLink>
          </List.Item>
        ))}
      </List.Root>

      <Flex w='100%' maxW='48rem' px={4}>
        <ChatInput
          onSubmit={async (message) => {
            navigate(`/chat?prompt=${encodeURIComponent(message)}`);
          }}
        />
      </Flex>
    </Flex>
  );
}
