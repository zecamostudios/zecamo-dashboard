import { OutboundView } from "@/components/outbound/OutboundView";
import { getOutboundMessages, getTemplates } from "@/lib/db/outbound";

export default async function OutboundPage() {
  const [messages, templates] = await Promise.all([
    getOutboundMessages(),
    getTemplates(),
  ]);
  return <OutboundView initialMessages={messages} initialTemplates={templates} />;
}
