import { useMutation, useQuery, useQueryClient } from "react-query";
import { addPost, fetchPosts, fetchTags } from "../api/api";
import { useState } from "react";

const PostList = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const {
    data: postData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["posts", { page }], // Correct spelling
    queryFn: () => fetchPosts(page),
    staleTime: 1000 * 60 * 5,
  });

  const { data: tagsData } = useQuery({
    queryKey: ["tags"], // Correct spelling
    queryFn: fetchTags,
  });
  const { mutate } = useMutation({
    mutationFn: addPost,
    onSuccess: () => {
      // Invalidate and refetch the posts query
      queryClient.invalidateQueries(["posts"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const tags = Array.from(formData.keys()).filter(
      (key) => formData.get(key) === "on"
    );
    if (!title || !tags) return;
    mutate({ id: postData?.data?.length + 1, title, tags });
    e.target.reset();
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <input
          type="test"
          placeholder="Enter the post"
          className="postbox"
          name="title"
        />
        <div className="tags">
          {tagsData?.map((tag) => (
            <div key={tag}>
              <input name={tag} id={tag} type="checkbox" />
              <label htmlFor={tag}>{tag}</label>
            </div>
          ))}
        </div>
        <button>post</button>
      </form>
      {isLoading && <h1>...loading</h1>}
      {error && <h1>{error?.message}</h1>}
      <button
        onClick={() => setPage((oldPage) => Math.max(oldPage - 1, 0))}
        disabled={!postData?.prev}
      >
        prev
      </button>

      <span>{page}</span>
      <button
        onClick={() => setPage((oldPage) => oldPage + 1)}
        disabled={!postData?.next}
      >
        next
      </button>
      {postData?.data?.map((ele) => {
        return (
          <div key={ele?.id}>
            <h1>{ele?.title}</h1>
            <div className="tags">
              {ele?.tags?.map((ele) => {
                return <span key={ele?.id}>{ele}</span>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default PostList;
