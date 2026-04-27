import { Chat } from "@/components/Chat";
import { CrisisFooter } from "@/components/CrisisFooter";

export default function HomePage() {
  return (
    <div className="box-border flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden pt-[env(safe-area-inset-top,0px)]">
      <Chat />
      <CrisisFooter />
    </div>
  );
}
