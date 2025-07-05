import React from 'react';
import { BookOpen, Users, GraduationCap, Zap, Star, Activity, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TeacherLesson {
  id: string;
  subject: string;
  room: string;
  class: string;
  grade?: string;
  stream?: string;
  day: string;
  period: number;
  totalStudents?: number;
  completed?: boolean;
}

interface CurrentLessonBannerProps {
  currentLesson: TeacherLesson | null;
  remainingMinutes: number;
}

const CurrentLessonBanner: React.FC<CurrentLessonBannerProps> = ({ currentLesson, remainingMinutes }) => {
  if (!currentLesson) {
    return (
      <div className="mb-8 p-6 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-lg">
              <Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-200">No active class right now</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Check your upcoming lessons below</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-[#246a59]/20 text-[#246a59] hover:bg-[#246a59]/10">
            <Clock className="h-4 w-4 mr-1" /> View schedule
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg mb-8 border-2 border-[#246a59] shadow-lg">
      <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center overflow-hidden">
        <div className="absolute w-64 h-64 bg-[#246a59]/5 rounded-full animate-pulse-slow"></div>
        <div className="absolute w-80 h-80 bg-[#246a59]/10 rounded-full animate-pulse-slower delay-150"></div>
        <div className="absolute w-48 h-48 bg-[#246a59]/15 rounded-full animate-pulse"></div>
      </div>
      
      <div className="relative p-6 md:p-8 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
        <div className="absolute top-0 right-0 p-3 bg-[#246a59] text-white font-bold">
          NOW
          <div className="h-1.5 w-12 bg-white/80 mt-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white" 
              style={{ width: `${remainingMinutes ? (remainingMinutes / 45) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-start gap-4 md:gap-8">
          <div className="h-16 w-16 flex items-center justify-center bg-[#246a59]/20 rounded-lg">
            <BookOpen className="h-8 w-8 text-[#246a59]" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                {currentLesson.subject}
              </h2>
              <Badge className="bg-[#246a59] hover:bg-[#246a59]/90">Ongoing</Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mt-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {currentLesson.class} ({currentLesson.totalStudents} students)
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-300">
                  {currentLesson.grade} {currentLesson.stream}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#246a59]" />
                <span className="text-slate-600 dark:text-slate-300">{currentLesson.room}</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="text-sm">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#246a59]" />
                  <span className="text-[#246a59] font-medium">
                    {remainingMinutes ? `${remainingMinutes} min remaining` : 'Ending soon'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  className="bg-[#246a59] hover:bg-[#246a59]/90 text-white"
                >
                  <Star className="h-4 w-4 mr-1" /> Mark attendance
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-[#246a59]/20 text-[#246a59] hover:bg-[#246a59]/10"
                >
                  <Activity className="h-4 w-4 mr-1" /> Class activities
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentLessonBanner; 