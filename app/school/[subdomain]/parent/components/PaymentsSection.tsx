'use client'

import React, { useState } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Calendar,
  Download,
  Eye,
  Plus,
  Minus,
  ArrowRight,
  Shield,
  Gift,
  Award,
  Target,
  PieChart,
  BarChart3,
  Receipt,
  FileText,
  Zap,
  Sparkles,
  Star,
  Crown,
  Trophy,
  Coins,
  PiggyBank,
  CreditCard as CreditCardIcon,
  Building,
  Users,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Truck,
  Utensils,
  Shirt,
  BookOpen,
  Filter,
  User,
  ChevronDown as ChevronDownIcon,
  X,
  Upload,
  Check,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';

interface Payment {
  id: number;
  studentId: number;
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  category: 'tuition' | 'transport' | 'meals' | 'activities' | 'uniform' | 'books';
  paymentMethod?: string;
  paidAmount?: number;
  remainingAmount?: number;
}

interface PaymentArrangement {
  id: number;
  studentId: number;
  type: 'installment' | 'scholarship' | 'discount' | 'waiver';
  title: string;
  description: string;
  amount: number;
  status: 'active' | 'pending' | 'expired';
  startDate: string;
  endDate: string;
  installments?: number;
  currentInstallment?: number;
}

interface PaymentStats {
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  discountAmount: number;
  nextPayment: number;
  nextDueDate: string;
}

interface Child {
  id: number;
  name: string;
  grade: string;
  class: string;
  avatar: string;
  attendance: number;
  currentGPA: number;
  behavior: string;
}

interface PaymentsSectionProps {
  children: Child[];
  selectedChild: number;
}

export const PaymentsSection = ({ children, selectedChild }: PaymentsSectionProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filterByStudent, setFilterByStudent] = useState<number | 'all'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    studentId: '',
    paymentMethod: '',
    description: '',
    receipt: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock payment data with student IDs
  const payments: Payment[] = [
    {
      id: 1,
      studentId: 1,
      title: 'Tuition Fee - Q2 2024',
      amount: 25000,
      dueDate: '2024-07-15',
      status: 'pending',
      category: 'tuition',
      remainingAmount: 25000
    },
    {
      id: 2,
      studentId: 1,
      title: 'Transportation Fee',
      amount: 3000,
      dueDate: '2024-07-10',
      status: 'overdue',
      category: 'transport',
      remainingAmount: 3000
    },
    {
      id: 3,
      studentId: 1,
      title: 'School Meals - July',
      amount: 1500,
      dueDate: '2024-07-20',
      status: 'partial',
      category: 'meals',
      paidAmount: 750,
      remainingAmount: 750
    },
    {
      id: 4,
      studentId: 2,
      title: 'Tuition Fee - Q2 2024',
      amount: 22000,
      dueDate: '2024-07-15',
      status: 'pending',
      category: 'tuition',
      remainingAmount: 22000
    },
    {
      id: 5,
      studentId: 2,
      title: 'Sports Activities Fee',
      amount: 2000,
      dueDate: '2024-08-05',
      status: 'pending',
      category: 'activities',
      remainingAmount: 2000
    },
    {
      id: 6,
      studentId: 1,
      title: 'School Uniform',
      amount: 1200,
      dueDate: '2024-06-30',
      status: 'paid',
      category: 'uniform',
      paidAmount: 1200,
      remainingAmount: 0
    },
    {
      id: 7,
      studentId: 2,
      title: 'Transportation Fee',
      amount: 2500,
      dueDate: '2024-07-10',
      status: 'overdue',
      category: 'transport',
      remainingAmount: 2500
    },
    {
      id: 8,
      studentId: 2,
      title: 'School Meals - July',
      amount: 1200,
      dueDate: '2024-07-20',
      status: 'partial',
      category: 'meals',
      paidAmount: 600,
      remainingAmount: 600
    }
  ];

  const paymentArrangements: PaymentArrangement[] = [
    {
      id: 1,
      studentId: 1,
      type: 'installment',
      title: 'Quarterly Installment Plan',
      description: 'Spread tuition fees across 4 quarterly payments',
      amount: 25000,
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      installments: 4,
      currentInstallment: 2
    },
    {
      id: 2,
      studentId: 1,
      type: 'scholarship',
      title: 'Academic Excellence Scholarship',
      description: '20% discount for maintaining A+ average',
      amount: 5000,
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    },
    {
      id: 3,
      studentId: 2,
      type: 'discount',
      title: 'Sibling Discount',
      description: '10% discount for multiple children',
      amount: 2500,
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }
  ];

  // Filter payments by selected student
  const filteredPayments = filterByStudent === 'all' 
    ? payments 
    : payments.filter(payment => payment.studentId === filterByStudent);

  // Filter arrangements by selected student
  const filteredArrangements = filterByStudent === 'all'
    ? paymentArrangements
    : paymentArrangements.filter(arrangement => arrangement.studentId === filterByStudent);

  // Calculate stats for filtered data
  const calculateStats = (payments: Payment[], arrangements: PaymentArrangement[]) => {
    const totalFees = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const paidAmount = payments
      .filter(payment => payment.status === 'paid')
      .reduce((sum, payment) => sum + (payment.paidAmount || 0), 0);
    const pendingAmount = payments
      .filter(payment => payment.status === 'pending')
      .reduce((sum, payment) => sum + (payment.remainingAmount || 0), 0);
    const overdueAmount = payments
      .filter(payment => payment.status === 'overdue')
      .reduce((sum, payment) => sum + (payment.remainingAmount || 0), 0);
    const discountAmount = arrangements
      .filter(arrangement => arrangement.status === 'active')
      .reduce((sum, arrangement) => sum + arrangement.amount, 0);
    
    const nextPayment = payments
      .filter(payment => payment.status === 'pending')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.remainingAmount || 0;
    const nextDueDate = payments
      .filter(payment => payment.status === 'pending')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate || '';

    return {
      totalFees,
      paidAmount,
      pendingAmount,
      overdueAmount,
      discountAmount,
      nextPayment,
      nextDueDate
    };
  };

  const paymentStats = calculateStats(filteredPayments, filteredArrangements);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tuition': return <Building className="w-4 h-4" />;
      case 'transport': return <Truck className="w-4 h-4" />;
      case 'meals': return <Utensils className="w-4 h-4" />;
      case 'activities': return <Trophy className="w-4 h-4" />;
      case 'uniform': return <Shirt className="w-4 h-4" />;
      case 'books': return <BookOpen className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-primary bg-primary/10 border-primary/20';
      case 'pending': return 'text-primary bg-primary/10 border-primary/20';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'partial': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'pending': return <Clock className="w-4 h-4 text-primary" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'partial': return <Minus className="w-4 h-4 text-primary" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const calculateProgress = (paid: number, total: number) => {
    return Math.round((paid / total) * 100);
  };

  const getStudentName = (studentId: number) => {
    return children.find(child => child.id === studentId)?.name || 'Unknown Student';
  };

  const handlePaymentFormChange = (field: string, value: string | File | null) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handlePaymentFormChange('receipt', file);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!paymentForm.amount || !paymentForm.studentId || !paymentForm.paymentMethod) {
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    // Simulate payment processing
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setShowPaymentModal(false);
    setPaymentForm({
      amount: '',
      studentId: '',
      paymentMethod: '',
      description: '',
      receipt: null
    });
    setUploadProgress(0);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: '',
      studentId: '',
      paymentMethod: '',
      description: '',
      receipt: null
    });
    setUploadProgress(0);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-8 border-2 border-primary/20 shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black mb-2 text-slate-800">Financial Dashboard</h1>
              <p className="text-slate-600 font-medium">Manage your children's school payments</p>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="text-sm font-bold text-primary">SECURE PAYMENTS</span>
            </div>
          </div>
          
          {/* Student Filter Buttons */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-slate-700 font-medium">Select Student:</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* All Students Button */}
              <button
                onClick={() => setFilterByStudent('all')}
                className={`flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                  filterByStudent === 'all'
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-primary/20 text-slate-700 hover:bg-primary/5 hover:scale-105'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  filterByStudent === 'all' ? 'bg-white' : 'bg-primary'
                }`}>
                  <Users className={`w-5 h-5 ${filterByStudent === 'all' ? 'text-primary' : 'text-white'}`} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">All Students</div>
                  <div className="text-xs opacity-75">View all payments</div>
                </div>
              </button>
              
              {/* Individual Student Buttons */}
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setFilterByStudent(child.id)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                    filterByStudent === child.id
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'bg-white border-2 border-primary/20 text-slate-700 hover:bg-primary/5 hover:scale-105'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    filterByStudent === child.id ? 'bg-white' : 'bg-primary'
                  }`}>
                    {child.avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">{child.name}</div>
                    <div className="text-xs opacity-75">{child.grade} - {child.class}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Payment Action Button */}
          <div className="mb-6">
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="w-full bg-primary text-white border-2 border-primary rounded-2xl p-6 hover:bg-primary/90 hover:scale-105 transition-all duration-300 group cursor-pointer shadow-xl"
            >
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-white mb-1">Make Payment</p>
                  <p className="text-white/90 font-medium">Secure online payment processing</p>
                </div>
                <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Fees</p>
                  <p className="text-2xl font-black text-slate-800">{formatCurrency(paymentStats.totalFees)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Paid Amount</p>
                  <p className="text-2xl font-black text-slate-800">{formatCurrency(paymentStats.paidAmount)}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-black text-slate-800">{formatCurrency(paymentStats.pendingAmount)}</p>
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Overview Cards */}
      <div className="grid grid-cols-4 gap-6">
        {/* Total Outstanding */}
        <div className="bg-white rounded-2xl p-6 border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
              URGENT
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Outstanding</h3>
          <p className="text-3xl font-black text-primary mb-2">
            {formatCurrency(paymentStats.pendingAmount + paymentStats.overdueAmount)}
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress(paymentStats.paidAmount, paymentStats.totalFees)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-primary">
              {calculateProgress(paymentStats.paidAmount, paymentStats.totalFees)}%
            </span>
          </div>
        </div>

        {/* Next Payment */}
        <div className="bg-white rounded-2xl p-6 border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
              DUE SOON
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Next Payment</h3>
          <p className="text-3xl font-black text-primary mb-2">
            {formatCurrency(paymentStats.nextPayment)}
          </p>
          <p className="text-sm text-slate-600 font-medium">
            Due: {paymentStats.nextDueDate ? new Date(paymentStats.nextDueDate).toLocaleDateString() : 'No pending payments'}
          </p>
        </div>

        {/* Discounts & Arrangements */}
        <div className="bg-white rounded-2xl p-6 border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
              SAVINGS
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Total Savings</h3>
          <p className="text-3xl font-black text-primary mb-2">
            {formatCurrency(paymentStats.discountAmount)}
          </p>
          <p className="text-sm text-slate-600 font-medium">
            {filteredArrangements.length} active arrangements
          </p>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-6 border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
              SECURE
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Payment Methods</h3>
          <p className="text-2xl font-black text-primary mb-2">3 Active</p>
          <p className="text-sm text-slate-600 font-medium">
            Credit Card • Bank Transfer • Cash
          </p>
        </div>
      </div>

      {/* Payment Arrangements */}
      <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-xl">
        <div className="p-6 border-b-2 border-primary/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 flex items-center">
              <Award className="w-7 h-7 mr-3 text-primary" />
              Payment Arrangements
            </h2>
            <button className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Arrangement</span>
              </div>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArrangements.map((arrangement) => (
              <div key={arrangement.id} className="bg-white rounded-2xl p-6 border-2 border-primary/20 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    {arrangement.type === 'installment' ? <Calendar className="w-5 h-5 text-white" /> :
                     arrangement.type === 'scholarship' ? <Star className="w-5 h-5 text-white" /> :
                     arrangement.type === 'discount' ? <Gift className="w-5 h-5 text-white" /> :
                     <Award className="w-5 h-5 text-white" />}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    arrangement.status === 'active' ? 'bg-primary/10 text-primary' :
                    arrangement.status === 'pending' ? 'bg-primary/10 text-primary' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {arrangement.status.toUpperCase()}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 text-lg mb-2">{arrangement.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{arrangement.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Student:</span>
                    <span className="font-bold text-slate-800">{getStudentName(arrangement.studentId)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(arrangement.amount)}</span>
                  </div>
                  {arrangement.installments && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Installments:</span>
                      <span className="font-bold text-slate-800">
                        {arrangement.currentInstallment}/{arrangement.installments}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Valid until:</span>
                    <span className="font-bold text-slate-800">
                      {new Date(arrangement.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-xl">
        <div className="p-6 border-b-2 border-primary/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 flex items-center">
              <Receipt className="w-7 h-7 mr-3 text-primary" />
              Payment Details
            </h2>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all duration-300 group cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </div>
              </button>
              <button 
                onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>History</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-2xl p-6 border-2 border-primary/20 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                   onClick={() => setSelectedPayment(payment)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                      {getCategoryIcon(payment.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">
                        {payment.title}
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Due: {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-slate-400 text-xs">
                        Student: {getStudentName(payment.studentId)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-800">
                        {formatCurrency(payment.remainingAmount || payment.amount)}
                      </p>
                      {payment.paidAmount && (
                        <p className="text-sm text-primary font-medium">
                          Paid: {formatCurrency(payment.paidAmount)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6">
        <button className="bg-white border-2 border-primary/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer">
          <div className="flex items-center justify-center space-x-3">
            <FileText className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform" />
            <div className="text-left">
              <p className="font-bold text-lg text-slate-800">Download Invoice</p>
              <p className="text-slate-600 text-sm">Get detailed receipts</p>
            </div>
          </div>
        </button>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">Make Payment</h2>
                    <p className="text-slate-600">Complete your school payment securely</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    resetPaymentForm();
                  }}
                  className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Payment Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">
                    KES
                  </span>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => handlePaymentFormChange('amount', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-16 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-primary focus:outline-none text-lg font-bold"
                  />
                </div>
              </div>

              {/* Student Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Select Student *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handlePaymentFormChange('studentId', child.id.toString())}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        paymentForm.studentId === child.id.toString()
                          ? 'border-primary bg-primary/10'
                          : 'border-slate-200 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-lg">
                          {child.avatar}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-slate-800">{child.name}</div>
                          <div className="text-sm text-slate-600">{child.grade} - {child.class}</div>
                        </div>
                        {paymentForm.studentId === child.id.toString() && (
                          <Check className="w-5 h-5 text-primary ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Payment Method *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'credit_card', name: 'Credit Card', icon: CreditCard, color: 'bg-primary' },
                    { id: 'bank_transfer', name: 'Bank Transfer', icon: Banknote, color: 'bg-primary' },
                    { id: 'cash', name: 'Cash', icon: Wallet, color: 'bg-primary' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentFormChange('paymentMethod', method.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        paymentForm.paymentMethod === method.id
                          ? 'border-primary bg-primary/10'
                          : 'border-slate-200 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${method.color} rounded-xl flex items-center justify-center`}>
                          <method.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-slate-800">{method.name}</div>
                        </div>
                        {paymentForm.paymentMethod === method.id && (
                          <Check className="w-5 h-5 text-primary ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Payment Description (Optional)
                </label>
                <textarea
                  value={paymentForm.description}
                  onChange={(e) => handlePaymentFormChange('description', e.target.value)}
                  placeholder="e.g., Tuition fee for Q2 2024, Transportation fee..."
                  className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-primary focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Upload Receipt (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
                        {paymentForm.receipt ? (
                          <Check className="w-8 h-8 text-primary" />
                        ) : (
                          <Upload className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {paymentForm.receipt ? paymentForm.receipt.name : 'Click to upload receipt'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {paymentForm.receipt ? 'File uploaded successfully' : 'PNG, JPG, PDF up to 10MB'}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Progress Bar */}
              {isSubmitting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Processing Payment...</span>
                    <span className="text-sm font-bold text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-primary">Secure Payment</span>
                </div>
                <p className="text-sm text-slate-700 mt-1">
                  Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-3xl">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    resetPaymentForm();
                  }}
                  className="px-6 py-3 text-slate-600 font-bold hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={!paymentForm.amount || !paymentForm.studentId || !paymentForm.paymentMethod || isSubmitting}
                  className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                    !paymentForm.amount || !paymentForm.studentId || !paymentForm.paymentMethod || isSubmitting
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90 hover:scale-105'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Complete Payment</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 