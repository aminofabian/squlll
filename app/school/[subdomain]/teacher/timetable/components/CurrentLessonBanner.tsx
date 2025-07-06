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
      <div className="mb-8 p-6 rounded-xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-200 rounded-lg">
              <Clock className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">No active class right now</h3>
              <p className="text-sm text-slate-500">Check your upcoming lessons below</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-primary/20 text-primary hover:bg-primary/10 shadow-sm">
            <Clock className="h-4 w-4 mr-1" /> View schedule
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl mb-8 border-2 border-primary shadow-xl">
      <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center overflow-hidden">
        <div className="absolute w-64 h-64 bg-primary/5 rounded-full animate-pulse-slow"></div>
        <div className="absolute w-80 h-80 bg-primary/10 rounded-full animate-pulse-slower delay-150"></div>
        <div className="absolute w-48 h-48 bg-primary/15 rounded-full animate-pulse"></div>
      </div>
      
      <div className="relative p-6 md:p-8 backdrop-blur-sm bg-white/95">
        <div className="absolute top-0 right-0 p-3 bg-primary text-white font-bold rounded-bl-lg">
          NOW
          <div className="h-1.5 w-12 bg-white/80 mt-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white" 
              style={{ width: `${remainingMinutes ? (remainingMinutes / 45) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-start gap-4 md:gap-8">
          <div className="h-16 w-16 flex items-center justify-center bg-primary/20 rounded-lg shadow-md">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                {currentLesson.subject}
              </h2>
              <Badge className="bg-primary hover:bg-primary/90 text-white">Ongoing</Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mt-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-slate-600 font-medium">
                  {currentLesson.class} ({currentLesson.totalStudents} students)
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-secondary" />
                <span className="text-slate-600">
                  {currentLesson.grade} {currentLesson.stream}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-slate-600">{currentLesson.room}</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="text-sm">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-primary font-medium">
                    {remainingMinutes ? `${remainingMinutes} min remaining` : 'Ending soon'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-white shadow-md"
                >
                  <Star className="h-4 w-4 mr-1" /> Mark attendance
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary/20 text-primary hover:bg-primary/10 shadow-sm"
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