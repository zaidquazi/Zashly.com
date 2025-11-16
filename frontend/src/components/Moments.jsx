import { useMemo, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Camera, MoreVertical, Trash } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMoment,
  deleteMoment,
  getAuthUser,
  getMoments,
  markMomentViewed,
} from "../lib/api";
import MomentViewer from "./MomentViewer";

export default function Moments() {
  const queryClient = useQueryClient();
  const { data: moments = [] } = useQuery({ queryKey: ["moments"], queryFn: getMoments });
  const { data: authUser } = useQuery({ queryKey: ["authUser"], queryFn: getAuthUser });
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preview, setPreview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const visibleMoments = useMemo(() => moments, [moments]);

  // --- Delete moment mutation
  const delMutation = useMutation({
    mutationFn: (id) => deleteMoment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["moments"] }),
  });

  // --- Auto-delete old moments (>24h)
  useEffect(() => {
    const now = new Date();
    moments.forEach((m) => {
      const createdAt = new Date(m.createdAt || m.timestamp || 0);
      const ageHours = (now - createdAt) / (1000 * 60 * 60);
      if (ageHours >= 24) {
        console.log(`🗑 Auto-deleting moment ${m.id} (${ageHours.toFixed(1)}h old)`);
        delMutation.mutate(m.id);
      }
    });
  }, [moments]);

  // --- Create moment mutation
  const createMutation = useMutation({
    mutationFn: createMoment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moments"] });
      setPreview(null);
    },
  });

  // --- Mark as viewed
  const queryMark = useMutation({
    mutationFn: (id) => markMomentViewed(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["moments"] }),
  });

  const onSeen = useCallback(
    (id) => {
      queryMark.mutate(id);
    },
    [queryMark]
  );

  // --- Video helpers
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const getVideoDurationMs = (file) =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        const sec = v.duration || 0;
        URL.revokeObjectURL(url);
        resolve(Math.min(Math.round(sec * 1000), 50000));
      };
      v.src = url;
    });

  // --- Upload new moment
  const onUpload = async (file) => {
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const dataUrl = await fileToDataUrl(file);
    const durationMs = isVideo ? await getVideoDurationMs(file) : 5000;
    createMutation.mutate({
      mediaUrl: dataUrl,
      type: isVideo ? "video" : "image",
      durationMs,
    });
  };

  // --- Delete confirm
  const confirmDeleteMoment = (id) => setConfirmDelete(id);
  const handleDeleteConfirm = () => confirmDelete && delMutation.mutate(confirmDelete);

  const openAt = (idx) => {
    setCurrentIndex(idx);
    setViewerOpen(true);
  };

  const onPrev = () => {
    setCurrentIndex((i) => (i - 1 + visibleMoments.length) % visibleMoments.length);
  };
  const onNext = () => {
    setCurrentIndex((i) => (i + 1) % visibleMoments.length);
  };

  return (
    <section className="space-y-3 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold">Moments</h2>
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          <UploadTile onUpload={onUpload} preview={preview} setPreview={setPreview} />

          {visibleMoments.map((m, idx) => {
            const isSeen = false;

            // 🧩 Match uploader with logged user
            const momentUserId =
              m.userId || m.user?._id || m.user?.id || "";
            const authUserId =
              authUser?._id || authUser?.id || authUser?.userId || "";
            const isOwner = momentUserId && authUserId && String(momentUserId) === String(authUserId);
            const role = authUser?.role;
            const canDelete = isOwner || role === "developer" || role === "admin";

            return (
              <button
                key={m.id}
                className="group relative shrink-0"
                onClick={() => openAt(idx)}
                title={`${m.username}'s moment`}
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  className={`p-0.5 rounded-full ${
                    isSeen ? "bg-base-300" : "bg-gradient-to-tr from-primary to-secondary"
                  }`}
                >
                  <div className="p-1 bg-base-100 rounded-full">
                    <div className="avatar">
                      <div className="w-14 h-14 rounded-full overflow-hidden">
                        <img
                          src={m.avatar || m.url}
                          alt={m.username || "moment"}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ••• Menu at top-right */}
                {canDelete && (
                  <div className="absolute -top-1 -right-1 z-20">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId((prev) => (prev === m.id ? null : m.id));
                      }}
                      aria-label="Open menu"
                      title="Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpenId === m.id && (
                      <div
                        className="mt-1 dropdown-content menu p-1 shadow bg-base-100 rounded-box w-28 border absolute right-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-full flex items-center gap-2 px-2 py-1 hover:bg-base-200 rounded text-left"
                          onClick={() => {
                            setMenuOpenId(null);
                            confirmDeleteMoment(m.id);
                          }}
                        >
                          <Trash className="w-4 h-4 text-error" />
                          <span className="text-sm">Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="text-center text-xs mt-1 opacity-70">{m.username}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔍 Viewer with play/pause */}
      {viewerOpen && (
        <MomentViewer
          open={viewerOpen}
          moments={visibleMoments}
          index={currentIndex}
          onClose={() => setViewerOpen(false)}
          onPrev={onPrev}
          onNext={onNext}
          onSeen={onSeen}
          enablePlayPause={true}
        />
      )}

      {/* 🧠 Confirmation Popup */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-base-200 rounded-xl shadow-lg p-6 w-80 text-center">
            <h3 className="text-lg font-semibold mb-2">Delete Moment?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete this moment? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="btn btn-sm btn-error text-white"
                onClick={handleDeleteConfirm}
                disabled={delMutation.isLoading}
              >
                {delMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                className="btn btn-sm"
                onClick={() => setConfirmDelete(null)}
                disabled={delMutation.isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* 🔼 UploadTile Component */
function UploadTile({ onUpload, preview, setPreview }) {
  const onSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview({ file, url: URL.createObjectURL(file) });
  };

  return (
    <div className="shrink-0">
      <label className="group cursor-pointer">
        <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary/80 to-secondary/80">
          <div className="p-1 bg-base-100 rounded-full">
            <div className="avatar">
              <div className="w-15 h-20 rounded-full overflow-hidden relative flex items-center justify-center">
                {preview ? (
                  preview.file.type.startsWith("video/") ? (
                    <video src={preview.url} className="object-cover w-full h-full" muted />
                  ) : (
                    <img src={preview.url} alt="preview" />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center text-base-content/80">
                    <Plus className="w-5 h-5" />
                    <Camera className="w-4 h-4" />
                  </div>
                )}
                <input
                  hidden
                  type="file"
                  accept="image/*,video/*"
                  onChange={onSelect}
                  onClick={(e) => (e.target.value = null)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </label>
      <div className="flex gap-2 mt-1">
        <button
          className="btn btn-xs btn-primary"
          onClick={() => preview && onUpload(preview.file)}
          disabled={!preview}
        >
          Post
        </button>
        <button
          className="btn btn-xs"
          onClick={() => setPreview(null)}
          disabled={!preview}
        >
          Clear
        </button>
      </div>
      <div className="text-center text-xs opacity-70 mt-1">Add</div>
    </div>
  );
}
