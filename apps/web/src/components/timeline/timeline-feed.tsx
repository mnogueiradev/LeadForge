"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TimelineEventData, TimelineEventCard } from "./timeline-event-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TimelineFeedProps {
  entityType?: "CONTACT" | "ORGANIZATION" | "LEAD" | "DEAL";
  entityId?: string;
  userId?: string;
}

export function TimelineFeed({ entityType, entityId, userId }: TimelineFeedProps) {
  const [events, setEvents] = useState<TimelineEventData[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchEvents = async (cursor?: string) => {
    try {
      const params = new URLSearchParams();
      if (entityType) params.append("entityType", entityType);
      if (entityId) params.append("entityId", entityId);
      if (userId) params.append("actorUserId", userId);
      if (cursor) params.append("cursor", cursor);
      params.append("limit", "20");

      let url = "/timeline";
      if (entityId) url = "/timeline/entity";
      if (userId && !entityId) url = "/timeline/user";

      const res = await api.get(`${url}?${params.toString()}`);
      
      if (cursor) {
        setEvents(prev => [...prev, ...res.data.data]);
      } else {
        setEvents(res.data.data);
      }
      setNextCursor(res.data.nextCursor);
    } catch (error) {
      console.error("Failed to load timeline events", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId, userId]);

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground text-sm border rounded-lg bg-card/50 border-dashed">
        Nenhuma atividade registrada ainda.
      </div>
    );
  }

  return (
    <div className="relative pt-4 pb-12">
      {events.map((event, index) => (
        <TimelineEventCard 
          key={event.id} 
          event={event} 
          isLast={index === events.length - 1 && !nextCursor} 
        />
      ))}

      {nextCursor && (
        <div className="mt-8 flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setIsLoadingMore(true);
              fetchEvents(nextCursor);
            }}
            disabled={isLoadingMore}
          >
            {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Carregar mais antigas
          </Button>
        </div>
      )}
    </div>
  );
}
