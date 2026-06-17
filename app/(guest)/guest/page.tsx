import { GuestBrowseView } from "@/components/guest/guest-browse-view";

export default function GuestPage() {
  return <GuestBrowseView scope={{ type: "all" }} title="All items" />;
}
