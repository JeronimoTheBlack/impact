import { createHooksProvider } from "impact-app";
import { usePostsCache } from "./usePostsCache";
import { PostsCache } from "./PostsCache";

const HooksProvider = createHooksProvider({ usePostsCache });

export function Example2() {
  return (
    <HooksProvider>
      <PostsCache />
    </HooksProvider>
  );
}