import { useEffect } from 'react';
import {
  Button,
  Flex,
  Heading,
  IconButton,
  Image,
  Popover,
  Portal,
  Text,
  Tooltip
} from '@chakra-ui/react';
import { PiArrowSquareOut, PiX } from 'react-icons/pi';

import useSourceStore from '$stores/sources-store';
import SmartLink, { SmartLinkProps } from './smart-link';

function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error ms property
    navigator.msMaxTouchPoints > 0
  );
}

export function SourceLink(props: SmartLinkProps) {
  const { to, ...rest } = props;

  const { getSource, fetchSource } = useSourceStore();
  const source = getSource(to);

  useEffect(() => {
    fetchSource(to);
  }, []);

  return (
    <SourceOverlay
      url={to}
      title={source?.title}
      content={source?.description}
      image={source?.image}
    >
      <Button
        colorPalette='primary'
        size='xs'
        variant='subtle'
        px={1}
        h='auto'
        borderRadius='sm'
        mx={2}
        asChild
      >
        <SmartLink
          to={to}
          target='_blank'
          rel='noopener noreferrer'
          noLinkTrigger={isTouchDevice()}
          {...rest}
        >
          Source
        </SmartLink>
      </Button>
    </SourceOverlay>
  );
}

interface SourceOverlayProps {
  title?: string;
  url: string;
  content?: string;
  image?: string;
  children: React.ReactNode;
}

function SourceOverlay(props: SourceOverlayProps) {
  const { title, url, content, image, children } = props;

  const overlayContent = (
    <>
      {image && (
        <SmartLink to={url} target='_blank' rel='noopener noreferrer'>
          <Image src={image} alt={title || 'Source image'} borderRadius='md' />
        </SmartLink>
      )}
      {title && (
        <SmartLink to={url} target='_blank' rel='noopener noreferrer'>
          <Heading as='h4' size='sm'>
            {title}
          </Heading>
        </SmartLink>
      )}
      {content && <Text>{content}</Text>}
      <Button variant='soft-outline' alignSelf='start' asChild>
        <SmartLink to={url} target='_blank' rel='noopener noreferrer'>
          Go to source <PiArrowSquareOut />
        </SmartLink>
      </Button>
    </>
  );

  return isTouchDevice() ? (
    <SourcePopover trigger={children}>{overlayContent}</SourcePopover>
  ) : (
    <SourceTooltip trigger={children}>{overlayContent}</SourceTooltip>
  );
}

function SourceTooltip(props: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const { trigger, children } = props;

  return (
    <Tooltip.Root interactive>
      <Tooltip.Trigger asChild>{trigger}</Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content
            borderRadius='lg'
            display='flex'
            flexDirection='column'
            minW='12rem'
            fontSize='sm'
            p={4}
            gap={4}
            color='basi.500'
            css={{
              '--tooltip-bg': 'white'
            }}
            layerStyle='handDrawn'
          >
            <Tooltip.Arrow>
              <Tooltip.ArrowTip borderColor='basi.100' />
            </Tooltip.Arrow>
            <Flex>
              <Heading as='h3' size='md'>
                Source
              </Heading>
            </Flex>
            <Flex flexDirection='column' gap={4}>
              {children}
            </Flex>
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}

function SourcePopover(props: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const { trigger, children } = props;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content layerStyle='handDrawn'>
            <Popover.Arrow />
            <Popover.Header display='Flex'>
              <Heading as='h3' size='md'>
                Source
              </Heading>
              <Popover.CloseTrigger asChild>
                <IconButton type='reset' size='sm' variant='ghost' ml='auto'>
                  <PiX />
                </IconButton>
              </Popover.CloseTrigger>
            </Popover.Header>
            <Popover.Body display='flex' flexDirection='column' gap={4}>
              {children}
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
