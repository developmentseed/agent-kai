import {
  Badge,
  Button,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Portal,
  Presence,
  Separator,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';
import { PiX } from 'react-icons/pi';

import useArtifactStore from '$stores/artifact-store';
import {
  ARTIFACT_UI_COMPONENTS,
  ArtifactMessages,
  ArtifactUIConfig
} from '$artifacts/config';

export function ChatArtifact() {
  const { artifact, closeArtifact } = useArtifactStore();

  // @ts-expect-error Typescript has issues with accessing object by dynamic key
  const artifactUi = ARTIFACT_UI_COMPONENTS[artifact.type] as
    | ArtifactUIConfig<ArtifactMessages['type']>
    | undefined;

  const content =
    artifactUi && artifact.isOpen ? (
      <artifactUi.component id={artifact.id} data={artifact.data!} />
    ) : null;

  const display = useBreakpointValue({
    base: 'modal',
    lg: 'aside'
  });

  return display === 'modal' ? (
    <Dialog.Root
      size='cover'
      placement='center'
      motionPreset='slide-in-bottom'
      scrollBehavior='inside'
      open={artifact.isOpen}
      onOpenChange={() => closeArtifact()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            css={{
              '& > *': {
                flex: 1
              }
            }}
            layerStyle='handDrawn'
          >
            {content}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  ) : (
    <Presence
      present={artifact.isOpen}
      width='800px'
      minW='550px'
      css={{
        '--width': '800px'
      }}
      overflow='hidden'
      animationName={{
        _open: 'expand-width, fade-in',
        _closed: 'collapse-width, fade-out'
      }}
      animationDelay={{ _open: '0s, 50ms' }}
      animationDuration='{durations.moderate}, {durations.faster}'
      opacity={{
        _open: 0,
        _closed: 1
      }}
      animationFillMode='forwards'
      px={4}
      display='flex'
      flexFlow='column'
    >
      {content}
    </Presence>
  );
}

interface ArtifactProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  version?: string;
}

export function Artifact(props: ArtifactProps) {
  const { title, actions, version, children } = props;

  const { closeArtifact } = useArtifactStore();

  return (
    <Flex
      as='article'
      direction='column'
      bg='basi.50'
      borderRadius='lg'
      overflow='hidden'
      layerStyle='handDrawn'
    >
      <Flex as='header' p={4} alignItems='center' boxShadow='0 0 0 1px white'>
        <Flex gap={2}>
          <Heading as='h2' size='sm'>
            {title}
          </Heading>
          {version && <Badge variant='solid'>{version}</Badge>}
        </Flex>
        <Flex ml='auto' alignItems='center' gap={2}>
          {actions ? (
            <>
              {actions}
              <Separator orientation='vertical' height='1.5rem' />
            </>
          ) : null}
          <IconButton variant='ghost' size='sm' onClick={() => closeArtifact()}>
            <PiX />
          </IconButton>
        </Flex>
      </Flex>
      <Flex as='section' direction='column' p={4} minH={0} flex={1}>
        {children}
      </Flex>
    </Flex>
  );
}

export interface ChatArtifactCalloutProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  version?: string;
  onToggle: ({ isOpen }: { isOpen: boolean }) => void;
  isOpen: boolean;
}

export function ChatArtifactCallout(props: ChatArtifactCalloutProps) {
  const { title, subtitle, icon, version, onToggle, isOpen } = props;

  return (
    <Flex
      bg='surface.500'
      boxShadow='md'
      borderRadius='lg'
      overflow='hidden'
      layerStyle='handDrawn'
    >
      <Flex
        borderRight='1px solid {colors.basi.200}'
        p={4}
        alignItems='center'
        color='basi.400'
      >
        {icon}
      </Flex>
      <Flex p={4} flex={1}>
        <Flex flex={1} direction='column'>
          <Heading as='p' size='sm'>
            {title}{' '}
            {version && (
              <Badge
                bg='basi.400a'
                color='surface.500'
                fontFamily='body'
                ml={2}
              >
                {version}
              </Badge>
            )}
          </Heading>
          {subtitle && (
            <Text fontSize='xs' color='basi.500' fontFamily='heading'>
              {subtitle}
            </Text>
          )}
        </Flex>
        <Flex ml='auto' alignItems='center'>
          <Button
            onClick={() => onToggle({ isOpen })}
            variant={isOpen ? 'solid' : 'soft-outline'}
          >
            {isOpen ? 'Close' : 'Open'}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
