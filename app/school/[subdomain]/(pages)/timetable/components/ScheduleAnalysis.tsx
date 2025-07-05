import React from 'react';
import { CalendarDays, Clock4, Award, Zap, TrendingUp } from 'lucide-react';

interface ScheduleAnalysisProps {
  dayDistribution: Record<string, number>;
  timeSlotUsage: Record<string, number>;
  subjectDistribution: Record<string, number>;
  mostBusyDay: string;
  mostBusyTime: string;
  doubleLessons: number;
  completionPercentage: number;
  averageLessonsPerDay: number;
}

export const ScheduleAnalysis: React.FC<ScheduleAnalysisProps> = ({
  dayDistribution,
  timeSlotUsage,
  subjectDistribution,
  mostBusyDay,
  mostBusyTime,
  doubleLessons,
  completionPercentage,
  averageLessonsPerDay
}) => {
  const maxDayCount = Math.max(...Object.values(dayDistribution), 1);
  const maxSubjectCount = Math.max(...Object.values(subjectDistribution), 1);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-primary" />
        Schedule Analysis
      </h3>
      
      <div className="space-y-4">
        {/* Day Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Day Distribution</h4>
          <div className="space-y-2">
            {Object.entries(dayDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([day, count]) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(count / maxDayCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Busiest Times */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Peak Hours</h4>
          <div className="space-y-2">
            {Object.entries(timeSlotUsage)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([time, count], index) => (
                <div key={time} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-red-500' : 
                      index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm text-gray-600">{time}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">{count} lessons</span>
                </div>
              ))}
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Subject Distribution</h4>
          <div className="space-y-2">
            {Object.entries(subjectDistribution)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([subject, count], index) => (
                <div key={subject} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-primary' : 
                      index === 1 ? 'bg-emerald-600' : 
                      index === 2 ? 'bg-amber-500' : 
                      index === 3 ? 'bg-sky-500' : 'bg-orange-500'
                    }`} />
                    <span className="text-sm text-gray-700 truncate">{subject}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Insights */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Insights</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Clock4 className="w-3 h-3 text-primary" />
              <span>Busiest day: {mostBusyDay}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-3 h-3 text-emerald-600" />
              <span>Peak time: {mostBusyTime}</span>
            </div>
            {doubleLessons > 0 && (
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-600" />
                <span>{doubleLessons} double lessons scheduled</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-orange-600" />
              <span>Schedule {completionPercentage}% complete</span>
            </div>
            {averageLessonsPerDay > 0 && (
              <div className="flex items-center gap-2">
                <CalendarDays className="w-3 h-3 text-sky-600" />
                <span>Avg {averageLessonsPerDay} lessons per day</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 