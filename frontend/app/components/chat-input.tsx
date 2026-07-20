import { useEffect, useRef, useState } from 'react';
import { Box, Button, Flex, Spinner, Textarea } from '@chakra-ui/react';
import { PiArrowUp } from 'react-icons/pi';

interface ChatInputProps {
  onSubmit: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export function ChatInput(props: ChatInputProps) {
  const { onSubmit, isLoading } = props;
  const [input, setInput] = useState('');
  const inputFieldRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (input.trim()) {
      await onSubmit(input);
      setInput('');
    }
  };

  useEffect(() => {
    if (!isLoading && inputFieldRef.current) {
      inputFieldRef.current.focus();
    }
  }, [isLoading]);

  return (
    <Flex flexDirection='column' gap={2} w='100%'>
      <Box
        as='form'
        w='100%'
        position='relative'
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSend();
        }}
      >
        <Textarea
          ref={inputFieldRef}
          pr='7rem'
          resize='none'
          minH='1.5rem'
          rows={2}
          fontSize='sm'
          borderRadius='lg'
          borderColor='basi.200'
          borderWidth='2px'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ask me anything...'
          bg='white'
          layerStyle='handDrawn'
          _focus={{}}
          onKeyDown={async (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              await handleSend();
            }
          }}
          disabled={isLoading}
          boxShadow='md'
        />
        <Button
          type='submit'
          size='md'
          position='absolute'
          top='50%'
          transform='translate(0, -50%)'
          right='0.75rem'
          zIndex={1}
          aria-label='Send'
          disabled={isLoading}
        >
          Send {isLoading ? <Spinner size='sm' /> : <PiArrowUp />}
        </Button>
      </Box>
    </Flex>
  );
}
