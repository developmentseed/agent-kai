import { useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogOpenChangeDetails,
  IconButton,
  Portal
} from '@chakra-ui/react';
import { useSearchParams } from 'react-router';
import { PiX } from 'react-icons/pi';

import SmartLink, { SmartLinkProps } from './smart-link';

interface PageModalProps {
  title: string;
  children: React.ReactNode;
  modalPath: string;
}

export function PageModal(props: PageModalProps) {
  const { modalPath, title, children } = props;

  const [searchParams, setSearchParams] = useSearchParams();

  const isOpen = searchParams.has(modalPath);

  const closeModal = useCallback(
    (e: DialogOpenChangeDetails) => {
      if (!e.open) {
        searchParams.delete(modalPath);
        setSearchParams(searchParams);
      }
    },
    [searchParams]
  );

  return (
    <Dialog.Root
      size='xl'
      placement='center'
      motionPreset='slide-in-bottom'
      open={isOpen}
      onOpenChange={closeModal}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner py={4}>
          <Dialog.Content layerStyle='handDrawn'>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.CloseTrigger asChild unstyled ml='auto'>
                <IconButton variant='ghost'>
                  <PiX />
                </IconButton>
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body
              css={{
                '& a': {
                  color: 'info.600'
                }
              }}
            >
              {children}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export function PageModalTrigger(
  props: Omit<SmartLinkProps, 'to'> & { modalPath: string }
) {
  const { modalPath, ...rest } = props;
  const [searchParams] = useSearchParams();

  const url = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.set(modalPath, 'true');
    return `?${params.toString()}`;
  }, [modalPath, searchParams]);

  return <SmartLink to={url} {...rest} />;
}
