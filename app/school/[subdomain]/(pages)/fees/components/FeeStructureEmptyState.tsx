'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Sparkles, ArrowRight, Zap } from 'lucide-react'

interface FeeStructureEmptyStateProps {
    onCreateNew: () => void
    onViewSample?: () => void
}

export const FeeStructureEmptyState = ({ onCreateNew, onViewSample }: FeeStructureEmptyStateProps) => {
    return (
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-white via-primary/5 to-primary/10 overflow-hidden">
            <div className="relative p-12 text-center">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-light/5 rounded-full blur-3xl -z-10" />

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 mb-6 relative">
                    <FileText className="h-10 w-10 text-primary" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-primary mb-3">
                    No Fee Structures Yet
                </h3>
                <p className="text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
                    Get started by creating your first fee structure. Define fees for different grades,
                    terms, and boarding types to streamline your fee management.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        onClick={onCreateNew}
                        size="lg"
                        className="bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                    >
                        <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        Create Your First Fee Structure
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>

                    {onViewSample && (
                        <Button
                            onClick={onViewSample}
                            variant="outline"
                            size="lg"
                            className="border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            View Sample Structure
                        </Button>
                    )}
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
                    <div className="p-4 bg-white shadow-sm border-2 border-primary/10">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-3 mx-auto">
                            <span className="text-xl">📝</span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 mb-1">Easy Setup</h4>
                        <p className="text-xs text-primary/70">Simple wizard to create fee structures in minutes</p>
                    </div>

                    <div className="p-4 bg-white shadow-sm border-2 border-primary/10">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-3 mx-auto">
                            <span className="text-xl">🎯</span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 mb-1">Flexible</h4>
                        <p className="text-xs text-primary/70">Customize fees for different grades and terms</p>
                    </div>

                    <div className="p-4 bg-white shadow-sm border-2 border-primary/10">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-3 mx-auto">
                            <span className="text-xl">⚡</span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 mb-1">Automated</h4>
                        <p className="text-xs text-primary/70">Generate invoices automatically from structures</p>
                    </div>
                </div>
            </div>
        </Card>
    )
}
