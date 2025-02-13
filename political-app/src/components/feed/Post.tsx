import { PostType } from "@/types/post";

const Post = ({ post }: { post: PostType }) => {
  return (
    <div className="p-4 border rounded shadow mb-3">
      <h3 className="font-semibold">{post.username}</h3>
      <p className="text-gray-700">{post.content}</p>
      <p className="text-sm text-gray-500">Likes: {post.likes}</p>
    </div>
  );
};

export default Post;
