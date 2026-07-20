import { MarkdownRenderer } from '$components/md-renderer';
import { PageModal } from '$components/page-modal';
import { Flex } from '@chakra-ui/react';

const pageContent = `
## About this app

Some general information about the app can go here.
`;

export function About() {
  return (
    <PageModal modalPath='about' title='About'>
      <Flex direction='column' gap={4}>
        <MarkdownRenderer>{pageContent}</MarkdownRenderer>
      </Flex>
    </PageModal>
  );
}
