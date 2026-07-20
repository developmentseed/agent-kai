import { MarkdownRenderer } from '$components/md-renderer';
import { PageModal } from '$components/page-modal';
import { Flex } from '@chakra-ui/react';

const pageContent = `
## Usage Guidelines

Some general information about the app can go here.
`;

export function ResponsibleAI() {
  return (
    <PageModal
      modalPath='responsible-ai'
      title='Responsible Use of the Assistant'
    >
      <Flex direction='column' gap={4}>
        <MarkdownRenderer>{pageContent}</MarkdownRenderer>
      </Flex>
    </PageModal>
  );
}
