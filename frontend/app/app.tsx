import { Route, Routes } from 'react-router';
import { Flex } from '@chakra-ui/react';
import { PageHeader } from '$components/page-header';
import { ChatPage } from '$pages/chat';
import { HomePage } from '$pages/home';
import { About } from '$pages/about-modal';
import { PrivacyPolicy } from '$pages/privacy-policy-modal';
import { ResponsibleAI } from '$pages/responsible-modal';
import { PageFooter } from '$components/page-footer';

export default function App() {
  return (
    <Flex direction='column' h='vh' alignItems='center' gap={8}>
      <PageHeader />

      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/chat' element={<ChatPage />} />
      </Routes>

      <PageFooter />

      {/* Modals */}
      <About />
      <PrivacyPolicy />
      <ResponsibleAI />
    </Flex>
  );
}
