import { MarkdownRenderer } from '$components/md-renderer';
import { PageModal } from '$components/page-modal';
import { Flex } from '@chakra-ui/react';

const pageContent = `
## Privacy Policy

Some general information about the app can go here.
`;

export function PrivacyPolicy() {
  return (
    <PageModal modalPath='privacy-policy' title='Privacy Policy'>
      <Flex direction='column' gap={4}>
        <MarkdownRenderer>{pageContent}</MarkdownRenderer>
      </Flex>
    </PageModal>
  );
}
