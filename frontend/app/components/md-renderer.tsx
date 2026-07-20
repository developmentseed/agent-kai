import Markdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Heading, List, Text, chakra } from '@chakra-ui/react';

import SmartLink from './smart-link';
import { SourceLink } from './source-link';

const mdPlugins = [remarkGfm];
const mdComponents: Components = {
  p: Text,
  h1: (props) => <Heading as='h1' size='xl' {...props} />,
  h2: (props) => <Heading as='h2' size='lg' {...props} />,
  h3: (props) => <Heading as='h3' size='md' {...props} />,
  h4: (props) => <Heading as='h4' size='sm' {...props} />,
  h5: (props) => <Heading as='h5' size='xs' {...props} />,
  h6: (props) => <Heading as='h6' size='xs' {...props} />,
  ul: (props) => <List.Root pl={4} {...props} />,
  ol: (props) => <List.Root as='ol' pl={4} {...props} />,
  li: (props) => <List.Item {...props} />,
  a: ({ href, ...rest }) => {
    if (typeof rest.children === 'string' && rest.children.match(/\[\d+\]/g)) {
      return <SourceLink to={href!} {...rest} />;
    }
    return <SmartLink to={href!} color='info.600' {...rest} />;
  },
  pre: (props) => <chakra.pre {...props} overflow='hidden' />
};

export function MarkdownRenderer(props: React.ComponentProps<typeof Markdown>) {
  return (
    <Markdown remarkPlugins={mdPlugins} components={mdComponents} {...props} />
  );
}
