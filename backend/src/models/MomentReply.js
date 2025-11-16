import mongoose from "mongoose";

const momentReplySchema = new mongoose.Schema(
  {
    moment: { type: mongoose.Schema.Types.ObjectId, ref: "Moment", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    emoji: { type: String, default: "" },
  },
  { timestamps: true }
);

const MomentReply = mongoose.model("MomentReply", momentReplySchema);
export default MomentReply;
