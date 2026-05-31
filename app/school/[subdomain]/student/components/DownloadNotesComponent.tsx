"use client"

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft,
  Download,
  Search,
  Filter,
  FileText,
  BookOpen,
  Calendar,
  User,
  Eye,
  Clock,
  Star,
  BookMarked,
  FileDown,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Info,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Book,
  GraduationCap,
  FolderOpen,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  Presentation,
  FileText as FilePdf,
  FileText as FileWord,
  Presentation as FilePowerpoint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudentNotes } from '@/lib/student/useStudentNotes';
import type { StudentNoteItem, StudentNoteFileType } from '@/lib/student/types';

interface DownloadNotesComponentProps {
  subdomain: string;
  onBack: () => void;
}

export default function DownloadNotesComponent({ subdomain, onBack }: DownloadNotesComponentProps) {
  const { notes: fetchedNotes, subjects, loading, error, refetch } = useStudentNotes(subdomain);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [filteredNotes, setFilteredNotes] = useState<StudentNoteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const notes = fetchedNotes.map((note) => ({
    ...note,
    isFavorite: favoriteIds.has(note.id),
  }));

  const getFileIcon = (fileType: StudentNoteFileType) => {
    switch (fileType) {
      case 'pdf':
        return <FilePdf className="w-5 h-5 text-red-500" />;
      case 'docx':
        return <FileWord className="w-5 h-5 text-blue-500" />;
      case 'pptx':
        return <FilePowerpoint className="w-5 h-5 text-orange-500" />;
      case 'xlsx':
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case 'jpg':
      case 'png':
        return <FileImage className="w-5 h-5 text-purple-500" />;
      case 'mp4':
        return <FileVideo className="w-5 h-5 text-red-600" />;
      case 'mp3':
        return <FileAudio className="w-5 h-5 text-blue-600" />;
      case 'zip':
        return <FileArchive className="w-5 h-5 text-yellow-600" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleDownload = (note: StudentNoteItem) => {
    if (note.links.length > 0) {
      window.open(note.links[0], '_blank', 'noopener,noreferrer');
      return;
    }
    alert(note.description.slice(0, 2000));
  };

  const handleToggleFavorite = (noteId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) next.delete(noteId);
      else next.add(noteId);
      return next;
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSubjectFilter = (subject: string) => {
    setSelectedSubject(subject);
  };

  const handleSort = (sortField: string) => {
    if (sortBy === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(sortField);
      setSortOrder("desc");
    }
  };

  // Filter and sort notes
  useEffect(() => {
    let filtered = notes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Subject filter
    if (selectedSubject !== "All Subjects") {
      filtered = filtered.filter(note => note.subject === selectedSubject);
    }

    // Favorites filter
    if (favoritesOnly) {
      filtered = filtered.filter(note => note.isFavorite);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "date":
          aValue = new Date(a.uploadDate);
          bValue = new Date(b.uploadDate);
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "subject":
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
          break;
        case "downloads":
          aValue = a.downloadCount;
          bValue = b.downloadCount;
          break;
        case "size":
          aValue = parseFloat(a.fileSize);
          bValue = parseFloat(b.fileSize);
          break;
        default:
          aValue = new Date(a.uploadDate);
          bValue = new Date(b.uploadDate);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredNotes(filtered);
  }, [notes, searchTerm, selectedSubject, sortBy, sortOrder, favoritesOnly]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 hover:bg-primary/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold">Download Notes</h2>
        </div>
        <Card className="border-destructive/20">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => void refetch()}>Try again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderGridItem = (note: StudentNoteItem) => (
    <Card key={note.id} className="group hover:shadow-lg transition-all duration-200 border-primary/20 hover:border-primary/40">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getFileIcon(note.fileType)}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {note.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{note.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleToggleFavorite(note.id)}
              className={`p-1 rounded-full transition-colors ${
                note.isFavorite 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-muted-foreground hover:text-yellow-500'
              }`}
            >
              <Star className="w-4 h-4" fill={note.isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {note.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>{note.fileSize}</span>
          <span>{note.downloadCount} downloads</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {note.grade}
          </Badge>
          {note.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{note.teacher}</span>
          </div>
          <Button
            size="sm"
            onClick={() => handleDownload(note)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderListItem = (note: StudentNoteItem) => (
    <Card key={note.id} className="group hover:shadow-md transition-all duration-200 border-primary/20 hover:border-primary/40">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              {getFileIcon(note.fileType)}
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {note.title}
                </h3>
                <p className="text-sm text-muted-foreground">{note.subject} • {note.teacher}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{note.fileSize}</span>
              <span>{note.downloadCount} downloads</span>
              <span>{note.uploadDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {note.grade}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleFavorite(note.id)}
              className={`p-1 rounded-full transition-colors ${
                note.isFavorite 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-muted-foreground hover:text-yellow-500'
              }`}
            >
              <Star className="w-4 h-4" fill={note.isFavorite ? "currentColor" : "none"} />
            </button>
            <Button
              size="sm"
              onClick={() => handleDownload(note)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center rounded-xl shadow-lg">
            <BookOpen className="w-6 h-6 text-primary-foreground text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Download Notes
            </h1>
            <p className="text-sm text-muted-foreground/90 font-medium">
              Access and download your course materials
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/50 rounded-full border border-primary/10 shadow-sm">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground/80">
            {filteredNotes.length} notes available
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notes by title, subject, or tags..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            <Select value={selectedSubject} onValueChange={handleSubjectFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-card border border-primary/20 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="favoritesOnly"
                  checked={favoritesOnly}
                  onChange={(e) => setFavoritesOnly(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="favoritesOnly" className="text-sm">
                  Favorites only
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-1"
                >
                  Date
                  {sortBy === "date" && (
                    sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("downloads")}
                  className="flex items-center gap-1"
                >
                  Downloads
                  {sortBy === "downloads" && (
                    sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes Grid/List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">No notes found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-2"
          }>
            {filteredNotes.map(note => 
              viewMode === "grid" ? renderGridItem(note) : renderListItem(note)
            )}
          </div>
        )}
      </div>
    </div>
  );
} 