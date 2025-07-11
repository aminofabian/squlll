"use client"

import React, { useState, useEffect } from "react";
import { 
  Send, 
  Users, 
  User, 
  Building2, 
  GraduationCap, 
  Search, 
  Filter,
  X,
  ChevronDown,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Home
} from "lucide-react";

interface Recipient {
  id: string;
  name: string;
  type: 'student' | 'parent' | 'admin' | 'class' | 'class-parents';
  email?: string;
  phone?: string;
  class?: string;
  grade?: string;
  avatar?: string;
  isSelected?: boolean;
}

interface SendMessageSectionProps {
  subdomain: string;
  onBack: () => void;
}

// Mock data for demonstration
const mockRecipients: Recipient[] = [
  // Students
  { id: 's1', name: 'John Smith', type: 'student', email: 'john.smith@school.com', class: '7A', grade: 'Grade 7' },
  { id: 's2', name: 'Sarah Johnson', type: 'student', email: 'sarah.johnson@school.com', class: '7A', grade: 'Grade 7' },
  { id: 's3', name: 'Michael Brown', type: 'student', email: 'michael.brown@school.com', class: '8B', grade: 'Grade 8' },
  { id: 's4', name: 'Emma Davis', type: 'student', email: 'emma.davis@school.com', class: '8B', grade: 'Grade 8' },
  
  // Parents
  { id: 'p1', name: 'Mr. & Mrs. Smith', type: 'parent', email: 'smith.parents@email.com', phone: '+1234567890' },
  { id: 'p2', name: 'Mrs. Johnson', type: 'parent', email: 'johnson.parent@email.com', phone: '+1234567891' },
  { id: 'p3', name: 'Mr. Brown', type: 'parent', email: 'brown.parent@email.com', phone: '+1234567892' },
  { id: 'p4', name: 'Mr. & Mrs. Davis', type: 'parent', email: 'davis.parents@email.com', phone: '+1234567893' },
  
  // Admins
  { id: 'a1', name: 'Principal Wilson', type: 'admin', email: 'principal@school.com', phone: '+1234567894' },
  { id: 'a2', name: 'Vice Principal Garcia', type: 'admin', email: 'vice.principal@school.com', phone: '+1234567895' },
  { id: 'a3', name: 'School Secretary', type: 'admin', email: 'secretary@school.com', phone: '+1234567896' },
  
  // Classes
  { id: 'c1', name: 'Class 7A (All Students)', type: 'class', class: '7A', grade: 'Grade 7' },
  { id: 'c2', name: 'Class 8B (All Students)', type: 'class', class: '8B', grade: 'Grade 8' },
  { id: 'c3', name: 'Class 9C (All Students)', type: 'class', class: '9C', grade: 'Grade 9' },
  
  // Class Parents
  { id: 'cp1', name: 'Parents of Class 7A', type: 'class-parents', class: '7A', grade: 'Grade 7' },
  { id: 'cp2', name: 'Parents of Class 8B', type: 'class-parents', class: '8B', grade: 'Grade 8' },
  { id: 'cp3', name: 'Parents of Class 9C', type: 'class-parents', class: '9C', grade: 'Grade 9' },
];

const messageTemplates = [
  { id: 'template1', title: 'Homework Reminder', content: 'Dear {recipient}, this is a reminder about the homework assignment due tomorrow. Please ensure it is completed and submitted on time.' },
  { id: 'template2', title: 'Class Announcement', content: 'Dear {recipient}, I hope this message finds you well. I wanted to share an important announcement about our upcoming class activities.' },
  { id: 'template3', title: 'Progress Update', content: 'Dear {recipient}, I wanted to provide you with an update on {student_name}\'s progress in class. They are doing well and showing great improvement.' },
  { id: 'template4', title: 'Meeting Request', content: 'Dear {recipient}, I would like to schedule a meeting to discuss {student_name}\'s academic progress. Please let me know your availability.' },
];

export default function SendMessageSection({ subdomain, onBack }: SendMessageSectionProps) {
  const [step, setStep] = useState<'recipient' | 'compose' | 'preview'>('recipient');
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'student' | 'parent' | 'admin' | 'class' | 'class-parents'>('all');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const filteredRecipients = mockRecipients.filter(recipient => {
    const matchesSearch = recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        recipient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        recipient.class?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || recipient.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'parent': return <Users className="w-4 h-4" />;
      case 'admin': return <Building2 className="w-4 h-4" />;
      case 'class': return <GraduationCap className="w-4 h-4" />;
      case 'class-parents': return <Users className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case 'student': return 'Student';
      case 'parent': return 'Parent';
      case 'admin': return 'Admin';
      case 'class': return 'Class';
      case 'class-parents': return 'Class Parents';
      default: return 'Unknown';
    }
  };

  const handleRecipientToggle = (recipient: Recipient) => {
    setSelectedRecipients(prev => {
      const isSelected = prev.some(r => r.id === recipient.id);
      if (isSelected) {
        return prev.filter(r => r.id !== recipient.id);
      } else {
        return [...prev, { ...recipient, isSelected: true }];
      }
    });
  };

  const handleTemplateSelect = (template: typeof messageTemplates[0]) => {
    setMessageContent(template.content);
    setSelectedTemplate(template.id);
    setShowTemplates(false);
  };

  const handleSendMessage = async () => {
    setSendingMessage(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSendingMessage(false);
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      onBack();
    }, 2000);
  };

  const renderRecipientSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Recipients</h2>
        <p className="text-muted-foreground">Choose who you'd like to send a message to</p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search recipients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-primary/20 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'student', 'parent', 'admin', 'class', 'class-parents'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filterType === type
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white/50 text-foreground/70 border border-primary/20 hover:bg-primary/5'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}s
            </button>
          ))}
        </div>
      </div>

      {/* Recipients List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredRecipients.map(recipient => (
          <div
            key={recipient.id}
            onClick={() => handleRecipientToggle(recipient)}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedRecipients.some(r => r.id === recipient.id)
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-primary/20 bg-white/50 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  selectedRecipients.some(r => r.id === recipient.id)
                    ? 'bg-primary text-white'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {getRecipientIcon(recipient.type)}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{recipient.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      {getRecipientTypeLabel(recipient.type)}
                    </span>
                    {recipient.class && <span>{recipient.class}</span>}
                    {recipient.email && <span>• {recipient.email}</span>}
                  </div>
                </div>
              </div>
              {selectedRecipients.some(r => r.id === recipient.id) && (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Recipients Summary */}
      {selectedRecipients.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-foreground">Selected Recipients ({selectedRecipients.length})</span>
            <button
              onClick={() => setSelectedRecipients([])}
              className="text-sm text-primary hover:text-primary/80"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedRecipients.map(recipient => (
              <div
                key={recipient.id}
                className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-primary/20 text-sm"
              >
                <span>{recipient.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRecipientToggle(recipient);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-primary/20 rounded-lg text-foreground hover:bg-primary/5 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setStep('compose')}
          disabled={selectedRecipients.length === 0}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue ({selectedRecipients.length} selected)
        </button>
      </div>
    </div>
  );

  const renderComposeMessage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Compose Message</h2>
        <p className="text-muted-foreground">Write your message to {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Recipients Summary */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">Recipients ({selectedRecipients.length})</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedRecipients.map(r => r.name).join(', ')}
        </div>
      </div>

      {/* Message Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Message Templates</span>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
          >
            {showTemplates ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showTemplates ? 'Hide' : 'Show'} Templates
          </button>
        </div>
        
        {showTemplates && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {messageTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedTemplate === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-primary/20 bg-white/50 hover:border-primary/40'
                }`}
              >
                <div className="font-medium text-foreground mb-1">{template.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{template.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
          <input
            type="text"
            value={messageSubject}
            onChange={(e) => setMessageSubject(e.target.value)}
            placeholder="Enter message subject..."
            className="w-full px-4 py-3 border border-primary/20 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Message</label>
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Write your message here..."
            rows={8}
            className="w-full px-4 py-3 border border-primary/20 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={() => setStep('recipient')}
          className="px-6 py-3 border border-primary/20 rounded-lg text-foreground hover:bg-primary/5 transition-colors"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => setStep('preview')}
            disabled={!messageSubject.trim() || !messageContent.trim()}
            className="px-6 py-3 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Preview
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!messageSubject.trim() || !messageContent.trim() || sendingMessage}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {sendingMessage ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Preview Message</h2>
        <p className="text-muted-foreground">Review your message before sending</p>
      </div>

      <div className="bg-white border border-primary/20 rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-muted-foreground">To:</span>
            <div className="text-foreground mt-1">
              {selectedRecipients.map(r => r.name).join(', ')}
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-muted-foreground">Subject:</span>
            <div className="text-foreground font-semibold mt-1">{messageSubject}</div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-muted-foreground">Message:</span>
            <div className="text-foreground mt-2 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
              {messageContent}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={() => setStep('compose')}
          className="px-6 py-3 border border-primary/20 rounded-lg text-foreground hover:bg-primary/5 transition-colors"
        >
          Back to Edit
        </button>
        <button
          onClick={handleSendMessage}
          disabled={sendingMessage}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {sendingMessage ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Message
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (messageSent) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Message Sent Successfully!</h2>
          <p className="text-muted-foreground">Your message has been delivered to {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Return to Main Menu Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-primary/90 text-white font-semibold rounded-lg hover:bg-primary transition-all duration-300 shadow-lg"
        >
          <Home className="w-4 h-4" />
          Return to Main Menu
        </button>
      </div>
      
      {step === 'recipient' && renderRecipientSelection()}
      {step === 'compose' && renderComposeMessage()}
      {step === 'preview' && renderPreview()}
    </div>
  );
} 