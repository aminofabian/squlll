import React from 'react';
import { Star, Timer, CheckCircle2, Activity, Users, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

const TimetableLegend: React.FC = () => {
  const legendItems = [
    { label: "Current Lesson", icon: <div className="h-3 w-3 rounded-none bg-primary" />, color: "bg-primary/10" },
    { label: "Next Lesson", icon: <Timer className="h-3 w-3 text-[#246a59]/70" />, color: "bg-primary/10" },
    { label: "Completed", icon: <CheckCircle2 className="h-3 w-3 text-green-500" />, color: "bg-green-500/10" },
    { label: "Break Time", icon: <Activity className="h-3 w-3 text-amber-500" />, color: "bg-amber-500/10" },
    { label: "Lunch", icon: <Users className="h-3 w-3 text-orange-500" />, color: "bg-orange-500/10" },
    { label: "Free Period", icon: <Clock className="h-3 w-3 text-slate-400" />, color: "bg-slate-100" }
  ];

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-none border shadow-md p-5 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center h-7 w-7 rounded-none bg-primary/10">
          <Star className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-base font-medium">Legend</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {legendItems.map((item, index) => (
          <div 
            key={index} 
            className={cn("flex items-center gap-2 p-2 rounded-none", item.color)}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableLegend; 