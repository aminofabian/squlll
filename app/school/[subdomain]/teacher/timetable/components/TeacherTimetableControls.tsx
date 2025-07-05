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
  User
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#246a59]">Teacher Dashboard</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">{teacherName}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showTeacherDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showTeacherDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[200px] max-h-60 overflow-y-auto">
                  {availableTeachers.map((teacher) => (
                    <div
                      key={teacher}
                      onClick={() => {
                        console.log('Selected teacher:', teacher);
                        onTeacherSelect(teacher);
                        setShowTeacherDropdown(false);
                      }}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                        teacherName === teacher ? 'bg-blue-50 text-primary' : ''
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
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Load Mock Data
          </Button>
          <Button 
            variant="outline"
            onClick={onLoad}
            className="border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Load Timetable
          </Button>
          <Button 
            variant="outline"
            onClick={onSave}
            className="border-[#246a59]/20 text-[#246a59] hover:bg-[#246a59]/10"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Timetable
          </Button>
          <Button 
            onClick={onSync} 
            disabled={isSyncing}
            className="bg-[#246a59] hover:bg-[#1a4d3f] text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync with Main Timetable'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Total Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalLessons}</div>
            <p className="text-xs text-slate-500 mt-1">This week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{completedLessons}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-slate-500">{completionRate}%</div>
              <div className="flex-1 bg-slate-200 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full" 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{upcomingLessons}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-slate-500">{upcomingRate}%</div>
              <div className="flex-1 bg-slate-200 rounded-full h-1">
                <div 
                  className="bg-amber-500 h-1 rounded-full" 
                  style={{ width: `${upcomingRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
            <p className="text-xs text-slate-500 mt-1">Avg: {averageClassSize} per class</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-[#246a59] text-[#246a59] hover:bg-[#246a59] hover:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              View Lesson Plans
            </Button>
            <Button variant="outline" className="border-[#246a59] text-[#246a59] hover:bg-[#246a59] hover:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Progress Reports
            </Button>
            <Button variant="outline" className="border-[#246a59] text-[#246a59] hover:bg-[#246a59] hover:text-white">
              <AlertCircle className="w-4 h-4 mr-2" />
              Report Issues
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Timetable Synced
        </Badge>
        <span className="text-xs text-slate-500">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default TeacherTimetableControls; 