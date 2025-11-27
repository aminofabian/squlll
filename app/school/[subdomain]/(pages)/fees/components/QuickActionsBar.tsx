import { Plus, FileText, Coins, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuickActionsBarProps {
    onCreateStructure?: () => void
    onGenerateInvoices?: () => void
    onRecordPayment?: () => void
    onSettings?: () => void
    variant?: 'structures' | 'invoices'
}

export const QuickActionsBar = ({
    onCreateStructure,
    onGenerateInvoices,
    onRecordPayment,
    onSettings,
    variant = 'structures'
}: QuickActionsBarProps) => {
    if (variant === 'structures') {
        return (
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
                        <p className="text-sm text-slate-600 mt-1">Common tasks for fee structure management</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={onCreateStructure}
                        className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                                <Plus className="h-6 w-6" />
                            </div>
                            <h4 className="font-bold text-lg mb-1">Create Fee Structure</h4>
                            <p className="text-sm text-blue-100">Set up new fee structure for grades</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>

                    <button
                        onClick={onGenerateInvoices}
                        className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h4 className="font-bold text-lg mb-1">Generate Invoices</h4>
                            <p className="text-sm text-emerald-100">Create invoices from structures</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>

                    <button
                        onClick={onSettings}
                        className="group relative overflow-hidden bg-gradient-to-br from-slate-500 to-slate-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                                <SettingsIcon className="h-6 w-6" />
                            </div>
                            <h4 className="font-bold text-lg mb-1">Manage Settings</h4>
                            <p className="text-sm text-slate-100">Configure fee parameters</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                </div>
            </div>
        )
    }

    // Invoice variant
    return (
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
                    <p className="text-sm text-slate-600 mt-1">Common tasks for invoice and payment management</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={onRecordPayment}
                    className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    <div className="relative z-10">
                        <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                            <Coins className="h-6 w-6" />
                        </div>
                        <h4 className="font-bold text-lg mb-1">Record Payment</h4>
                        <p className="text-sm text-emerald-100">Log a student payment</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                <button
                    onClick={onGenerateInvoices}
                    className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    <div className="relative z-10">
                        <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h4 className="font-bold text-lg mb-1">Generate Invoices</h4>
                        <p className="text-sm text-blue-100">Create new student invoices</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
            </div>
        </div>
    )
}
