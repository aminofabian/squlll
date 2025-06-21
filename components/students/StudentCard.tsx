import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen as BookOpenIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  User as UserIcon,
  Wallet as WalletIcon,
  ArrowUp,
  ArrowDown,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { Student } from '@/types/student';

interface StudentCardProps {
  student: Student;
  getStatusColor: (status: string) => string;
  getTrendIcon: (trend: string) => React.ReactNode;
}

export function StudentCard({ 
  student, 
  getStatusColor,
  getTrendIcon
}: StudentCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <Card className="border border-gray-200 hover:border-gray-300 transition-all">
      <CardHeader className="flex flex-col items-start p-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            {student.photo ? (
              <img 
                src={student.photo} 
                alt={`${student.first_name} ${student.last_name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-gray-500" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {student.first_name} {student.last_name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(student.status)}>
                {student.status}
              </Badge>
              {getTrendIcon(student.attendance?.trend)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Personal Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{formatDate(student.date_of_birth)}</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{student.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <InfoIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{student.gender}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Academic Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{student.grade?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{formatDate(student.admission_date)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-3 bg-yellow-50/50 rounded border border-yellow-100">
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-xs font-semibold text-yellow-700 flex items-center">
              <WalletIcon className="h-4 w-4 mr-1" />
              Fee Status
            </h4>
            <span className="text-xs text-yellow-600">
              KES {student.fees?.amount?.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-yellow-600">Status:</span>
            <Badge variant="outline" className={`text-yellow-800 bg-yellow-100`}>Active</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
