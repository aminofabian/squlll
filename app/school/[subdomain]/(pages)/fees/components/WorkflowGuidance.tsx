'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, ArrowRight, Sparkles, Target, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkflowStep {
  id: string
  title: string
  description: string
  completed: boolean
  icon?: React.ReactNode
}

interface WorkflowGuidanceProps {
  currentStep?: number
  onStepClick?: (step: number) => void
  completedSteps?: number[]
}

const defaultSteps: WorkflowStep[] = [
  {
    id: '1',
    title: 'Create Fee Structure',
    description: 'Set up fee structures for different grades and terms',
    completed: false,
    icon: <Sparkles className="h-5 w-5" />
  },
  {
    id: '2',
    title: 'Assign to Grades',
    description: 'Link fee structures to specific grade levels',
    completed: false,
    icon: <Target className="h-5 w-5" />
  },
  {
    id: '3',
    title: 'Generate Invoices',
    description: 'Create invoices for students based on fee structures',
    completed: false,
    icon: <Zap className="h-5 w-5" />
  },
  {
    id: '4',
    title: 'Track Payments',
    description: 'Monitor payment status and outstanding balances',
    completed: false,
    icon: <CheckCircle2 className="h-5 w-5" />
  }
]

export const WorkflowGuidance = ({
  currentStep = 0,
  onStepClick,
  completedSteps = []
}: WorkflowGuidanceProps) => {
  const steps = defaultSteps.map((step, index) => ({
    ...step,
    completed: completedSteps.includes(index) || index < currentStep,
    current: index === currentStep
  }))

  const progress = (completedSteps.length / steps.length) * 100

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-white via-primary/5 to-primary/10 shadow-lg overflow-hidden">
      <CardHeader className="relative pb-2">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100 rounded-t-lg overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-primary">Fee Structure Setup Guide</span>
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              Follow these steps to set up and manage your fee structures effectively
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{completedSteps.length}/{steps.length}</div>
            <div className="text-xs text-slate-500 font-medium">Steps Complete</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "group relative overflow-hidden rounded-xl transition-all duration-300 transform",
                step.completed && "hover:scale-102",
                !step.completed && onStepClick && "cursor-pointer hover:scale-105 hover:shadow-md"
              )}
              onClick={() => !step.completed && onStepClick?.(index)}
            >
              <div
                className={cn(
                  "p-5 border-2 rounded-xl transition-all duration-300",
                  step.current && "bg-primary/10 border-primary shadow-lg ring-2 ring-primary/20",
                  step.completed && "bg-gradient-to-br from-primary/5 to-primary-light/5 border-primary/30",
                  !step.completed && !step.current && "bg-white border-slate-200 hover:border-primary/40"
                )}
              >
                {/* Status Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-lg transition-all duration-300",
                    step.completed && "bg-primary text-white shadow-md",
                    step.current && "bg-primary/20 text-primary animate-pulse",
                    !step.completed && !step.current && "bg-slate-100 text-slate-400"
                  )}>
                    {step.completed ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      step.icon || <Circle className="h-6 w-6" />
                    )}
                  </div>
                  {step.current && (
                    <span className="text-xs px-3 py-1 bg-primary text-white rounded-full font-semibold shadow-sm animate-pulse">
                      In Progress
                    </span>
                  )}
                  {step.completed && (
                    <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full font-semibold">
                      ✓ Done
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={cn(
                    "font-bold text-base mb-2 transition-colors",
                    step.current && "text-primary",
                    step.completed && "text-primary-dark",
                    !step.completed && !step.current && "text-slate-700"
                  )}>
                    Step {index + 1}: {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Hover Effect */}
                {!step.completed && onStepClick && (
                  <div className="mt-3 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-semibold">Start this step</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}

                {/* Connection Line - Only show between steps */}
                {index < steps.length - 1 && index % 2 === 0 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-slate-300 to-transparent" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Completion Message */}
        {completedSteps.length === steps.length && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary-light/10 border-2 border-primary/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-primary">Congratulations! 🎉</h4>
                <p className="text-sm text-slate-600">You've completed all fee structure setup steps!</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
