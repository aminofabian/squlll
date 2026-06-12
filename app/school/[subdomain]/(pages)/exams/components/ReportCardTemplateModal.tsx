import React, { useRef, useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Printer, X, Loader2 } from "lucide-react";
import SchoolReportCard from '../../students/components/ReportCard';
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig';
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore';
import { useParams } from 'next/navigation';
import { generateReportCardPdf, downloadPdfDataUrl } from '@/lib/exams/reportCards';
import { toast } from 'sonner';

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
  const [pdfLoading, setPdfLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const subdomain = params.subdomain as string;

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

  const handleDownload = async () => {
    if (!subdomain || !student.id) {
      toast.error('Cannot generate PDF', { description: 'Missing school or student information.' });
      return;
    }
    setPdfLoading(true);
    try {
      const pdf = await generateReportCardPdf(subdomain, {
        studentId: student.id,
        academicYear: year,
        term: Number(term),
      });
      downloadPdfDataUrl(pdf, `report-card-${student.admissionNumber}-${year}-t${term}.pdf`);
      toast.success('Report card PDF downloaded');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to generate PDF',
      );
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrint = () => {
    if (!previewRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Unable to open print window. Please allow popups.');
      return;
    }
    const content = previewRef.current.innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Report Card - ${student.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-white p-8">
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
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
                onClick={handlePrint}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Preview
              </Button>
              <Button
                onClick={handleDownload}
                disabled={pdfLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {pdfLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
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
                  <div ref={previewRef}>
                    <SchoolReportCard
                      student={student}
                      school={actualSchoolData}
                      subjectGrades={[]}
                      term={term}
                      year={year}
                      template={selectedTemplate}
                    />
                  </div>
                </div>
              </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 