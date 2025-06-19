"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Filter, 
  User, 
  UserPlus, 
  Users, 
  Info, 
  CalendarDays, 
  School, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  SortAsc, 
  SortDesc, 
  ListFilter, 
  Award,
  Calendar,
  Clock,
  Edit,
  GraduationCap,
  Phone,
  Plus,
  CheckCircle,
} from "lucide-react";


// Teacher type definition
type Teacher = {
  id: string;
  name: string;
  employeeId: string;
  photo?: string;
  gender: "male" | "female";
  dateOfBirth: string;
  joinDate: string;
  status: "active" | "on leave" | "former" | "substitute";
  subjects: string[];
  classesAssigned: string[];
  grades: string[];
  designation: string;
  department: string;
  contacts: {
    phone: string;
    email: string;
    address?: string;
  };
  academic: {
    qualification: string;
    specialization: string;
    experience: number; // years
    certifications?: string[];
  };
  performance?: {
    rating: number; // Out of 5
    lastEvaluation?: string;
    studentPerformance?: string;
    trend?: "improving" | "declining" | "stable";
  };
  responsibilities?: string[];
  extraCurricular?: {
    clubs?: string[];
    sports?: string[];
    committees?: string[];
  };
};

// Teacher form data schema
const teacherFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  employee_id: z.string().min(2, { message: 'Employee ID is required' }),
  gender: z.string({ required_error: "Please select a gender" }),
  date_of_birth: z.string().min(1, { message: 'Date of birth is required' }),
  join_date: z.string().min(1, { message: 'Join date is required' }),
  designation: z.string().min(1, { message: 'Designation is required' }),
  department: z.string().min(1, { message: 'Department is required' }),
  phone: z.string().min(10, { message: 'Valid phone number is required' }),
  email: z.string().email({ message: 'Valid email is required' }),
  address: z.string().optional().or(z.literal('')),
  qualification: z.string().min(1, { message: 'Qualification is required' }),
  specialization: z.string().min(1, { message: 'Specialization is required' }),
  experience: z.coerce.number().min(0, { message: 'Experience is required' }),
  subject_list: z.string().optional().or(z.literal('')),
});

type TeacherFormData = z.infer<typeof teacherFormSchema>;

// Mock data for the departments
const departments = [
  'English',
  'Mathematics',
  'Science',
  'Social Studies',
  'Physical Education',
  'Arts & Music',
  'Languages',
  'Computer Science',
  'Special Education',
  'Administration'
];

// Create Teacher Drawer component
function CreateTeacherDrawer({ onTeacherCreated }: { onTeacherCreated: () => void }) {
  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: '',
      employee_id: '',
      gender: '',
      date_of_birth: '',
      join_date: '',
      designation: '',
      department: '',
      phone: '',
      email: '',
      address: '',
      qualification: '',
      specialization: '',
      experience: 0,
      subject_list: '',
    },
  });

  // Submit handler
  const onSubmit = (data: TeacherFormData) => {
    // In a real application, this would call an API to create the teacher
    console.log('Creating teacher:', data);
    // Simulate API call
    setTimeout(() => {
      onTeacherCreated();
      form.reset();
    }, 500);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="default" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add New Teacher
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-full md:w-1/2 bg-gradient-to-br from-custom-blue/10 to-white" data-vaul-drawer-direction="right">
        <DrawerHeader className="border-b border-custom-blue/20 pb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-custom-blue/10 rounded-full p-3 mr-3">
              <GraduationCap className="h-6 w-6 text-custom-blue" />
            </div>
            <DrawerTitle className="text-xl text-custom-blue font-semibold">Teacher Registration</DrawerTitle>
          </div>
          <DrawerDescription className="text-center text-sm text-custom-blue/70">Enter new teacher information for school records</DrawerDescription>
        </DrawerHeader>
        <div className="px-6 py-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-custom-blue/20">
                <h3 className="text-md font-medium text-custom-blue mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Teacher's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., TCH/2023/001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation *</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select designation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="principal">Principal</SelectItem>
                            <SelectItem value="vice_principal">Vice Principal</SelectItem>
                            <SelectItem value="head_teacher">Head Teacher</SelectItem>
                            <SelectItem value="senior_teacher">Senior Teacher</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="assistant_teacher">Assistant Teacher</SelectItem>
                            <SelectItem value="intern">Intern</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map(dept => (
                              <SelectItem key={dept} value={dept.toLowerCase()}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-custom-blue" />
                          Date of Birth *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="date" 
                              {...field} 
                              className="pl-3 pr-10 cursor-pointer bg-custom-blue/5 border-custom-blue/20 hover:border-custom-blue/40 focus:border-custom-blue focus:ring-2 focus:ring-custom-blue/20 transition-all" 
                            />
                            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-custom-blue pointer-events-none" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="join_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-custom-blue" />
                          Join Date *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="date" 
                              {...field} 
                              className="pl-3 pr-10 cursor-pointer bg-custom-blue/5 border-custom-blue/20 hover:border-custom-blue/40 focus:border-custom-blue focus:ring-2 focus:ring-custom-blue/20 transition-all" 
                            />
                            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-custom-blue pointer-events-none" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <h3 className="text-md font-medium text-green-800 mb-3 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Qualifications & Experience
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="qualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Highest Qualification *</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select qualification" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="diploma">Diploma in Education</SelectItem>
                            <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                            <SelectItem value="masters">Master's Degree</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Mathematics Education" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience *</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject_list"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subjects Taught (comma separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Math, Physics, Chemistry" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <h3 className="text-md font-medium text-blue-800 mb-3 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+254700000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="teacher@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Home Address (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Physical address" {...field} className="focus:ring-2 focus:ring-blue-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-custom-blue/80 to-green-600 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Teacher Portal Access
                  </h3>
                  <Badge className="bg-white text-custom-blue">Auto-Generated</Badge>
                </div>
                <p className="text-xs opacity-90 mb-3">Login credentials will be automatically generated and sent to the teacher's email once registered.</p>
                <div className="flex items-center justify-between bg-white/20 rounded p-2 backdrop-blur-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-yellow-300" />
                    <span className="text-sm">Staff Portal</span>
                  </div>
                  <span className="text-xs bg-white/30 px-2 py-0.5 rounded">staff.kenyaschools.edu</span>
                </div>
              </div>

              <DrawerFooter className="border-t border-custom-blue/20 pt-4">
                <Button type="submit" className="bg-gradient-to-r from-custom-blue to-green-700 hover:from-custom-blue/90 hover:to-green-800 text-white gap-2">
                  <UserPlus className="h-4 w-4" />
                  Register New Teacher
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="border-custom-blue/20 text-custom-blue/70">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// Mock data for teachers
const mockTeachers: Teacher[] = [
  {
    id: "t1",
    name: "Dr. Alice Johnson",
    employeeId: "TCH/2023/001",
    photo: "/images/teacher1.jpg",
    gender: "female",
    dateOfBirth: "1980-05-15",
    joinDate: "2020-01-10",
    status: "active",
    subjects: ["Mathematics", "Physics"],
    classesAssigned: ["Form 3A", "Form 4B"],
    grades: ["Form 3", "Form 4"],
    designation: "senior_teacher",
    department: "mathematics",
    contacts: {
      phone: "+254712345678",
      email: "alice.johnson@kenyaschools.edu",
      address: "123 Nairobi Avenue"
    },
    academic: {
      qualification: "phd",
      specialization: "Applied Mathematics",
      experience: 12,
      certifications: ["Advanced Pedagogical Training"]
    },
    performance: {
      rating: 4.8,
      lastEvaluation: "2023-06-15",
      studentPerformance: "Excellent",
      trend: "improving"
    },
    responsibilities: ["Math Department Coordinator", "Examination Committee"],
    extraCurricular: {
      clubs: ["Mathematics Club"],
      sports: [],
      committees: ["Academic Council"]
    }
  },
  {
    id: "t2",
    name: "James Omondi",
    employeeId: "TCH/2023/002",
    photo: "/images/teacher2.jpg",
    gender: "male",
    dateOfBirth: "1985-09-22",
    joinDate: "2019-05-15",
    status: "active",
    subjects: ["English", "Literature"],
    classesAssigned: ["Form 2A", "Form 3C"],
    grades: ["Form 2", "Form 3"],
    designation: "teacher",
    department: "english",
    contacts: {
      phone: "+254723456789",
      email: "james.omondi@kenyaschools.edu",
      address: "45 Moi Avenue"
    },
    academic: {
      qualification: "masters",
      specialization: "English Literature",
      experience: 8,
      certifications: ["Creative Writing Workshop"]
    },
    performance: {
      rating: 4.5,
      lastEvaluation: "2023-05-20",
      studentPerformance: "Very Good",
      trend: "stable"
    },
    responsibilities: ["Drama Club Advisor"],
    extraCurricular: {
      clubs: ["Debating Club", "Creative Writing Club"],
      sports: [],
      committees: ["Cultural Committee"]
    }
  },
  {
    id: "t3",
    name: "Wangari Muthoni",
    employeeId: "TCH/2023/003",
    photo: "/images/teacher3.jpg",
    gender: "female",
    dateOfBirth: "1990-03-12",
    joinDate: "2021-08-30",
    status: "active",
    subjects: ["Biology", "Chemistry"],
    classesAssigned: ["Form 1B", "Form 2D"],
    grades: ["Form 1", "Form 2"],
    designation: "teacher",
    department: "science",
    contacts: {
      phone: "+254734567890",
      email: "wangari.muthoni@kenyaschools.edu",
      address: "78 Kenyatta Street"
    },
    academic: {
      qualification: "bachelors",
      specialization: "Biological Sciences",
      experience: 3,
      certifications: ["Laboratory Safety Training"]
    },
    performance: {
      rating: 4.2,
      lastEvaluation: "2023-06-10",
      studentPerformance: "Good",
      trend: "improving"
    },
    responsibilities: ["Laboratory Coordinator"],
    extraCurricular: {
      clubs: ["Environmental Club"],
      sports: ["Volleyball Coach"],
      committees: ["Field Trip Committee"]
    }
  },
  {
    id: "t4",
    name: "Mohammed Hassan",
    employeeId: "TCH/2023/004",
    photo: "/images/teacher4.jpg",
    gender: "male",
    dateOfBirth: "1975-12-05",
    joinDate: "2015-01-05",
    status: "active",
    subjects: ["History", "Religious Studies"],
    classesAssigned: ["Form 3D", "Form 4A"],
    grades: ["Form 3", "Form 4"],
    designation: "head_teacher",
    department: "social studies",
    contacts: {
      phone: "+254745678901",
      email: "mohammed.hassan@kenyaschools.edu",
      address: "123 Unity Road"
    },
    academic: {
      qualification: "masters",
      specialization: "African History",
      experience: 15,
      certifications: ["Educational Leadership Program"]
    },
    performance: {
      rating: 4.9,
      lastEvaluation: "2023-05-05",
      studentPerformance: "Excellent",
      trend: "stable"
    },
    responsibilities: ["Social Studies Department Head", "School Discipline Committee Chair"],
    extraCurricular: {
      clubs: ["History Club"],
      sports: [],
      committees: ["School Board Representative"]
    }
  }
];

function TeacherCard({ teacher }: { teacher: Teacher }) {
  const designationLabels: Record<string, string> = {
    principal: "Principal",
    vice_principal: "Vice Principal",
    head_teacher: "Head Teacher",
    senior_teacher: "Senior Teacher",
    teacher: "Teacher",
    assistant_teacher: "Assistant Teacher",
    intern: "Intern"
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    "on leave": "bg-amber-100 text-amber-800",
    former: "bg-gray-100 text-gray-500",
    substitute: "bg-blue-100 text-blue-800"
  };

  return (
    <Card className="overflow-hidden border-custom-blue/20 hover:border-custom-blue/40 transition-all hover:shadow-md">
      <CardHeader className="bg-custom-blue/5 p-4 pb-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-full bg-custom-blue/20 flex items-center justify-center overflow-hidden">
              {teacher.photo ? (
                <img 
                  src={teacher.photo} 
                  alt={teacher.name} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <User className="h-6 w-6 text-custom-blue" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-medium text-custom-blue">
                {teacher.name}
              </CardTitle>
              <CardDescription className="text-sm text-custom-blue/70">
                ID: {teacher.employeeId}
              </CardDescription>
            </div>
          </div>
          <Badge className={`${statusColors[teacher.status]}`}>
            {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-custom-blue" />
            <span className="text-gray-600">{designationLabels[teacher.designation] || teacher.designation}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <School className="h-3.5 w-3.5 text-custom-blue" />
            <span className="text-gray-600">{teacher.department.charAt(0).toUpperCase() + teacher.department.slice(1)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-custom-blue" />
            <span className="text-gray-600">{teacher.contacts.phone}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-custom-blue" />
            <span className="text-gray-600">{teacher.academic.experience} years</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 mb-1.5">SUBJECTS</h4>
          <div className="flex flex-wrap gap-1">
            {teacher.subjects.map((subject, idx) => (
              <Badge key={idx} variant="outline" className="bg-blue-50 text-xs font-normal py-0 px-1.5">
                {subject}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 mb-1.5">CLASSES</h4>
          <div className="flex flex-wrap gap-1">
            {teacher.classesAssigned.map((cls, idx) => (
              <Badge key={idx} variant="outline" className="bg-green-50 text-xs font-normal py-0 px-1.5">
                {cls}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-3 flex justify-between items-center">
        <Button variant="ghost" size="sm" className="text-custom-blue gap-1">
          <Info className="h-3.5 w-3.5" />
          Details
        </Button>
        <Button variant="ghost" size="sm" className="text-amber-600 gap-1">
          <Edit className="h-3.5 w-3.5" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}

// Teachers search filter component
function TeachersSearchFilter({ onSearch }: { onSearch: (query: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-custom-blue/20 mb-5">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teachers by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-200 focus-within:bg-white focus:border-custom-blue focus:ring-2 focus:ring-custom-blue/20"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            type="submit" 
            className="bg-custom-blue hover:bg-custom-blue/90 text-white gap-2"
          >
            <Search className="h-4 w-4" /> Search
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="border-gray-200 text-gray-600 hover:bg-gray-50 gap-2"
            onClick={() => {
              setSearchQuery("");
              onSearch("");
            }}
          >
            <ListFilter className="h-4 w-4" /> Reset
          </Button>
        </div>
      </form>
    </div>
  );
}

function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>(mockTeachers);
  const [searchQuery, setSearchQuery] = useState("");
  const [teacherCreated, setTeacherCreated] = useState(false);

  const handleTeacherCreated = () => {
    setTeacherCreated(true);
    // In a real application, we would fetch the updated list from the backend
    setTimeout(() => {
      setTeacherCreated(false);
    }, 3000);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredTeachers(teachers);
      return;
    }
    
    // Filter teachers by name
    const filtered = teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredTeachers(filtered);
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-custom-blue flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Teachers Management
          </h1>
          <p className="text-gray-500 mt-1">Manage your school's teaching staff</p>
        </div>
        
        <div className="flex items-center gap-3">
          <CreateTeacherDrawer onTeacherCreated={handleTeacherCreated} />
        </div>
      </div>

      {teacherCreated && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Teacher created successfully!
        </div>
      )}

      <TeachersSearchFilter onSearch={handleSearch} />
      
      {filteredTeachers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-center mb-4">
            <Users className="h-12 w-12 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-500">No teachers found</h3>
          <p className="text-gray-400 mt-1">
            {searchQuery ? `No teachers match "${searchQuery}"` : "No teachers available in the system"}
          </p>
          {searchQuery && (
            <Button 
              variant="outline" 
              className="mt-4 border-gray-200"
              onClick={() => handleSearch("")}
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTeachers.map(teacher => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TeachersPage;