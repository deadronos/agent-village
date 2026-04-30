import { Activity, Database, Globe2, Radio } from "lucide-react";
import type { ReactNode } from "react";
import type { ConnectionState } from "../stores/dashboardStore";

export function BottomStatusBar({ connectionState, activity }: { connectionState: ConnectionState; activity: string }) {
  return (
    <footer className="bottom-bar">
      <StatusItem icon={<Activity size={16} />} label="System status" value="All systems operational" tone="green" />
      <StatusItem icon={<Database size={16} />} label="Data stream" value={connectionState === "connected" ? "Live backend" : "Mock live"} tone="green" />
      <StatusItem icon={<Radio size={16} />} label="Agent activity" value={activity} tone="amber" />
      <StatusItem icon={<Globe2 size={16} />} label="Region" value="localhost / local" tone="muted" />
    </footer>
  );
}

function StatusItem({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="bottom-item">
      <span className={`bottom-icon tone-${tone}`}>{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}
