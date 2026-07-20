import { useEffect, useState } from 'react';
import { Flex } from '@chakra-ui/react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export function StatusBanner() {
  const [isStable, setIsStable] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health/readiness`);
        const data = await response.json();
        setIsStable(data.stable);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch status:', error);
        setIsStable(false); // Assume unstable if fetch fails
      }
    })();
  }, []);

  if (isStable) {
    return null;
  }

  return (
    <Flex
      px={1}
      borderRadius='sm'
      bg='warning.300'
      color='warning.900'
      fontSize='xs'
      data-state='open'
      _open={{
        animationName: 'fadeIn',
        animationDuration: '160ms'
      }}
    >
      The application is currently in beta and may experience instability.
    </Flex>
  );
}
