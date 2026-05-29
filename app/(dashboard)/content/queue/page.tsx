import { getQueuePosts } from "@/lib/db/content/posts";
import { QueueView } from "@/components/content/queue/QueueView";

export const metadata = { title: "Queue · Zecamo" };

export default async function QueuePage() {
  const posts = await getQueuePosts();
  return <QueueView initialPosts={posts} />;
}
