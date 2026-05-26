import { redirect } from "next/navigation";

// /community/chat → default channel
export default function CommunityChatRoot() {
  redirect("/community/chat/general");
}
