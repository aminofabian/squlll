import React from 'react';
import { Star, Timer, CheckCircle2, Activity, Users, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

const TimetableLegend: React.FC = () => {
  const legendItems = [
    { label: "Current Lesson", icon: <div className="h-3 w-3 rounded-md bg-primary" />, color: "bg-primary/10" },
    { label: "Next Lesson", icon: <Timer className="h-3 w-3 text-secondary" />, color: "bg-secondary/10" },
    { label: "Completed", icon: <CheckCircle2 className="h-3 w-3 text-success" />, color: "bg-success/10" },
    { label: "Break Time", icon: <Activity className="h-3 w-3 text-accent" />, color: "bg-accent/10" },
    { label: "Lunch", icon: <Users className="h-3 w-3 text-warning" />, color: "bg-warning/10" },
    { label: "Free Period", icon: <Clock className="h-3 w-3 text-slate-400" />, color: "bg-slate-100" }
  ];

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-xl border-2 border-slate-200 shadow-lg p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
          <Star className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Legend</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {legendItems.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {item.icon}
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableLegend; 