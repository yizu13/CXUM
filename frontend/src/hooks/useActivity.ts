import { useEffect, useState } from "react";
import { getActivity } from "../platform/APIs/activity";
import type { ActivityEvent } from "../platform/APIs/activity";

export function useActivity() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivity()
      .then((res) => setEvents(res.events))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { events, loading };
}
