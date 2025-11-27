'use client'

import React, { useState, Fragment } from 'react';
import { Check, Plus, X, Coins, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFeeBuckets } from '@/lib/hooks/useFeeBuckets';

interface Step4Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const Step4_FeeComponentsSimplified: React.FC<Step4Props> = ({ formData, setFormData }) => {
  const [currentTermIndex, setCurrentTermIndex] = useState<number>(0);
  const [showBucketModal, setShowBucketModal] = useState<boolean>(false);
  const [newBucketName, setNewBucketName] = useState<string>('');
  const [newBucketDescription, setNewBucketDescription] = useState<string>('');
  const [isCreatingBucket, setIsCreatingBucket] = useState<boolean>(false);
  
  const { feeBuckets, loading: bucketsLoading, error: bucketsError, refetch: refetchBuckets } = useFeeBuckets();
  
  // Get existing bucket amount for a term
  const getExistingBucketAmount = (termIndex: number, bucketId: string) => {
    const term = formData.termStructures[termIndex];
    return term?.existingBucketAmounts?.[bucketId] ?? '';
  };

  // Set existing bucket amount for a term
  const setExistingBucketAmount = (termIndex: number, bucketId: string, value: string) => {
    setFormData((prev: any) => {
      const term = prev.termStructures[termIndex] || {};
      const existing = term.existingBucketAmounts || {};
      return {
        ...prev,
        termStructures: prev.termStructures.map((t: any, i: number) =>
          i === termIndex
            ? { ...t, existingBucketAmounts: { ...existing, [bucketId]: value } }
            : t
        ),
      };
    });
  };

  // Calculate totals
  const calculateTermTotal = (termIndex: number) => {
    const term = formData.termStructures[termIndex];
    if (!term) return 0;
    
    return Object.values(term.existingBucketAmounts || {}).reduce((sum: number, amount: any) => 
      sum + (parseFloat(amount) || 0), 0);
  };
  
  const calculateGrandTotal = () => {
    return formData.termStructures.reduce((total: number, _: any, index: number) => 
      total + calculateTermTotal(index), 0);
  };

  // Create fee bucket
  const createFeeBucket = async (bucketData: { name: string; description: string }) => {
    setIsCreatingBucket(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation CreateFeeBucket($input: CreateFeeBucketInput!) {
              createFeeBucket(input: $input) {
                id name description isActive createdAt
              }
            }
          `,
          variables: { input: bucketData }
        }),
      });

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0]?.message);
      
      await refetchBuckets();
      return result.data.createFeeBucket;
    } finally {
      setIsCreatingBucket(false);
    }
  };

  // Handle bucket creation
  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) return;
    
    try {
      await createFeeBucket({
        name: newBucketName.trim(),
        description: newBucketDescription.trim()
      });
      
      setNewBucketName('');
      setNewBucketDescription('');
      setShowBucketModal(false);
    } catch (error) {
      console.error('Failed to create bucket:', error);
    }
  };

  return (
    <Fragment>
      <div className="space-y-6">
        
        {/* Clean Header */}
        <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary rounded-lg">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Fee Components</h3>
                <p className="text-slate-600">
                  Set fee amounts for each term by selecting fee buckets below
                </p>
              </div>
            </div>
            <Button onClick={() => setShowBucketModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Bucket
            </Button>
          </div>
        </div>

        {/* Term Tabs */}
        {formData.termStructures?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {formData.termStructures.map((term: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentTermIndex(index)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-lg border-2 font-medium transition-all
                  ${currentTermIndex === index 
                    ? 'bg-primary text-white border-primary shadow-md scale-105' 
                    : 'bg-white border-slate-200 hover:border-primary/40'}
                `}
              >
                <Calendar className="h-4 w-4" />
                {term.term}
                {calculateTermTotal(index) > 0 && (
                  <Badge className="ml-2 bg-white/20">
                    {calculateTermTotal(index).toLocaleString()}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main Content */}
        {formData.termStructures?.length > 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            
            {/* Term Summary Bar */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg">{formData.termStructures[currentTermIndex]?.term}</h4>
                <p className="text-sm text-slate-600">{feeBuckets.length} fee buckets available</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600 mb-1">Term Total</div>
                <div className="text-3xl font-bold text-primary">
                  {calculateTermTotal(currentTermIndex).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Fee Buckets */}
            <div>
              {bucketsLoading ? (
                <div className="p-16 text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                  <p className="text-slate-600 mt-4">Loading...</p>
                </div>
              ) : feeBuckets.length === 0 ? (
                <div className="p-16 text-center">
                  <Coins className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No Fee Buckets</h4>
                  <p className="text-slate-600 mb-6">Create your first fee bucket</p>
                  <Button onClick={() => setShowBucketModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Fee Bucket
                  </Button>
                </div>
              ) : (
                feeBuckets.map((bucket, idx) => {
                  const amount = getExistingBucketAmount(currentTermIndex, bucket.id);
                  const hasAmount = amount && parseFloat(amount) > 0;
                  
                  return (
                    <div 
                      key={bucket.id} 
                      className={`
                        group px-6 py-5 border-b last:border-b-0 transition-all
                        ${hasAmount ? 'bg-primary/5' : 'hover:bg-slate-50'}
                      `}
                    >
                      <div className="flex items-center gap-6">
                        {/* Bucket Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-slate-900">{bucket.name}</h5>
                            {hasAmount && (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" />
                                Added
                              </Badge>
                            )}
                          </div>
                          {bucket.description && (
                            <p className="text-sm text-slate-600">{bucket.description}</p>
                          )}
                        </div>

                        {/* Amount Input */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-white rounded-lg border-2 border-slate-200 px-4 py-2">
                            <span className="text-sm font-medium text-slate-600">KES</span>
                            <Input
                              type="number"
                              value={amount}
                              onChange={(e) => setExistingBucketAmount(currentTermIndex, bucket.id, e.target.value)}
                              placeholder="0.00"
                              className="w-28 border-0 p-0 text-right text-lg font-semibold focus-visible:ring-0"
                            />
                          </div>
                          {hasAmount && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setExistingBucketAmount(currentTermIndex, bucket.id, '')}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Add at least one term in Step 3 before configuring fees.
            </AlertDescription>
          </Alert>
        )}

        {/* Grand Total */}
        {calculateGrandTotal() > 0 && (
          <div className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl p-8 shadow-xl">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-white/80 text-sm mb-2">ANNUAL TOTAL</div>
                <div className="text-5xl font-bold">
                  {calculateGrandTotal().toLocaleString()}
                </div>
                <div className="text-white/70 text-sm mt-2">
                  Across {formData.termStructures.length} term{formData.termStructures.length > 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-right text-white/80 text-sm">
                <div>KES Currency</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Create Modal */}
      <Dialog open={showBucketModal} onOpenChange={setShowBucketModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Fee Bucket</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Name *</Label>
              <Input 
                value={newBucketName} 
                onChange={(e) => setNewBucketName(e.target.value)} 
                placeholder="e.g. Tuition, Transport"
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <Input 
                value={newBucketDescription} 
                onChange={(e) => setNewBucketDescription(e.target.value)} 
                placeholder="Optional"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBucketModal(false)}>Cancel</Button>
            <Button onClick={handleCreateBucket} disabled={!newBucketName.trim() || isCreatingBucket}>
              {isCreatingBucket ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

