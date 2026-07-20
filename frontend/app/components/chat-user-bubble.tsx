import { Avatar, Flex, Heading, Text } from '@chakra-ui/react';
import { formatDistance } from 'date-fns';

interface ChatUserBubbleProps {
  message: string;
  timestamp: string;
}

export function ChatUserBubble(props: ChatUserBubbleProps) {
  const { message, timestamp } = props;

  return (
    <Flex alignItems='flex-end' direction='column'>
      <Flex
        borderRadius='lg'
        bg='basi.50'
        minW='14rem'
        p={4}
        direction='column'
        gap={1}
        maxW='80%'
        data-bubble-type='user'
        layerStyle='handDrawn'
      >
        <Flex gap={2} alignItems='center'>
          <Avatar.Root shape='rounded' size='xs'>
            <Avatar.Fallback />
          </Avatar.Root>
          <Heading as='p' size='sm'>
            You
          </Heading>
          <Text as='time' fontSize='xs' color='basi.400' fontFamily='heading'>
            {formatDistance(new Date(timestamp), new Date())} ago
          </Text>
        </Flex>

        {message}
      </Flex>
    </Flex>
  );
}
