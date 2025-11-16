import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PostCard from "./PostCard";

const mockPosts = [
  {
    id: "p1",
    username: "Aisha",
    avatar: "/default-avatar.png",
    media: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&auto=format&fit=crop&q=60",
    type: "image",
    caption: "Golden hour hits different ✨",
    likes: 128,
    comments: 12,
    time: "2h",
  },
  {
    id: "p2",
    username: "Rahul",
    avatar: "/default-avatar.png",
    media: "https://videos.pexels.com/video-files/1448735/1448735-uhd_2560_1440_25fps.mp4",
    type: "video",
    caption: "Weekend ride across the city 🚴‍♂️",
    likes: 236,
    comments: 34,
    time: "5h",
  },
  {
    id: "p3",
    username: "Sara",
    avatar: "/default-avatar.png",
    media: "https://images.unsplash.com/photo-1520975922323-3f3f1df3b42a?w=1200&auto=format&fit=crop&q=60",
    type: "image",
    caption: "Minimal desk setup vibes 💻",
    likes: 89,
    comments: 7,
    time: "1d",
  },
];

export default function PostFeed() {
  const posts = useMemo(() => mockPosts, []);

  return (
    <section className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-semibold">Posts</h2>
      <AnimatePresence initial={false}>
        <motion.div layout className="grid grid-cols-1 gap-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
