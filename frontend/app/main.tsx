import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router';

import App from './app';

import system from './styles/theme';

// Root component.
function Root() {
  useEffect(() => {
    dispatchEvent(new Event('app-ready'));
  }, []);

  return (
    <ChakraProvider value={system}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  );
}

const rootNode = document.querySelector('#app-container')!;
const root = createRoot(rootNode);
root.render(<Root />);
