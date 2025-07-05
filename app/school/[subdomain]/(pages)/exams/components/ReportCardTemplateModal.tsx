import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Printer, X } from "lucide-react";
import SchoolReportCard from '../../students/components/ReportCard';
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig';
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore';

interface ReportCardTemplateModalProps {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    gender: string;
    grade: string;
    stream?: string;
    user: { email: string };
  };
  school: {
    id: string;
    schoolName: string;
    subdomain: string;
  };
  subjects: any[];
  term?: string;
  year?: string;
}

const templateOptions = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, professional design with gradient headers',
    preview: 'modern'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional layout with strong borders',
    preview: 'classic'
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Space-efficient design for quick overview',
    preview: 'compact'
  },
  {
    id: 'uganda-classic',
    name: 'Uganda Classic',
    description: 'Official Uganda education system format',
    preview: 'uganda-classic'
  }
];

export function ReportCardTemplateModal({ 
  student, 
  school, 
  subjects, 
  term = "1", 
  year = "2024" 
}: ReportCardTemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'compact' | 'uganda-classic'>('modern');
  const [isOpen, setIsOpen] = useState(false);

  // Fetch actual school configuration data
  const { data: schoolConfig } = useSchoolConfig();
  const { config } = useSchoolConfigStore();

  // Get actual school data from the store
  const actualSchoolData = {
    id: config?.id || school.id,
    schoolName: config?.tenant?.schoolName || school.schoolName,
    subdomain: config?.tenant?.subdomain || school.subdomain
  };

  // Get actual subjects from the store, filtered by student's grade/level
  const actualSubjects = config?.selectedLevels?.flatMap(level => level.subjects) || subjects;

  const handleDownload = (template: string) => {
    // TODO: Implement actual PDF download functionality
    console.log(`Downloading ${template} template for ${student.name}`);
    // Here you would typically call a PDF generation service
  };

  const handlePrint = (template: string) => {
    // TODO: Implement print functionality
    console.log(`Printing ${template} template for ${student.name}`);
    // Here you would typically trigger browser print
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Download Report Card
        </Button>
      </DrawerTrigger>
      <DrawerContent 
        className="w-3/4 h-screen overflow-y-auto p-0"
        style={{ width: '75vw', height: '100vh' }}
      >
        <DrawerHeader className="p-6 border-b border-gray-200">
          <DrawerTitle className="flex items-center justify-between">
            <span className="text-xl font-semibold">Select Report Card Template</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-6 p-6">
          {/* Template Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {templateOptions.map((template) => (
              <div
                key={template.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template.id as any)}
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600">
                      {template.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-xs text-gray-600">{template.description}</p>
                  {selectedTemplate === template.id && (
                    <Badge className="bg-blue-600 text-white text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Template:</span>
              <Badge variant="outline" className="font-medium">
                {templateOptions.find(t => t.id === selectedTemplate)?.name}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handlePrint(selectedTemplate)}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Preview
              </Button>
              <Button
                onClick={() => handleDownload(selectedTemplate)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Template Preview
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Preview of how the report card will look with the selected template
              </p>
            </div>
                          <div className="p-4 bg-white">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <SchoolReportCard
                    student={student}
                    school={actualSchoolData}
                    subjects={actualSubjects}
                    term={term}
                    year={year}
                    template={selectedTemplate}
                  />
                </div>
              </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 