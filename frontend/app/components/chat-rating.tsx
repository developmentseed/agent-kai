import {
  Button,
  ButtonGroup,
  Field,
  Flex,
  Heading,
  IconButton,
  Input,
  NativeSelect,
  Popover,
  Portal,
  Presence,
  Text,
  Textarea
} from '@chakra-ui/react';
import { useActionState, useEffect, useState } from 'react';
import useChatStore from '$stores/chat-store';
import { PiCheck, PiThumbsDown, PiThumbsUp, PiX } from 'react-icons/pi';

interface ChatRatingProps {
  traceId: string;
}

export function ChatRating(props: ChatRatingProps) {
  const { traceId } = props;
  const { sendRating } = useChatStore();

  const [open, setOpen] = useState(false);

  const [showMessage, setShowMessage] = useState(false);
  useEffect(() => {
    if (showMessage) {
      const tid = setTimeout(() => setShowMessage(false), 2000);
      return () => clearTimeout(tid);
    }
  }, [showMessage]);

  const [rating, setRating] = useState(0);
  const [isSuccess, submitAction, isPending] = useActionState<
    boolean | null,
    FormData
  >(async (_, formData) => {
    const rating = formData.get('rating') as string;
    const feedback = formData.get('feedback') as string;
    const issue = formData.get('issue') as string;
    // Handle form submission
    try {
      await sendRating(traceId, { rating: parseInt(rating), feedback, issue });
      return true;
    } catch (error) {
      setRating(0);
      // eslint-disable-next-line no-console
      console.log('Error submitting rating', error);
      return false;
    } finally {
      setShowMessage(true);
      setOpen(false);
    }
  }, null);

  const getRatingStyle = (value: number) => ({
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setOpen(true);
      setRating(value);
    },
    'data-active': rating === value ? '' : undefined,
    _active: {
      bg: 'basi.100a'
    },
    disabled: isPending
  });

  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ placement: 'left' }}
    >
      <Flex gap={4} alignItems='center'>
        <Popover.Trigger asChild>
          <ButtonGroup variant='ghost' attached>
            <IconButton {...getRatingStyle(1)}>
              <PiThumbsUp />
            </IconButton>
            <IconButton {...getRatingStyle(-1)}>
              <PiThumbsDown />
            </IconButton>
          </ButtonGroup>
        </Popover.Trigger>
        <Presence
          present={showMessage}
          animationName={{
            _open: 'fade-in',
            _closed: 'fade-out'
          }}
          animationDuration='moderate'
          unmountOnExit
        >
          {isSuccess ? (
            <Text color='primary.700'>Thank you for your feedback!</Text>
          ) : (
            <Text color='red.700'>
              Oh, no! Something went wrong. Please try again later.
            </Text>
          )}
        </Presence>
      </Flex>
      <Portal>
        <Popover.Positioner>
          <Popover.Content layerStyle='handDrawn'>
            <Popover.Arrow />
            <Popover.Header display='flex'>
              <Heading as='h3' size='md'>
                How did I do?
              </Heading>
              <Popover.CloseTrigger asChild>
                <IconButton type='reset' size='sm' variant='ghost' ml='auto'>
                  <PiX />
                </IconButton>
              </Popover.CloseTrigger>
            </Popover.Header>
            <Popover.Body>
              <Flex
                as='form'
                direction='column'
                gap={4}
                // @ts-expect-error React thinks this is a div.
                action={submitAction}
                onReset={() => {
                  setRating(0);
                  setOpen(false);
                }}
              >
                <ButtonGroup variant='ghost'>
                  <Button {...getRatingStyle(1)}>
                    Good <PiThumbsUp />
                  </Button>
                  <Button {...getRatingStyle(-1)}>
                    Bad <PiThumbsDown />
                  </Button>
                </ButtonGroup>

                {rating < 0 && (
                  <Field.Root>
                    <Field.Label>
                      What type of issue do you wish to report? (optional)
                    </Field.Label>
                    <NativeSelect.Root size='sm'>
                      <NativeSelect.Field
                        placeholder='Select option'
                        name='issue'
                      >
                        <option>UI bug</option>
                        <option>Did not fully follow my request</option>
                        <option>Not factually correct</option>
                        <option>Incomplete response</option>
                        <option>Wrong or missing reference</option>
                        <option>Other</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                )}

                <Field.Root>
                  <Field.Label>Please provide details (optional)</Field.Label>
                  <Textarea
                    name='feedback'
                    placeholder={
                      rating > 0
                        ? 'What was satisfying about this response?'
                        : 'What was unsatisfying about this response?'
                    }
                    resize='none'
                    disabled={isPending}
                  />
                  <Input type='hidden' name='rating' value={rating} />
                </Field.Root>
                <Text fontSize='xs' color='basi.400'>
                  Your feedback will help us improve your experience!
                </Text>
                <Flex gap={4}>
                  <Button
                    type='reset'
                    variant='soft-outline'
                    loading={isPending}
                  >
                    Cancel <PiX />
                  </Button>
                  <Button type='submit' alignSelf='start' loading={isPending}>
                    Submit <PiCheck />
                  </Button>
                </Flex>
              </Flex>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
