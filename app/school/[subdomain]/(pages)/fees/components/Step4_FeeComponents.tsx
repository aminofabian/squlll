'use client'

import React, { useState, Fragment } from 'react';
import { Check, ChevronDown, Plus, X, Star, Info, Activity, BookOpen, Coins, Bus, Utensils, Calendar, Wrench, List, Home, Heart, TrendingUp, Shield, Eye, EyeOff, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFeeBuckets } from '@/lib/hooks/useFeeBuckets';
import { ExistingFeeBucketsSection } from './drawer/ExistingFeeBucketsSection';

interface Step4Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const Step4_FeeComponents: React.FC<Step4Props> = ({ formData, setFormData }) => {
  // State for editing fields
  const [currentEditingField, setCurrentEditingField] = useState<string | null>(null);
  const [editingBucket, setEditingBucket] = useState<any>(null);
  const [showEditBucketModal, setShowEditBucketModal] = useState<boolean>(false);
  const [showBucketCreationModal, setShowBucketCreationModal] = useState<boolean>(false);
  const [newBucketData, setNewBucketData] = useState<{name: string, description: string}>({name: '', description: ''});
  const [isCreatingBucket, setIsCreatingBucket] = useState<boolean>(false);
  const [selectedExistingBuckets, setSelectedExistingBuckets] = useState<string[]>([]);
  const [showExistingBuckets, setShowExistingBuckets] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [currentTermIndex, setCurrentTermIndex] = useState<number>(0); // Track the currently active term
  
  // Use the real useFeeBuckets hook instead of mock data
  const { feeBuckets, loading: bucketsLoading, error: bucketsError, refetch: refetchBuckets } = useFeeBuckets();
  
  // Default bucket structure for new buckets
  const defaultBucket = {
    type: 'tuition',
    name: '',
    description: '',
    isOptional: false,
    components: [
      {
        name: '',
        description: '',
        amount: '0',
        category: 'academic'
      }
    ]
  };
  
  // Functions for manipulating fee components
  const addComponent = (termIndex: number, bucketIndex: number) => {
    setFormData((prev: any) => ({
      ...prev,
      termStructures: prev.termStructures.map((term: any, tIndex: number) => 
        tIndex === termIndex 
          ? {
              ...term,
              buckets: term.buckets.map((bucket: any, bIndex: number) => 
                bIndex === bucketIndex 
                  ? { ...bucket, components: [...bucket.components, { name: '', description: '', amount: '0', category: 'academic' }] }
                  : bucket
              )
            }
          : term
      )
    }));
  };
  
  const removeComponent = (termIndex: number, bucketIndex: number, componentIndex: number) => {
    setFormData((prev: any) => ({
      ...prev,
      termStructures: prev.termStructures.map((term: any, i: number) => 
        i === termIndex 
          ? {
              ...term,
              buckets: term.buckets.map((bucket: any, j: number) => 
                j === bucketIndex 
                  ? { ...bucket, components: bucket.components.filter((_: any, k: number) => k !== componentIndex) }
                  : bucket
              )
            }
          : term
      )
    }));
  };
  
  const updateComponent = (termIndex: number, bucketIndex: number, componentIndex: number, field: keyof any, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      termStructures: prev.termStructures.map((term: any, i: number) => 
        i === termIndex 
          ? {
              ...term,
              buckets: term.buckets.map((bucket: any, j: number) => 
                j === bucketIndex 
                  ? {
                      ...bucket,
                      components: bucket.components.map((component: any, k: number) => 
                        k === componentIndex ? { ...component, [field]: value } : component
                      )
                    }
                  : bucket
              )
            }
          : term
      )
    }));
  };
  
  // Functions for manipulating buckets
  const addBucket = (termIndex: number) => {
    setFormData((prev: any) => ({
      ...prev,
      termStructures: prev.termStructures.map((term: any, i: number) => 
        i === termIndex 
          ? { ...term, buckets: [...term.buckets, { 
              type: 'tuition',
              name: 'New Bucket',
              description: 'Description',
              isOptional: false,
              components: [
                {
                  name: 'New Fee',
                  description: 'Description',
                  amount: '0',
                  category: 'academic'
                }
              ]
            }] }
          : term
      )
    }));
  };
  
  const deleteFormBucket = (termIndex: number, bucketIndex: number) => {
    setFormData((prev: any) => ({
      ...prev,
      termStructures: prev.termStructures.map((term: any, i: number) => 
        i === termIndex 
          ? { ...term, buckets: term.buckets.filter((_: any, j: number) => j !== bucketIndex) }
          : term
      )
    }));
  };
  
  const updateBucket = (termIndex: number, bucketIndex: number, field: keyof any, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      termStructures: prev.termStructures.map((term: any, i: number) => 
        i === termIndex 
          ? {
              ...term,
              buckets: term.buckets.map((bucket: any, j: number) => 
                j === bucketIndex ? { ...bucket, [field]: value } : bucket
              )
            }
          : term
      )
    }));
  };

  // Existing bucket amounts per term (one row per existing bucket)
  const getExistingBucketAmount = (termIndex: number, bucketId: string) => {
    const term = formData.termStructures[termIndex];
    return term?.existingBucketAmounts?.[bucketId] ?? '';
  };

  const setExistingBucketAmount = (termIndex: number, bucketId: string, value: string) => {
    setFormData((prev: any) => {
      const term = prev.termStructures[termIndex] || {};
      const existing = term.existingBucketAmounts || {};
      return {
        ...prev,
        termStructures: prev.termStructures.map((t: any, i: number) =>
          i === termIndex
            ? {
                ...t,
                existingBucketAmounts: {
                  ...existing,
                  [bucketId]: value,
                },
              }
            : t
        ),
      };
    });
  };

  // Functions for handling existing bucket selection
  const handleBucketSelect = (bucketId: string) => {
    setSelectedExistingBuckets(prev => 
      prev.includes(bucketId) 
        ? prev.filter(id => id !== bucketId)
        : [...prev, bucketId]
    );
  };

  const handleAddToAllTerms = () => {
    if (selectedExistingBuckets.length === 0) return;
    
    const selectedBuckets = feeBuckets.filter(bucket => 
      selectedExistingBuckets.includes(bucket.id)
    );

    setFormData((prev: any) => ({
      ...prev,
      termStructures: prev.termStructures.map((term: any) => ({
        ...term,
        buckets: [
          ...term.buckets,
          ...selectedBuckets.map(bucket => ({
            type: 'tuition',
            name: bucket.name,
            description: bucket.description,
            isOptional: false,
            components: (bucket as any).components || [
              {
                name: 'New Fee',
                description: 'Description',
                amount: '0',
                category: 'academic'
              }
            ]
          }))
        ]
      }))
    }));

    setSelectedExistingBuckets([]);
    setShowExistingBuckets(false);
  };

  const handleAddExistingBucket = (termIndex: number, bucketId: string) => {
    const bucket = feeBuckets.find(b => b.id === bucketId);
    if (!bucket) return;

    setFormData((prev: any) => ({
      ...prev,
      termStructures: prev.termStructures.map((term: any, i: number) => 
        i === termIndex 
          ? {
              ...term,
              buckets: [
                ...term.buckets,
                {
                  type: 'tuition',
                  name: bucket.name,
                  description: bucket.description,
                  isOptional: false,
                  components: (bucket as any).components || [
                    {
                      name: 'New Fee',
                      description: 'Description',
                      amount: '0',
                      category: 'academic'
                    }
                  ]
                }
              ]
            }
          : term
      )
    }));
  };

  const handleEditBucket = (bucketData: { id: string; name: string; description: string; isActive: boolean }) => {
    // This would open an edit modal for the bucket
    console.log('Edit bucket:', bucketData);
  };

  const handleDeleteBucket = (bucketId: string) => {
    // This would handle bucket deletion
    console.log('Delete bucket:', bucketId);
  };

  // Get currently used voteheads in the current term only
  const getUsedVoteheads = (currentTermIndex: number) => {
    const used = new Set<string>();
    const currentTerm = formData.termStructures[currentTermIndex];
    if (currentTerm) {
      currentTerm.buckets.forEach((bucket: any) => {
        bucket.components.forEach((component: any) => {
          if (component.name && component.name.trim()) {
            used.add(component.name.toLowerCase().trim());
          }
        });
      });
    }
    return used;
  };

  // Extract all unique voteheads from existing buckets (excluding already used ones in current term)
  const getAllVoteheads = (termIndex: number, excludeUsed = true) => {
    const voteheads = new Set<{name: string, description: string, amount: string, category: string}>();
    const usedVoteheads = excludeUsed ? getUsedVoteheads(termIndex) : new Set();
    
    feeBuckets.forEach(bucket => {
      if ((bucket as any).components) {
        (bucket as any).components.forEach((component: any) => {
          if (component.name && component.name.trim()) {
            const normalizedName = component.name.toLowerCase().trim();
            if (!usedVoteheads.has(normalizedName)) {
              voteheads.add({
                name: component.name,
                description: component.description || '',
                amount: component.amount || '0',
                category: component.category || 'academic'
              });
            }
          }
        });
      }
    });
    
    const result = Array.from(voteheads).sort((a, b) => a.name.localeCompare(b.name));
    
    // If no voteheads found, return some sample ones for demonstration
    if (result.length === 0) {
      const sampleVoteheads = [
        { name: 'Tuition Fees', description: 'Core academic instruction fees', amount: '15000', category: 'academic' },
        { name: 'Library Fees', description: 'Library and resource access', amount: '2000', category: 'academic' },
        { name: 'Computer Lab', description: 'Computer and technology access', amount: '1500', category: 'technology' },
        { name: 'Examination Fees', description: 'Internal examination costs', amount: '1000', category: 'assessment' },
        { name: 'Sports Fees', description: 'Sports and physical education', amount: '3000', category: 'sports' },
        { name: 'Transport Fees', description: 'School bus transportation', amount: '8000', category: 'transport' },
        { name: 'Meals', description: 'School meals and catering', amount: '5000', category: 'meals' },
        { name: 'Uniform', description: 'School uniform and supplies', amount: '4000', category: 'uniform' },
        { name: 'Stationery', description: 'Books and stationery supplies', amount: '2500', category: 'supplies' },
        { name: 'Medical', description: 'Medical and health services', amount: '1500', category: 'health' },
        { name: 'Development', description: 'School development fund', amount: '2000', category: 'development' },
        { name: 'Security', description: 'Security and safety services', amount: '1000', category: 'security' }
      ];
      
      // Filter out already used sample voteheads
      return sampleVoteheads.filter(votehead => 
        !usedVoteheads.has(votehead.name.toLowerCase().trim())
      );
    }
    
    return result;
  };

  // Track selected voteheads to remove them from available options
  const [selectedVoteheads, setSelectedVoteheads] = useState<Set<string>>(new Set());
  const [showSelectionForComponent, setShowSelectionForComponent] = useState<string | null>(null);
  const [voteheadSearch, setVoteheadSearch] = useState<string>('');

  // Auto-hide selection when user clicks outside
  React.useEffect(() => {
    // Initialize - when component loads, check all terms/buckets/components
    // to mark already used voteheads as selected
    const initialSelected = new Set<string>();
    formData.termStructures.forEach((term: any) => {
      term.buckets.forEach((bucket: any) => {
        bucket.components.forEach((component: any) => {
          if (component.name) {
            initialSelected.add(component.name.toLowerCase().trim());
          }
        });
      });
    });
    setSelectedVoteheads(initialSelected);
    
    // Add document click listener to close dropdown when clicking outside
    const handleOutsideClick = (e: MouseEvent) => {
      if (showSelectionForComponent) {
        // Check if click is outside selection area
        const selectionArea = document.querySelector(`[data-selection-id="${showSelectionForComponent}"]`);
        if (selectionArea && !selectionArea.contains(e.target as Node)) {
          setShowSelectionForComponent(null);
        }
      }
    };
    
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showSelectionForComponent]);

  // Direct button selection with immediate hiding after selection
  const selectVotehead = async (termIndex: number, bucketIndex: number, componentIndex: number, votehead: any) => {
    // First, create a persistent bucket in DB for this votehead
    let createdBucket: { id: string; name: string; description: string } | null = null;
    try {
      createdBucket = await createFeeBucket({
        name: votehead.name,
        description: votehead.description || ''
      });
      // Ensure newly created bucket appears in existing list
      await refetchBuckets();
    } catch (e) {
      // Non-blocking: proceed with local update even if creation fails
      createdBucket = null;
    }

    // Update current bucket with the created bucket (treat as existing)
    if (createdBucket) {
      updateBucket(termIndex, bucketIndex, 'id', createdBucket.id);
      updateBucket(termIndex, bucketIndex, 'name', createdBucket.name);
      updateBucket(termIndex, bucketIndex, 'description', createdBucket.description || '');
    } else {
      // Fallback: local-only selection
      updateBucket(termIndex, bucketIndex, 'name', votehead.name);
      updateBucket(termIndex, bucketIndex, 'description', votehead.description || '');
    }

    // Update the current component with the selected votehead
    updateComponent(termIndex, bucketIndex, componentIndex, 'name', votehead.name);
    updateComponent(termIndex, bucketIndex, componentIndex, 'description', votehead.description);
    updateComponent(termIndex, bucketIndex, componentIndex, 'amount', votehead.amount);
    updateComponent(termIndex, bucketIndex, componentIndex, 'category', votehead.category);
    
    // Mark this votehead as selected so it won't appear in future lists
    setSelectedVoteheads(prev => {
      const newSet = new Set(prev);
      newSet.add(votehead.name.toLowerCase().trim());
      return newSet;
    });
    
    // Hide the selection UI immediately after selection
    setShowSelectionForComponent(null);
    
    // Show a small toast or visual feedback for selection
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow-md text-sm z-50';
    toast.textContent = `✓ Added "${votehead.name}" - KES ${parseFloat(votehead.amount || '0').toLocaleString()}`;
    document.body.appendChild(toast);
    
    // Add a new component automatically after selection
    setTimeout(() => {
      // Add a new component to the same bucket
      addComponent(termIndex, bucketIndex);
      
      // Find the newly created component's input field and focus on it
      setTimeout(() => {
        // The new component will be the next one after the current
        const newComponentIndex = componentIndex + 1;
        const inputId = `component-name-${termIndex}-${bucketIndex}-${newComponentIndex}`;
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
          inputElement.focus();
        }
      }, 10); // Small delay to ensure DOM is updated
    }, 100); // Small delay for better UX
    
    // Remove toast after 1.5 seconds
    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => toast.remove(), 300);
    }, 1500);
  };
  
  // Function to get available voteheads, excluding those already selected
  const getAvailableVoteheads = (termIndex: number) => {
    const allVoteheads = Array.from(getAllVoteheads(termIndex));
    const filtered = allVoteheads.filter(votehead => 
      !selectedVoteheads.has(votehead.name.toLowerCase().trim())
    );
    if (!voteheadSearch.trim()) return filtered;
    const q = voteheadSearch.toLowerCase().trim();
    return filtered.filter(v => 
      v.name.toLowerCase().includes(q) ||
      (v.description || '').toLowerCase().includes(q)
    );
  };

  // Get category icon and color
  const getCategoryInfo = (category: string) => {
    const categoryMap: {[key: string]: {icon: any, color: string, bgColor: string}} = {
      academic: { icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      technology: { icon: Wrench, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      assessment: { icon: Activity, color: 'text-orange-600', bgColor: 'bg-orange-50' },
      sports: { icon: Activity, color: 'text-green-600', bgColor: 'bg-green-50' },
      transport: { icon: Bus, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
      meals: { icon: Utensils, color: 'text-red-600', bgColor: 'bg-red-50' },
      uniform: { icon: Home, color: 'text-pink-600', bgColor: 'bg-pink-50' },
      supplies: { icon: BookOpen, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      health: { icon: Heart, color: 'text-red-500', bgColor: 'bg-red-50' },
      development: { icon: TrendingUp, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
      security: { icon: Shield, color: 'text-gray-600', bgColor: 'bg-gray-50' }
    };
    return categoryMap[category] || { icon: Coins, color: 'text-slate-600', bgColor: 'bg-slate-50' };
  };

  // Group voteheads by category
  const getGroupedVoteheads = (termIndex: number) => {
    const voteheads = getAllVoteheads(termIndex);
    const grouped: {[key: string]: any[]} = {};
    
    voteheads.forEach(votehead => {
      const category = votehead.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(votehead);
    });
    
    return grouped;
  };

  // Get smart suggestions based on current context
  const getSmartSuggestions = (termIndex: number, bucketIndex: number) => {
    const currentTerm = formData.termStructures[termIndex];
    const currentBucket = currentTerm?.buckets[bucketIndex];
    const suggestions = [];
    
    // If this is the first component in a bucket, suggest common academic fees
    if (currentBucket?.components?.length <= 1) {
      suggestions.push('Tuition Fees', 'Library Fees', 'Examination Fees');
    }
    
    // If bucket name contains specific keywords, suggest related fees
    const bucketName = currentBucket?.name?.toLowerCase() || '';
    if (bucketName.includes('transport')) {
      suggestions.push('Transport Fees', 'Fuel Surcharge');
    } else if (bucketName.includes('meals')) {
      suggestions.push('Meals', 'Breakfast', 'Lunch', 'Snacks');
    } else if (bucketName.includes('sports')) {
      suggestions.push('Sports Fees', 'Equipment', 'Facilities');
    }
    
    return suggestions;
  };
  
  // Helper functions for calculations
  const calculateBucketTotal = (termIndex: number, bucketIndex: number) => {
    return formData.termStructures[termIndex]?.buckets[bucketIndex]?.components.reduce((sum: number, component: any) => 
      sum + (parseFloat(component.amount) || 0), 0) || 0;
  };
  
  const calculateTermTotal = (termIndex: number) => {
    const term = formData.termStructures[termIndex];
    if (!term) return 0;
    
    // Calculate total from form buckets (components)
    const formBucketsTotal = term.buckets.reduce((termTotal: number, bucket: any, bucketIndex: number) => {
      return termTotal + calculateBucketTotal(termIndex, bucketIndex);
    }, 0);
    
    // Calculate total from existing bucket amounts
    const existingBucketsTotal = Object.values(term.existingBucketAmounts || {}).reduce((sum: number, amount: any) => {
      return sum + (parseFloat(amount) || 0);
    }, 0);
    
    return formBucketsTotal + existingBucketsTotal;
  };
  
  const calculateGrandTotal = () => {
    return formData.termStructures.reduce((grandTotal: number, _: any, index: number) => {
      return grandTotal + calculateTermTotal(index);
    }, 0);
  };
  
  // Function to create a new fee bucket via GraphQL
  const createFeeBucket = async (bucketData: { name: string; description: string }) => {
    setIsCreatingBucket(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateFeeBucket($input: CreateFeeBucketInput!) {
              createFeeBucket(input: $input) {
                id
                name
                description
                isActive
                createdAt
              }
            }
          `,
          variables: {
            input: bucketData
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to create fee bucket');
      }

      showToast(`✅ Fee bucket "${bucketData.name}" created successfully!`, 'success');
      
      // Refresh buckets to show the newly created one
      await refetchBuckets();
      
      return result.data.createFeeBucket;
    } catch (error) {
      console.error('Error creating fee bucket:', error);
      showToast(`❌ Failed to create fee bucket: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    } finally {
      setIsCreatingBucket(false);
    }
  };

  // Function to add a bucket with GraphQL creation
  const addBucketWithAPI = async (termIndex: number, bucketName: string, bucketDescription: string) => {
    try {
      // Create the bucket via GraphQL
      const createdBucket = await createFeeBucket({
        name: bucketName,
        description: bucketDescription
      });

      // Add the bucket to the form data
      const newBucket = {
        ...defaultBucket,
        id: createdBucket.id,
        name: createdBucket.name,
        description: createdBucket.description,
      };

      setFormData((prev: any) => ({
        ...prev,
        termStructures: prev.termStructures.map((term: any, i: number) => 
          i === termIndex 
            ? { ...term, buckets: [...term.buckets, newBucket] }
            : term
        )
      }));
      
      return createdBucket;
    } catch (error) {
      // Error already handled in createFeeBucket function
      console.error('Failed to add bucket with API:', error);
      return null;
    }
  };
  
  // Function to delete a fee bucket
  const deleteFeeBucket = async (bucketId: string) => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation DeleteFeeBucket($id: ID!) {
              deleteFeeBucket(id: $id)
            }
          `,
          variables: {
            id: bucketId
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to delete fee bucket');
      }

      showToast(`✅ Fee bucket deleted successfully!`, 'success');
      refetchBuckets(); // Refresh the buckets list
    } catch (error) {
      console.error('Error deleting fee bucket:', error);
      showToast(`❌ Failed to delete fee bucket: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };
  
  // Function to display toast notifications
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // In a real implementation, this would show a UI toast notification
  };
  
  // Reset bucket selection when changing terms
  const handleTermChange = (newTermIndex: number) => {
    setCurrentTermIndex(newTermIndex);
    setSelectedExistingBuckets([]);
    setShowExistingBuckets(false); // Optionally hide the existing buckets panel
  };

  // Check if there's at least one term with at least one bucket
  const hasFeeComponents = formData.termStructures.some((term: any) => 
    term.buckets && term.buckets.length > 0 && term.buckets.some((bucket: any) => 
      bucket.components && bucket.components.length > 0
    )
  );
  
  // Preview component for fee structure
  const FeeStructurePreview = () => {
    // Debug: Log the formData to see what we're working with
    console.log('Preview formData:', JSON.stringify(formData, null, 2));
    console.log('Available feeBuckets:', feeBuckets);
    
    return (
      <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-md">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Table className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-primary">Fee Structure Preview</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewModalOpen(false)}
            className="h-8 w-8 p-1 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* PDF-like header section */}
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold mb-1">SCHOOL FEE STRUCTURE</h2>
          <p className="text-slate-600">{formData.academicYear || 'Current Academic Year'}</p>
        </div>

        {formData.termStructures && formData.termStructures.length > 0 ? (
          formData.termStructures.map((term: any, termIndex: number) => (
          <div 
            key={`preview-term-${termIndex}`} 
            className={`mb-10 pb-8 ${termIndex < formData.termStructures.length - 1 ? 'border-b-2 border-slate-200' : ''}`}
          >
            {/* Term header with clear distinction */}
            <div className="bg-primary/10 py-3 px-4 rounded-t-lg border border-primary/30 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-primary">{term.term?.toUpperCase() || 'UNNAMED TERM'}</h2>
              {term.dueDate && (
                <div className="ml-auto text-sm text-slate-600">
                  <span className="font-medium">Due Date:</span> {term.dueDate}
                </div>
              )}
            </div>
            
            {/* PDF-style table for all components in this term */}
            <div className="overflow-hidden border border-slate-200 rounded-lg mb-4">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="py-3 px-4 text-left font-bold text-slate-700 w-[50%]">Vote Head</th>
                    <th className="py-3 px-4 text-left font-bold text-slate-700 w-[35%]">Category</th>
                    <th className="py-3 px-4 text-right font-bold text-slate-700 w-[15%]">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Form buckets */}
                  {term.buckets.map((bucket: any, bucketIndex: number) => (
                    <React.Fragment key={`preview-bucket-${termIndex}-${bucketIndex}`}>
                      {/* Bucket header row */}
                      <tr className="bg-slate-50 border-t border-slate-200">
                        <td 
                          colSpan={3} 
                          className="py-2 px-4 font-semibold text-slate-800 flex justify-between items-center"
                        >
                          <div>{bucket.name}</div>
                          <Badge variant="outline" className={bucket.isOptional ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                            {bucket.isOptional ? 'Optional' : 'Required'}
                          </Badge>
                        </td>
                      </tr>
                      
                      {/* Component rows */}
                      {bucket.components.map((component: any, componentIndex: number) => {
                        const categoryInfo = getCategoryInfo(component.category || 'academic');
                        return component.name ? (
                          <tr 
                            key={`preview-component-${termIndex}-${bucketIndex}-${componentIndex}`} 
                            className={`border-t border-slate-100 ${componentIndex % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                          >
                            <td className="py-2.5 px-4">{component.name}</td>
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${categoryInfo.bgColor}`}></div>
                                <span className={`text-sm capitalize ${categoryInfo.color}`}>{component.category || 'academic'}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-right font-medium">
                              {parseFloat(component.amount || 0).toLocaleString()}
                            </td>
                          </tr>
                        ) : null;
                      })}
                      
                      {/* Bucket subtotal row */}
                      <tr className="border-t border-slate-200 bg-slate-50">
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4 font-medium text-right">Bucket Subtotal:</td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {(() => {
                            const total = bucket.components.reduce((sum: number, component: any) => 
                              sum + (parseFloat(component.amount) || 0), 0);
                            console.log(`Bucket "${bucket.name}" subtotal:`, total, 'Components:', bucket.components);
                            return total.toLocaleString();
                          })()}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                  
                  {/* Existing buckets */}
                  {feeBuckets.map((bucket) => {
                    const amount = getExistingBucketAmount(termIndex, bucket.id);
                    const numericAmount = parseFloat(amount);
                    console.log(`Existing bucket "${bucket.name}" (${bucket.id}) amount:`, amount, 'numeric:', numericAmount, 'for term', termIndex);
                    // Only skip if amount is empty string, undefined, null, or 0
                    if (!amount || amount === '' || isNaN(numericAmount) || numericAmount <= 0) {
                      console.log(`Skipping bucket "${bucket.name}" - no valid amount`);
                      return null;
                    }
                    
                    return (
                      <React.Fragment key={`preview-existing-bucket-${termIndex}-${bucket.id}`}>
                        {/* Existing bucket header row */}
                        <tr className="bg-blue-50 border-t border-blue-200">
                          <td 
                            colSpan={3} 
                            className="py-2 px-4 font-semibold text-blue-800 flex justify-between items-center"
                          >
                            <div>{bucket.name}</div>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                              Existing
                            </Badge>
                          </td>
                        </tr>
                        
                        {/* Existing bucket amount row */}
                        <tr className="border-t border-blue-100 bg-blue-50/50">
                          <td className="py-2.5 px-4">{bucket.description || 'Fee amount'}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-100"></div>
                              <span className="text-sm capitalize text-blue-600">existing</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right font-medium">
                            {parseFloat(amount).toLocaleString()}
                          </td>
                        </tr>
                        
                        {/* Existing bucket subtotal row */}
                        <tr className="border-t border-blue-200 bg-blue-50">
                          <td className="py-3 px-4"></td>
                          <td className="py-3 px-4 font-medium text-right">Bucket Subtotal:</td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {parseFloat(amount).toLocaleString()}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                  
                  {/* Term total row - stands out */}
                  <tr className="border-t-2 border-primary/30 bg-primary/5">
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4 font-bold text-right text-primary">TERM TOTAL:</td>
                    <td className="py-3 px-4 text-right font-bold text-primary">
                      {calculateTermTotal(termIndex).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Term-specific payment info */}
            {(term.earlyPaymentDiscount || term.latePaymentFee) && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <div className="font-medium mb-2 text-blue-800">Payment Information:</div>
                <ul className="space-y-1 text-blue-700">
                  {term.earlyPaymentDiscount && parseFloat(term.earlyPaymentDiscount) > 0 && (
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Early payment discount: <strong>{term.earlyPaymentDiscount}%</strong> if paid by {term.earlyPaymentDeadline || 'deadline'}</span>
                    </li>
                  )}
                  {term.latePaymentFee && parseFloat(term.latePaymentFee) > 0 && (
                    <li className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                      <span>Late payment fee: <strong>{term.latePaymentFee}%</strong> after due date</span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Coins className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Fee Structure Data</h3>
            <p className="text-slate-500 mb-4">
              No terms or fee components have been added yet.
            </p>
            <div className="text-sm text-slate-400">
              <p>Add terms and fee buckets in the form above to see the preview.</p>
            </div>
          </div>
        )}
        
        {/* Grand total section - only show if we have data */}
        {formData.termStructures && formData.termStructures.length > 0 && (
          <div className="mt-8 p-5 bg-primary/10 border-2 border-primary/30 rounded-lg flex justify-between items-center">
            <div className="text-slate-800 font-bold text-lg">GRAND TOTAL:</div>
            <div className="text-2xl font-bold text-primary bg-white px-6 py-3 rounded-md border border-primary/30 shadow-sm">
              {(() => {
                const grandTotal = calculateGrandTotal();
                console.log('Grand Total:', grandTotal);
                return `KES ${grandTotal.toLocaleString()}`;
              })()}
            </div>
          </div>
        )}
        
        {/* Footer note */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>This is a preview of how the fee structure will appear in official documents.</p>
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      <div className="animate-in fade-in duration-300">
      {/* Review preview removed from Step 4; it will show in Step 5 */}
      
      {/* Introduction section */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="mt-1 bg-white p-2 rounded-full shadow-sm border border-blue-200">
            <Coins className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-800">Fee Components</h4>
            <p className="text-sm text-blue-700 mt-1">
              Add fee buckets and components for each term:
            </p>
            <ul className="text-xs text-blue-600 mt-3 space-y-2 list-none pl-0">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">1</span>
                </div>
                <span><strong className="text-blue-700">Fee Buckets</strong> - Group related fees (e.g., Tuition, Transport)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">2</span>
                </div>
                <span><strong className="text-blue-700">Fee Components</strong> - Individual line items within buckets</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">3</span>
                </div>
                <span><strong className="text-blue-700">Optional Fees</strong> - Mark buckets as optional if needed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Term Selector */}
      <div className="mb-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h5 className="text-sm font-semibold text-slate-700">Active Term</h5>
          </div>
          <div className="text-xs text-slate-500">
            Select a term to manage its fee buckets and components
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          {formData.termStructures.map((term: any, index: number) => (
            <Button
              key={`term-selector-${index}`}
              variant={currentTermIndex === index ? "default" : "outline"}
              size="sm"
              onClick={() => handleTermChange(index)}
              className={`transition-all ${currentTermIndex === index 
                ? 'bg-primary text-white shadow-md' 
                : 'hover:bg-primary/10 border-primary/30 text-primary'}`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {term.term}
            </Button>
          ))}
        </div>
      </div>

      {/* Buckets info section */}
      <div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-blue-200">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm border border-blue-200">
              <Coins className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-blue-800">Fee Buckets Management</h5>
              <p className="text-xs text-blue-700 mt-1">
                Create or select fee buckets to organize your fee structure components for {formData.termStructures[currentTermIndex]?.term || 'this term'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-white border-t border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 p-3 rounded-lg border border-primary/20 transition-all duration-200 cursor-pointer group" onClick={() => setShowBucketCreationModal(true)}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full shadow-sm border border-primary/20 group-hover:shadow-md group-hover:border-primary/30 transition-all duration-200">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h6 className="font-medium text-sm text-primary">Create New Fee Bucket</h6>
                  <p className="text-xs text-primary/70 mt-0.5">Define a custom bucket with your own components</p>
                </div>
              </div>
            </div>
            
            {!bucketsLoading && feeBuckets.length > 0 && (
              <div 
                className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-3 rounded-lg border border-blue-200 transition-all duration-200 cursor-pointer group"
                onClick={() => setShowExistingBuckets(!showExistingBuckets)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full shadow-sm border border-blue-300 group-hover:shadow-md group-hover:border-blue-400 transition-all duration-200">
                    <Coins className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h6 className="font-medium text-sm text-blue-800">Choose from Existing <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">{feeBuckets.length}</span></h6>
                    <p className="text-xs text-blue-700 mt-0.5">Select from previously created fee buckets</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {bucketsLoading && (
            <div className="text-center py-2 text-sm text-slate-500">
              <span className="inline-block animate-spin mr-1">⟳</span> Loading buckets...
            </div>
          )}
        </div>
      </div>

      {/* Existing Buckets Selection */}
      {showExistingBuckets && (
        <div className="relative">
          <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full shadow-sm border border-blue-200">
                <Coins className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-800">Choose from Existing Buckets</h4>
                <p className="text-xs text-blue-600 mt-0.5">Select buckets to add to your fee structure</p>
              </div>
              <Badge variant="outline" className="ml-1 text-xs bg-blue-100 text-blue-700 border-blue-300">
                {feeBuckets.length} available
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExistingBuckets(false)}
              className="h-7 w-7 p-0 hover:bg-blue-100 text-blue-600 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ExistingFeeBucketsSection
            feeBuckets={feeBuckets}
            bucketsLoading={bucketsLoading}
            bucketsError={bucketsError}
            selectedExistingBuckets={selectedExistingBuckets}
            onBucketSelect={handleBucketSelect}
            onAddToAllTerms={handleAddToAllTerms}
            onRefetchBuckets={refetchBuckets}
            onAddExistingBucket={handleAddExistingBucket}
            onEditBucket={handleEditBucket}
            onDeleteBucket={handleDeleteBucket}
            termStructures={formData.termStructures}
            currentTermIndex={currentTermIndex}
          />
        </div>
      )}
      
      {/* Fee components configuration */}
      <div className="mt-6 space-y-6 bg-white p-4 rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {formData.termStructures.length === 0 ? (
          <div className="text-center py-8">
            <Coins className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">Please add at least one term in the previous step before configuring fees.</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-4"
              onClick={() => {
                // Add a default term structure
                setFormData((prev: any) => ({
                  ...prev,
                  termStructures: [...prev.termStructures, {
                    term: 'Term 1',
                    academicYear: prev.academicYear || '',
                    dueDate: '',
                    latePaymentFee: '0',
                    earlyPaymentDiscount: '0',
                    earlyPaymentDeadline: '',
                    buckets: []
                  }]
                }));
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Term
            </Button>
          </div>
        ) : !hasFeeComponents ? (
          <div className="text-center py-8">
            <Coins className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">No fee components added yet. Add your first component below.</p>
            <div className="flex flex-col items-center mt-6 gap-3">
              {/* Primary actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowBucketCreationModal(true)}
                  className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Fee Bucket
                </Button>
                
                {!bucketsLoading && feeBuckets.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowExistingBuckets(true)}
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Choose from Existing ({feeBuckets.length})
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-slate-500 mb-2 mt-4">Or add to specific term:</p>
              
              <div className="flex justify-center gap-3 flex-wrap">
                {formData.termStructures.map((term: any, termIndex: number) => (
                  <Button 
                    key={termIndex}
                    variant="outline" 
                    size="sm"
                    onClick={() => addBucket(termIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to {term.term}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {/* Fee components table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-separate border-spacing-0 border border-primary/30 rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/15 to-primary/10">
                    <th className="border border-primary/30 p-4 text-left font-bold">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Term</span>
                      </div>
                    </th>
                    <th className="border border-primary/30 p-4 text-left font-bold">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <Coins className="h-4 w-4 text-primary" />
                          <span>Vote Head</span>
                        </div>
                        {formData.termStructures.length > 0 && getAllVoteheads(0).length > 0 && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-2">
                            {getAllVoteheads(0).length} available
                          </Badge>
                        )}
                        <div className="text-xs text-slate-500 font-normal ml-1">
                          <span className="bg-blue-50 px-1 py-0.5 rounded text-blue-700">▼</span> to choose
                        </div>
                      </div>
                    </th>
                    <th className="border border-primary/30 p-4 text-right font-bold">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Amount (KES)</span>
                      </div>
                    </th>
                    <th className="border border-primary/30 p-4 text-center font-bold w-24">
                      <div className="flex items-center justify-center">
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.termStructures.map((term: any, termIndex: number) => {
                    // Process all buckets and components for this term
                    return [
                      // Add spacing row before terms (except the first term)
                      termIndex > 0 && (
                        <tr key={`term-spacing-${termIndex}`} className="h-8 bg-slate-50/70 border-b border-slate-100">
                          <td colSpan={4} className="border-0"></td>
                        </tr>
                      ),
                      
                      // Show all existing buckets for this term (one per row, amount only)
                      feeBuckets.map((bucket) => (
                        <tr key={`term-${termIndex}-existing-${bucket.id}`} className="hover:bg-primary/5">
                          <td className="border border-primary/30 p-3">
                            {/** empty cell for Term column except first row spacing handled above */}
                          </td>
                          <td className="border border-primary/30 p-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-slate-800">{bucket.name}</div>
                              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                Existing
                              </Badge>
                            </div>
                            {bucket.description ? (
                              <div className="text-[10px] text-slate-500 mt-0.5">{bucket.description}</div>
                            ) : null}
                          </td>
                          <td className="border border-primary/30 p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-[10px] text-slate-500">KES</span>
                              <input
                                type="number"
                                className="w-32 bg-white border border-slate-200 rounded px-2 py-1 text-right focus:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary/30"
                                value={getExistingBucketAmount(termIndex, bucket.id)}
                                onChange={(e) => setExistingBucketAmount(termIndex, bucket.id, e.target.value)}
                                placeholder="0.00"
                                min="0"
                              />
                            </div>
                          </td>
                          <td className="border border-primary/30 p-3 text-center">
                            <div className="text-[10px] text-slate-400">—</div>
                          </td>
                        </tr>
                      )),

                      // Process all components in all buckets of this term
                      ...term.buckets.flatMap((bucket: any, bucketIndex: number) => 
                        bucket.components.map((component: any, componentIndex: number) => {
                          const isFirstInBucket = componentIndex === 0;
                          const isFirstInTerm = bucketIndex === 0 && componentIndex === 0;
                          
                          return (
                            <tr 
                              key={`${termIndex}-${bucketIndex}-${componentIndex}`}
                              className={`
                                hover:bg-primary/5
                                ${isFirstInTerm ? 'bg-primary/5' : ''}
                                ${isFirstInBucket && !isFirstInTerm ? 'border-t border-primary/10' : ''}
                              `}
                            >
                              <td className="border border-primary/30 p-3">
                                {componentIndex === 0 && bucketIndex === 0 ? (
                                  <div className="flex items-center justify-center">
                                    <Badge className="bg-primary/10 text-primary border-primary/30 px-3 py-1.5 text-sm">
                                      <Calendar className="h-3.5 w-3.5 mr-1.5 inline-block" />
                                      {term.term}
                                    </Badge>
                                  </div>
                                ) : (
                                  <div className="h-6"></div>
                                )}
                              </td>
                              <td className="border border-primary/30 p-3">
                                <div>
                                  {/* Input field and selection control */}
                                  <div className="flex gap-2 items-center">
                                    <input
                                      id={`component-name-${termIndex}-${bucketIndex}-${componentIndex}`}
                                      className="w-full bg-transparent border rounded border-slate-200 focus:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary/30 px-2 py-1"
                                      value={component.name}
                                      onChange={(e) => updateComponent(termIndex, bucketIndex, componentIndex, 'name', e.target.value)}
                                      placeholder="Enter fee name or select from list"
                                      onFocus={() => setShowSelectionForComponent(`${termIndex}-${bucketIndex}-${componentIndex}`)}
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2 shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent the click from bubbling up
                                        const componentKey = `${termIndex}-${bucketIndex}-${componentIndex}`;
                                        setShowSelectionForComponent(prev => prev === componentKey ? null : componentKey);
                                      }}
                                    >
                                      {showSelectionForComponent === `${termIndex}-${bucketIndex}-${componentIndex}` ? 
                                        <X className="h-3.5 w-3.5" /> : 
                                        <List className="h-3.5 w-3.5" />
                                      }
                                    </Button>
                                  </div>
                              
                              {/* Selected bucket preview */}
                              {component.name && (
                                <div className="mt-1.5 p-1.5 bg-slate-50 rounded-md border border-slate-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <div className={`shrink-0 w-1.5 h-4 ${getCategoryInfo(component.category || 'academic').bgColor} rounded-sm`}></div>
                                      <div>
                                        <div className="text-xs font-medium">{component.name}</div>
                                        <div className="text-[10px] text-slate-500">{component.description || 'No description'}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="px-1.5 py-0.5 rounded bg-green-50 text-[10px] font-medium text-green-700 border border-green-100 flex items-center gap-0.5">
                                        <Check className="h-2.5 w-2.5" />
                                        <span>Selected</span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 text-slate-400 hover:text-red-400 hover:bg-red-50 rounded-full"
                                        onClick={() => {
                                          // Clear this component's data
                                          updateComponent(termIndex, bucketIndex, componentIndex, 'name', '');
                                          updateComponent(termIndex, bucketIndex, componentIndex, 'description', '');
                                          updateComponent(termIndex, bucketIndex, componentIndex, 'amount', '0');
                                          updateComponent(termIndex, bucketIndex, componentIndex, 'category', 'academic');
                                          
                                          // Remove from selected voteheads list if it was there
                                          setSelectedVoteheads(prev => {
                                            const newSet = new Set(prev);
                                            newSet.delete(component.name.toLowerCase().trim());
                                            return newSet;
                                          });
                                        }}
                                        title="Clear selection"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Direct button selection UI - only shown when active */}
                              {showSelectionForComponent === `${termIndex}-${bucketIndex}-${componentIndex}` && (
                                <div 
                                  className="mt-2 border-t pt-2" 
                                  data-selection-id={`${termIndex}-${bucketIndex}-${componentIndex}`}
                                >
                                  {getAvailableVoteheads(termIndex).length === 0 ? (
                                    <div className="text-center py-2">
                                      <p className="text-xs text-slate-500">No voteheads available</p>
                                    </div>
                                  ) : (
                                    <div>
                                      {/* Header with search */}
                                      <div className="flex items-center justify-between mb-2 gap-2">
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <Star className="h-3.5 w-3.5 text-primary" />
                                          <span className="text-xs font-medium text-slate-700">Select votehead</span>
                                        </div>
                                        <div className="flex items-center gap-2 grow">
                                          <input
                                            type="text"
                                            value={voteheadSearch}
                                            onChange={(e) => setVoteheadSearch(e.target.value)}
                                            placeholder="Search voteheads..."
                                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                                          />
                                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 shrink-0">
                                            {getAvailableVoteheads(termIndex).length}
                                          </Badge>
                                        </div>
                                      </div>
                                      
                                      {/* Smart suggestions row (if available) */}
                                      {getSmartSuggestions(termIndex, bucketIndex).filter(suggestion => 
                                        !selectedVoteheads.has(suggestion.toLowerCase().trim())
                                      ).length > 0 && (
                                        <div className="mb-3">
                                          <div className="flex items-center gap-1 mb-1">
                                            <Star className="h-3 w-3 text-yellow-500" />
                                            <span className="text-[10px] uppercase tracking-wide text-slate-500">Suggestions</span>
                                          </div>
                                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                            {getSmartSuggestions(termIndex, bucketIndex)
                                              .filter(suggestion => !selectedVoteheads.has(suggestion.toLowerCase().trim()))
                                              .map((suggestion, index) => (
                                                <Button
                                                  key={`suggestion-${index}`}
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => selectVotehead(
                                                    termIndex, 
                                                    bucketIndex, 
                                                    componentIndex, 
                                                    {
                                                      name: suggestion,
                                                      description: '',
                                                      amount: '0',
                                                      category: 'academic'
                                                    }
                                                  )}
                                                  className="h-7 py-0 px-2 text-xs bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100 justify-start w-full overflow-hidden"
                                                >
                                                  <span className="truncate">{suggestion}</span>
                                                </Button>
                                              ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Simple responsive grid of all voteheads */}
                                      <div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                          {getAvailableVoteheads(termIndex).map((votehead, index) => {
                                            const categoryInfo = getCategoryInfo(votehead.category || 'academic');
                                            
                                            return (
                                              <Button
                                                key={`votehead-${index}`}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => selectVotehead(termIndex, bucketIndex, componentIndex, votehead)}
                                                className="h-auto py-1 px-2 text-xs text-left justify-start border hover:bg-slate-50 w-full"
                                              >
                                                <div className="flex items-center gap-1 w-full overflow-hidden">
                                                  <div className={`shrink-0 w-1.5 h-6 ${categoryInfo.bgColor} rounded-sm`}></div>
                                                  <div className="overflow-hidden">
                                                    <div className="font-medium truncate">{votehead.name}</div>
                                                    <div className="text-slate-500 text-[10px]">
                                                      KES {parseFloat(votehead.amount || '0').toLocaleString()}
                                                    </div>
                                                  </div>
                                                </div>
                                              </Button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      
                                      {/* Show all button for many voteheads */}
                                      {Array.from(getAllVoteheads(termIndex)).length > 12 && (
                                        <div className="mt-1 text-center">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs h-7 text-slate-600 w-full border border-dashed border-slate-200 mt-1"
                                            onClick={() => {
                                              // View all implementation moved out to keep component clean
                                              alert('View all voteheads functionality will be implemented in a cleaner way.');
                                            }}
                                          >
                                            View All Voteheads ({Array.from(getAllVoteheads(termIndex)).length})
                                          </Button>
                                        </div>
                                      )}

                                    </div>
                                  )}
                                </div>
                              )}
                                
                              </div>
                              </td>
                              <td className="border border-primary/30 p-3 text-right">
                                <input
                                  id={`component-amount-${termIndex}-${bucketIndex}-${componentIndex}`}
                                  type="number"
                                  className="w-full bg-transparent border-0 text-right focus:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary/30 px-2 py-1"
                                  value={component.amount}
                                  onChange={(e) => updateComponent(termIndex, bucketIndex, componentIndex, 'amount', e.target.value)}
                                  placeholder="0.00"
                                />
                              </td>
                              <td className="border border-primary/30 p-3 text-center">
                                <div className="flex justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-red-50"
                                    onClick={() => removeComponent(termIndex, bucketIndex, componentIndex)}
                                  >
                                    <X className="h-3 w-3 text-red-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-primary/10"
                                    onClick={() => {
                                      // Add a new component to this bucket
                                      addComponent(termIndex, bucketIndex);
                                    }}
                                  >
                                    <Plus className="h-3 w-3 text-primary" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            
                        );
                      })
                    )
                  ];
                  })}
                  {/* Spacer before the totals row */}
                  <tr className="h-6 bg-slate-50/70">
                    <td colSpan={4} className="border-0"></td>
                  </tr>
                  
                  {/* Totals row with enhanced styling */}
                  <tr className="bg-gradient-to-r from-primary/10 to-primary/5 border-t-2 border-primary/20">
                    <td className="border border-primary/30 p-6 text-center" colSpan={2}>
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-xs text-primary/70 font-semibold">Add New Buckets to Terms:</div>
                        <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                          {formData.termStructures.map((term: any, termIndex: number) => (
                            <Button 
                              key={termIndex}
                              variant="outline" 
                              size="sm"
                              className="bg-white hover:bg-primary/10 border-primary/30 hover:border-primary/50 transition-colors duration-200 shadow-sm"
                              onClick={() => addBucket(termIndex)}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1.5" />
                              Add to {term.term}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="border border-primary/30 p-6 text-right font-bold">
                      <div className="text-xs text-primary/70 mb-2">GRAND TOTAL</div>
                      <div className="text-lg bg-white py-2 px-4 rounded-md shadow-sm inline-block border border-primary/20">
                        KES {calculateGrandTotal().toLocaleString('en', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </div>
                    </td>
                    <td className="border border-primary/30"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Bucket Creation Modal */}
      <Dialog open={showBucketCreationModal} onOpenChange={setShowBucketCreationModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-primary/10 rounded-full">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              Create New Fee Bucket
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-2 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-xs text-blue-700">
                Fee buckets help organize related components. Once created, they'll be available for any fee structure.
              </p>
            </div>
          </div>
          
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="bucket-name" className="text-sm font-medium">Bucket Name <span className="text-red-500">*</span></Label>
              <Input 
                id="bucket-name" 
                value={newBucketData.name} 
                onChange={(e) => setNewBucketData({...newBucketData, name: e.target.value})} 
                className=""
                placeholder="e.g. Tuition, Transport, Boarding"
              />
              <p className="text-xs text-slate-500">Choose a clear, descriptive name for this bucket</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bucket-description" className="text-sm font-medium">Description</Label>
              <Input 
                id="bucket-description" 
                value={newBucketData.description} 
                onChange={(e) => setNewBucketData({...newBucketData, description: e.target.value})} 
                className=""
                placeholder="Short description of this fee bucket"
              />
              <p className="text-xs text-slate-500">Add details about what this bucket contains</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 border border-blue-200 rounded-lg bg-blue-50 cursor-pointer hover:bg-blue-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Academic</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">Tuition, library, exam fees</p>
              </div>
              <div className="p-3 border border-indigo-200 rounded-lg bg-indigo-50 cursor-pointer hover:bg-indigo-100">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">Transport</span>
                </div>
                <p className="text-xs text-indigo-600 mt-1">School bus, transport fees</p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4 flex justify-between items-center">
            <div className="text-xs text-slate-500">
              {newBucketData.name.trim() ? '✓ Ready to create' : 'Enter bucket name to continue'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowBucketCreationModal(false)}>Cancel</Button>
              <Button 
                onClick={async () => {
                  if (newBucketData.name.trim()) {
                    // First create the bucket in the database
                    const createdBucket = await createFeeBucket({
                      name: newBucketData.name.trim(),
                      description: newBucketData.description.trim()
                    });
                    
                    if (createdBucket) {
                      // If we have terms, add this bucket to the first term as well
                      if (formData.termStructures.length > 0) {
                        const termIndex = 0;
                        const newBucket = {
                          ...defaultBucket,
                          id: createdBucket.id,
                          name: createdBucket.name,
                          description: createdBucket.description,
                        };
                        
                        setFormData((prev: any) => ({
                          ...prev,
                          termStructures: prev.termStructures.map((term: any, i: number) => 
                            i === termIndex 
                              ? { ...term, buckets: [...term.buckets, newBucket] }
                              : term
                          )
                        }));
                      }
                      
                      setNewBucketData({ name: '', description: '' });
                      setShowBucketCreationModal(false);
                    }
                  }
                }}
                disabled={isCreatingBucket || !newBucketData.name.trim()}
                className={!newBucketData.name.trim() ? 'opacity-50' : ''}
              >
                {isCreatingBucket ? 'Creating...' : 'Create Bucket'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <FeeStructurePreview />
        </DialogContent>
      </Dialog>
    </div>
    </Fragment>
  );
};
