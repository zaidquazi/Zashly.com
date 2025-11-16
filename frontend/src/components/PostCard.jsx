import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2 } from "lucide-react";

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);

  const onLike = () => {
    setLiked((v) => !v);
    setLikes((n) => (liked ? n - 1 : n + 1));
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className="card bg-base-200 shadow-sm hover:shadow-md transition-all"
    >
      <div className="card-body p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={post.avatar || "/default-avatar.png"} />
            </div>
          </div>
          <div>
            <div className="font-semibold leading-tight">{post.username}</div>
            <div className="text-xs opacity-60">{post.time}</div>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden bg-base-100">
          {post.type === "video" ? (
            <video src={post.media} className="w-full max-h-[70vh] object-cover" controls playsInline />
          ) : (
            <img src={post.media} className="w-full max-h-[70vh] object-cover" alt={post.caption} />
          )}
        </div>

        <div className="mt-3">
          <p className="text-sm">{post.caption}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className={`btn btn-sm ${liked ? "btn-error" : "btn-ghost"}`}
              onClick={onLike}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span className="ml-1">{likes}</span>
            </button>
            <button className="btn btn-sm btn-ghost">
              <MessageCircle className="w-4 h-4" />
              <span className="ml-1">{post.comments}</span>
            </button>
            <button className="btn btn-sm btn-ghost">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
