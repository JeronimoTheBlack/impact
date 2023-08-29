import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { Suspense, useState } from "react";
import { usePostsCache } from "./usePostsCache";
import { generateId } from "../../../common-hooks/useApi";


function Post({ id }: { id: string }) {
  using postsCache = usePostsCache();
  const post = postsCache.getPost(id).use();

  return (
    <Text size="4">
      {id} - {post.title} - {post.updateCount}
    </Text>
  );
}

const firstPostId = generateId();
const secondPostId = generateId();

export function PostsCache() {
  const [postId, setPostId] = useState(firstPostId);

  return (
    <Flex direction="column" gap="2">
      <Text>
        In this example we subscribe to updates on posts loaded and we keep them up to date, even
        though you are not looking at the post
      </Text>
      <Flex gap="2">
        <Button
          variant="outline"
          onClick={() => {
            setPostId(firstPostId);
          }}
        >
          Load first post
        </Button>
        <Button
          onClick={() => {
            setPostId(secondPostId);
          }}
          variant="outline"
        >
          Load second post
        </Button>
      </Flex>
      <Box m="4">
        <Suspense fallback={<Text size="2">Loading post {postId}...</Text>}>
          <Post id={postId} />
        </Suspense>
      </Box>
    </Flex>
  );
}