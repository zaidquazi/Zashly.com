import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { WifiIcon, WifiOffIcon } from "lucide-react";

import { getUserFriends } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const socket = io("http://localhost:5173", { withCredentials: true });

const FriendsPage = () => {
  const [filterStatus, setFilterStatus] = useState("online");
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  useEffect(() => {
    socket.on("friendStatusChange", (updatedFriend) => {
      queryClient.setQueryData(["friends"], (oldFriends = []) =>
        oldFriends.map((f) =>
          f._id === updatedFriend._id ? { ...f, isOnline: updatedFriend.isOnline } : f
        )
      );
    });

    return () => {
      socket.off("friendStatusChange");
    };
  }, [queryClient]);

  //  Count online/offline
  const onlineCount = friends.filter((f) => f.isOnline).length;
  const offlineCount = friends.filter((f) => !f.isOnline).length;

  // Filter by status
  const filteredFriends = friends.filter((friend) =>
    filterStatus === "online" ? friend.isOnline : !friend.isOnline
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        {/* Online / Offline Filter */}
        <div className="flex items-center gap-3">
          <button
            className={`btn btn-sm flex items-center gap-2 ${
              filterStatus === "online" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setFilterStatus("online")}
          >
            <WifiIcon size={16} /> Online ({onlineCount})
          </button>

          <button
            className={`btn btn-sm flex items-center gap-2 ${
              filterStatus === "offline" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setFilterStatus("offline")}
          >
            <WifiOffIcon size={16} /> Offline ({offlineCount})
          </button>
        </div>

        {/* Friends List */}
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : filteredFriends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFriends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
