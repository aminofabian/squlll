import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen as BookOpenIcon } from 'lucide-react';
import type { Grade } from '@/types/grade';
import type { EducationLevel } from '@/types/education';

interface GradeButtonProps {
  grade: Grade;
  selectedGradeId: string;
  onClick: (id: string) => void;
}

const getLevelColor = (level: EducationLevel): string => {
  return level === 'preschool' ? 'purple' :
         level === 'primary' ? 'blue' :
         level === 'junior-secondary' ? 'yellow' :
         level === 'senior-secondary' ? 'green' :
         'purple';
};

const getLevelIcon = (level: EducationLevel) => {
  switch (level) {
    case 'preschool': return <BookOpenIcon className="h-4 w-4 text-purple-600" />;
    case 'primary': return <BookOpenIcon className="h-4 w-4 text-blue-600" />;
    case 'junior-secondary': return <BookOpenIcon className="h-4 w-4 text-yellow-600" />;
    case 'senior-secondary': return <BookOpenIcon className="h-4 w-4 text-green-600" />;
    default: return <BookOpenIcon className="h-4 w-4 text-purple-600" />;
  }
};

export function GradeButton({ grade, selectedGradeId, onClick }: GradeButtonProps) {
  const isSelected = grade.id === selectedGradeId;
  const levelColor = getLevelColor(grade.level);
  const levelIcon = getLevelIcon(grade.level);

  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      size="sm"
      className={`w-full justify-start gap-2 ${
        isSelected ? 
          `bg-${levelColor}-500/10 text-${levelColor}-600 hover:bg-${levelColor}-500/20` :
          `text-${levelColor}-600 hover:bg-${levelColor}-50/20 hover:text-${levelColor}-600`
      }`}
      onClick={() => onClick(grade.id)}
    >
      {levelIcon}
      <span className="flex flex-col">
        <span className="text-sm font-medium">{grade.name}</span>
        <span className="text-xs text-muted-foreground">{grade.level}</span>
      </span>
    </Button>
  );
}
