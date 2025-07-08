import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useTeachersByTenant, useTeacherStaffUsersFromStore } from '../../lib/hooks/useTeachers';
import { Loader2, RefreshCw, Users } from 'lucide-react';

interface TeacherStaffListProps {
  tenantId: string;
  role?: string;
}

export const TeacherStaffList: React.FC<TeacherStaffListProps> = ({ 
  tenantId,
  role = "TEACHER"
}) => {
  const { data, isLoading, error, refetch } = useTeachersByTenant(tenantId, role);
  const { teacherStaffUsers } = useTeacherStaffUsersFromStore();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teachers & Staff
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading teachers and staff...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teachers & Staff
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-red-500 mb-4">Error loading teachers and staff</p>
            <p className="text-sm text-gray-600 mb-4">{error.message}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teachers & Staff
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {teacherStaffUsers.length} {teacherStaffUsers.length === 1 ? 'member' : 'members'}
            </Badge>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {teacherStaffUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No teachers or staff found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {teacherStaffUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Teacher
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherStaffList; 