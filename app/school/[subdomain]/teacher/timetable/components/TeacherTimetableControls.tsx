import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Save,
  Upload,
  Download,
  ChevronDown,
  User,
  ChevronUp,
  Target,
  Award,
  BarChart3,
  GraduationCap
} from 'lucide-react';

interface TeacherTimetableControlsProps {
  teacherName: string;
  availableTeachers: string[];
  totalLessons: number;
  completedLessons: number;
  upcomingLessons: number;
  totalStudents: number;
  averageClassSize: number;
  onTeacherSelect: (teacher: string) => void;
  onSync: () => void;
  onSave: () => void;
  onLoad: () => void;
  onLoadMockData: () => void;
  isSyncing: boolean;
}

// Component to avoid hydration mismatch with time
const LastUpdatedTime: React.FC = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-xs text-slate-500">
      Last updated: {time || '--:--:--'}
    </span>
  );
};

const TeacherTimetableControls: React.FC<TeacherTimetableControlsProps> = ({
  teacherName,
  availableTeachers,
  totalLessons,
  completedLessons,
  upcomingLessons,
  totalStudents,
  averageClassSize,
  onTeacherSelect,
  onSync,
  onSave,
  onLoad,
  onLoadMockData,
  isSyncing
}) => {
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [expandedStats, setExpandedStats] = useState<string[]>([]);
  const [showStatsSection, setShowStatsSection] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const upcomingRate = totalLessons > 0 ? Math.round((upcomingLessons / totalLessons) * 100) : 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTeacherDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleStatExpansion = (statId: string) => {
    setExpandedStats(prev => 
      prev.includes(statId) 
        ? prev.filter(id => id !== statId)
        : [...prev, statId]
    );
  };

  const isExpanded = (statId: string) => expandedStats.includes(statId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Teacher Dashboard</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">{teacherName}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showTeacherDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showTeacherDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 min-w-[200px] max-h-60 overflow-y-auto">
                  {availableTeachers.map((teacher) => (
                    <div
                      key={teacher}
                      onClick={() => {
                        console.log('Selected teacher:', teacher);
                        onTeacherSelect(teacher);
                        setShowTeacherDropdown(false);
                      }}
                      className={`px-4 py-3 cursor-pointer hover:bg-slate-50 flex items-center justify-between ${
                        teacherName === teacher ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <span>{teacher}</span>
                      {teacherName === teacher && (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-slate-600">Welcome back!</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={onLoadMockData}
            className="border-accent/30 text-accent hover:bg-accent/10 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Load Mock Data
          </Button>
          <Button 
            variant="outline"
            onClick={onLoad}
            className="border-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Load Timetable
          </Button>
          <Button 
            variant="outline"
            onClick={onSave}
            className="border-secondary/30 text-secondary hover:bg-secondary/10 shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Timetable
          </Button>
          <Button 
            onClick={onSync} 
            disabled={isSyncing}
            className="bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync with Main Timetable'}
          </Button>
        </div>
      </div>

      {/* Stats Toggle Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowStatsSection(!showStatsSection)}
          className="border-primary/30 text-primary hover:bg-primary/50 shadow-sm transition-all duration-300"
        >
          {showStatsSection ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Hide Dashboard Stats
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4 mr-2 hover:text-blue-500" />
              Show Dashboard Stats
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards - Hidden by default */}
      <div className={`transition-all duration-500 overflow-hidden ${
        showStatsSection ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className={`border-l-4 border-l-primary shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
              isExpanded('total') ? 'ring-2 ring-primary/20' : ''
            }`}
            onClick={() => toggleStatExpansion('total')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Total Lessons
                </div>
                {isExpanded('total') ? (
                  <ChevronUp className="w-4 h-4 text-primary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-primary" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalLessons}</div>
              <p className="text-xs text-slate-500 mt-1">This week</p>
              
              {/* Expanded Content */}
              <div className={`mt-4 space-y-3 transition-all duration-300 overflow-hidden ${
                isExpanded('total') ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Daily Average:</span>
                    <span className="font-semibold text-slate-900">{Math.round(totalLessons / 5)} lessons</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-600">Busiest Day:</span>
                    <span className="font-semibold text-slate-900">Wednesday</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-600">Lightest Day:</span>
                    <span className="font-semibold text-slate-900">Friday</span>
                  </div>
                  <div className="mt-3 p-2 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Target className="w-3 h-3" />
                      <span>Target: 25 lessons/week</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`border-l-4 border-l-success shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
              isExpanded('completed') ? 'ring-2 ring-success/20' : ''
            }`}
            onClick={() => toggleStatExpansion('completed')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Completed
                </div>
                {isExpanded('completed') ? (
                  <ChevronUp className="w-4 h-4 text-success" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-success" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{completedLessons}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-xs text-slate-500">{completionRate}%</div>
                <div className="flex-1 bg-slate-200 rounded-full h-1">
                  <div 
                    className="bg-success h-1 rounded-full transition-all duration-500" 
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Expanded Content */}
              <div className={`mt-4 space-y-3 transition-all duration-300 overflow-hidden ${
                isExpanded('completed') ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">This Week:</span>
                    <span className="font-semibold text-slate-900">{completedLessons} lessons</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-600">Last Week:</span>
                    <span className="font-semibold text-slate-900">{Math.round(completedLessons * 0.9)} lessons</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-600">Success Rate:</span>
                    <span className="font-semibold text-success">{completionRate}%</span>
                  </div>
                  <div className="mt-3 p-2 bg-success/5 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-success">
                      <Award className="w-3 h-3" />
                      <span>Excellent completion rate!</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`border-l-4 border-l-accent shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
              isExpanded('upcoming') ? 'ring-2 ring-accent/20' : ''
            }`}
            onClick={() => toggleStatExpansion('upcoming')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  Upcoming
                </div>
                {isExpanded('upcoming') ? (
                  <ChevronUp className="w-4 h-4 text-accent" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-accent" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{upcomingLessons}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-xs text-slate-500">{upcomingRate}%</div>
                <div className="flex-1 bg-slate-200 rounded-full h-1">
                  <div 
                    className="bg-accent h-1 rounded-full transition-all duration-500" 
                    style={{ width: `${upcomingRate}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Expanded Content */}
              <div className={`mt-4 space-y-3 transition-all duration-300 overflow-hidden ${
                isExpanded('upcoming') ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Today:</span>
                    <span className="font-semibold text-slate-900">{Math.round(upcomingLessons * 0.2)} lessons</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-600">Tomorrow:</span>
                    <span className="font-semibold text-slate-900">{Math.round(upcomingLessons * 0.25)} lessons</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-600">This Week:</span>
                    <span className="font-semibold text-slate-900">{upcomingLessons} lessons</span>
                  </div>
                  <div className="mt-3 p-2 bg-accent/5 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-accent">
                      <BarChart3 className="w-3 h-3" />
                      <span>Well distributed schedule</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`border-l-4 border-l-info shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
              isExpanded('students') ? 'ring-2 ring-info/20' : ''
            }`}
            onClick={() => toggleStatExpansion('students')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-info" />
                  Total Students
                </div>
                {isExpanded('students') ? (
                  <ChevronUp className="w-4 h-4 text-info" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-info" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
              <p className="text-xs text-slate-500 mt-1">Avg: {averageClassSize} per class</p>
              
              {/* Expanded Content */}
              <div className={`mt-4 space-y-3 transition-all duration-300 overflow-hidden ${
                isExpanded('students') ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Largest Class:</span>
                    <span className="font-semibold text-slate-900">{averageClassSize + 5} students</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-600">Smallest Class:</span>
                    <span className="font-semibold text-slate-900">
                      {Math.max(0, averageClassSize - 3)} students
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-600">Total Classes:</span>
                    <span className="font-semibold text-slate-900">
                      {averageClassSize > 0 ? Math.round(totalStudents / averageClassSize) : 0}
                    </span>
                  </div>
                  <div className="mt-3 p-2 bg-info/5 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-info">
                      <GraduationCap className="w-3 h-3" />
                      <span>Optimal class sizes</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-md hover:shadow-lg transition-shadow mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white shadow-sm">
                <BookOpen className="w-4 h-4 mr-2" />
                View Lesson Plans
              </Button>
              <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white shadow-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Progress Reports
              </Button>
              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white shadow-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                Report Issues
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mt-6">
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
            Timetable Synced
          </Badge>
          <LastUpdatedTime />
        </div>
      </div>
    </div>
  );
};

export default TeacherTimetableControls; 