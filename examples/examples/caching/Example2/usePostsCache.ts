import { SuspensePromise, createHook, useDispose, useSignal } from "impact-app";
import { PostDTO } from "../../../common-hooks/useApi";
import { commonHooks } from "../../../common-hooks";

const UPDATE_POST = Symbol("UPDATE_POST");

function createPost(initialData: PostDTO) {
  const data = useSignal(initialData);

  return {
    // Only the cache can update the data
    [UPDATE_POST](updatedData: PostDTO) {
      data.value = updatedData;
    },
    get id() {
      return data.value.id;
    },
    get title() {
      return data.value.title;
    },
    get updateCount() {
      return data.value.updateCount;
    },
  };
}

type Post = ReturnType<typeof createPost>;

function PostsCache() {
  const api = commonHooks.useApi();
  const cache: Record<string, SuspensePromise<Post>> = {};
  const disposeNewPostListener = api.onPostUpdate(onPostUpdate);

  useDispose(disposeNewPostListener);

  async function onPostUpdate(data: PostDTO) {
    const cacheItem = await cache[data.id];

    cacheItem[UPDATE_POST](data);
  }

  return {
    getPost(id: string) {
      let post = cache[id];

      if (!post) {
        cache[id] = post = SuspensePromise.from(
          api.getPost(id).then(createPost)
        );
      }

      return post;
    },
  };
}

export const usePostsCache = createHook(PostsCache);