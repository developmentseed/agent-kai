import { useEffect, useState } from 'react';
import {
  Code,
  DataList,
  Flex,
  Portal,
  Separator,
  Text,
  Tooltip
} from '@chakra-ui/react';
import { PageModalTrigger } from './page-modal';

import { version } from '../../package.json';
import { StatusBanner } from './status-banner';

export function PageFooter() {
  return (
    <Flex
      as='footer'
      flexFlow='column'
      alignItems='center'
      w='100%'
      fontSize='xs'
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 1, md: 2 }}
        justifyContent='center'
        px={4}
        py={2}
        w='100%'
        maxW='8xl'
      >
        <Text color='basi.400' textAlign='center'>
          AI responses can be inaccurate or misleading.
        </Text>
        <Separator orientation='vertical' height={4} hideBelow='md' />
        <Flex gap={3} justifyContent='center'>
          <PageModalTrigger
            modalPath='about'
            color='basi.400'
            fontWeight='bold'
            _hover={{
              textDecor: 'underline'
            }}
          >
            About
          </PageModalTrigger>
          <PageModalTrigger
            modalPath='responsible-ai'
            color='basi.400'
            fontWeight='bold'
            _hover={{
              textDecor: 'underline'
            }}
          >
            Responsible AI
          </PageModalTrigger>
          <PageModalTrigger
            modalPath='privacy-policy'
            color='basi.400'
            fontWeight='bold'
            _hover={{
              textDecor: 'underline'
            }}
          >
            Privacy Policy
          </PageModalTrigger>
        </Flex>
      </Flex>
      <Flex w='100%' bg='basi.100' py={1} px={2} gap={2}>
        <VersionInfo />
        <StatusBanner />
      </Flex>
    </Flex>
  );
}

function VersionInfo() {
  const [versions, setVersions] = useState([
    {
      label: 'Frontend',
      value: `v${version}`
    }
  ]);

  useEffect(() => {
    (async () => {
      const response = await fetch(import.meta.env.VITE_API_URL);
      const data = (await response.json()) as Record<string, string>;

      setVersions((v) => [
        v[0],
        ...Object.entries(data).map(([key, value]) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1),
          value: `v${value}`
        }))
      ]);
    })();
  }, []);

  return (
    <Tooltip.Root interactive openDelay={100}>
      <Tooltip.Trigger asChild>
        <Code>v{version}</Code>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content p={2}>
            <Tooltip.Arrow />

            <DataList.Root orientation='horizontal' size='sm' gap={2}>
              {versions.map((version) => (
                <DataList.Item key={version.label}>
                  <DataList.ItemLabel color='white' minW='5rem'>
                    {version.label}
                  </DataList.ItemLabel>
                  <DataList.ItemValue fontFamily='monospace'>
                    {version.value}
                  </DataList.ItemValue>
                </DataList.Item>
              ))}
            </DataList.Root>
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
