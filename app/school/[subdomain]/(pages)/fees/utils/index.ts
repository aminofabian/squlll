import { 
  Coins,
  FileText,
  Calendar,
  Users,
  CheckCircle
} from "lucide-react"

// Constants
export const feeTypes = ['tuition', 'transport', 'hostel', 'exam', 'library', 'sports', 'lab']
export const paymentStatuses = ['paid', 'pending', 'overdue', 'partial']
export const classes = ['Form 1', 'Form 2', 'Form 3', 'Form 4']
export const sections = ['A', 'B', 'C']

// Utility functions
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
    case 'pending': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
    case 'overdue': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
    case 'partial': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
    default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
  }
}

export const getFeeTypeIcon = (type: string) => {
  switch (type) {
    case 'tuition': return FileText
    case 'transport': return Calendar
    case 'hostel': return Users
    case 'exam': return CheckCircle
    default: return Coins
  }
}

export const getInstallmentStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800 border-green-200'
    case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
    case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getPlanStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'defaulted': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(amount)
}
