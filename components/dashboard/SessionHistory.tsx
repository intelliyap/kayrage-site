"use client";

interface SessionRecord {
  id: string;
  mode: string;
  focusLevel: string;
  techniques: string[];
  durationActual: number;
  depthRating?: number;
  createdAt: string;
}

interface SessionHistoryProps {
  sessions: SessionRecord[];
}

const levelNames: Record<string, string> = {
  sync: "Sync",
  edge: "The Edge",
  expand: "Expand",
  void: "Void",
  bridge: "Bridge",
};

export function SessionHistory({ sessions }: SessionHistoryProps) {
  if (sessions.length === 0) {
    return (
      <div className="p-5 border border-border rounded-lg">
        <span className="font-mono text-xs text-secondary tracking-widest">
          NO SESSIONS YET
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span className="font-mono text-xs text-secondary tracking-widest">
        RECENT
      </span>
      {sessions.map((session) => (
        <div
          key={session.id}
          className="p-4 border border-border rounded-lg flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-foreground tracking-wide">
                {session.mode.toUpperCase()}
              </span>
              <span className="text-muted">|</span>
              <span className="font-mono text-[10px] text-secondary tracking-widest">
                {levelNames[session.focusLevel] || session.focusLevel}
              </span>
            </div>
            <span className="text-[10px] text-muted">
              {session.techniques.join(", ")} — {Math.round(session.durationActual / 60)}m
            </span>
          </div>

          {session.depthRating && (
            <div className="text-right">
              <span className="font-mono text-sm text-foreground">
                {session.depthRating}
              </span>
              <span className="block font-mono text-[10px] text-muted tracking-widest">
                DEPTH
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
