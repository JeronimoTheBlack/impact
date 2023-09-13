import { SuspensePromise, createHook, useCleanup } from "impact-app";
import { globalHooks } from "../../../global-hooks";
import { PostDTO } from "../../../global-hooks/useApi";

function PostsCache() {
  const api = globalHooks.useApi();
  const cache: Record<string, SuspensePromise<PostDTO>> = {};
  const disposeNewPostListener = api.onNewPost(onNewPost);

  useCleanup(disposeNewPostListener);

  function onNewPost(id: string) {
    cache[id] = SuspensePromise.from(api.getPost(id));
  }

  return {
    onNewPost: api.onNewPost,
    getPost(id: string) {
      let post = cache[id];

      if (!post) {
        cache[id] = post = SuspensePromise.from(api.getPost(id));
      }

      return post;
    },
  };
}

export const usePostsCache = createHook(PostsCache);
