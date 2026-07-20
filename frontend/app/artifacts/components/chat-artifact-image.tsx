import { Flex, Image } from '@chakra-ui/react';
import { Artifact } from '$components/chat-artifact';
import { ArtifactImage as IArtifactImage } from '../config';

export function ArtifactImage({ data }: { data: IArtifactImage }) {
  return (
    <Artifact title='Image'>
      <Flex>
        <Image
          src={data.url ? data.url : `data:${data.type};base64,${data.data}`}
          alt='Image'
        />
      </Flex>
    </Artifact>
  );
}
