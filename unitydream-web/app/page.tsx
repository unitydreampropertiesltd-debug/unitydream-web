'use client';

import React, { useState, useEffect, useMemo } from 'react';

// ===================== ১. টাইপ ডেফিনিশন ও হায়ারার্কি =====================
type UserRole = 
  | 'Super Admin'
  | 'Chairman'
  | 'Managing Director'
  | 'General Manager'
  | 'DGM'
  | 'AGM'
  | 'Team Leader'
  | 'Business Partner'
  | 'Agent'
  | 'Customer'
  | 'Accounts Head'
  | 'Accountant';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  'Super Admin': 100,
  'Chairman': 95,
  'Managing Director': 90,
  'General Manager': 70,
  'DGM': 60,
  'AGM': 50,
  'Team Leader': 40,
  'Business Partner': 30,
  'Agent': 20,
  'Customer': 10,
  'Accounts Head': 65,
  'Accountant': 45
};

interface PartnerSaleRecord {
  id: string;
  projectName: string;
  unitOrPlot: string;
  areaKathaOrSqFt: string;
  customerName: string;
  customerPhone: string;
  salePrice: number;
  commissionEarned: number;
  commissionPaid: number;
  commissionStatus: 'Paid' | 'Held' | 'Pending';
  saleDate: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  parentId?: string;
  salesKatha: number;
  totalEarnings: number;
  heldEarnings: number;
  teamSalesKatha: number;
  teamEarnings: number;
  isSuperAdmin: boolean;
  hasAccountsAccess: boolean;
  status: 'Active' | 'Blocked' | 'Pending';
  salesHistory?: PartnerSaleRecord[];
  customerPurchase?: {
    projectName: string;
    unitOrPlot: string;
    area: string;
    totalPrice: number;
    bookingMoney: number;
    paidAmount: number;
    dueAmount: number;
    installmentCount: number;
  };
}

interface ChartOfAccount {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  subType: string;
}

interface ERPTransaction {
  id: string;
  voucherNo: string;
  date: string;
  projectId: string;
  projectName: string;
  accountCode: string;
  accountName: string;
  type: 'Debit' | 'Credit';
  category: 'Land Cost' | 'Material Construction' | 'Contractor RA Bill' | 'Plot Sales Revenue' | 'Customer Installment' | 'Staff Salary' | 'Office Overhead' | 'Commission Payout' | 'Tax VAT (TDS/VDS)';
  description: string;
  grossAmount: number;
  tdsAmount: number;
  vdsAmount: number;
  retentionAmount: number;
  netAmount: number;
  recordedBy: string;
}

interface CustomerReceivable {
  id: string;
  customerName: string;
  phone: string;
  projectName: string;
  unitOrPlot: string;
  totalPrice: number;
  paidAmount: number;
  dueAmount: number;
  nextInstallmentDate: string;
  daysOverdue: number;
}

interface ProjectCostReport {
  id: string;
  name: string;
  totalRevenue: number;
  landAndDirectCost: number;
  materialCost: number;
  contractorCost: number;
  overheadCost: number;
  wipValue: number;
  netProfitLoss: number;
}

const MASTER_PHONE = '+8801689333000';

const MASTER_SUPER_ADMIN: UserProfile = {
  id: 'UDP-SA-001',
  name: 'MOHAMMAD ATIQUL ISLAM',
  email: 'mr.atiq.dhk.shimul@gmail.com',
  phone: MASTER_PHONE,
  password: 'password123',
  role: 'Super Admin',
  salesKatha: 85,
  totalEarnings: 6150000,
  heldEarnings: 0,
  teamSalesKatha: 350,
  teamEarnings: 4200000,
  isSuperAdmin: true,
  hasAccountsAccess: true,
  status: 'Active',
  salesHistory: [
    {
      id: 'SL-01',
      projectName: 'Dhaka Western Valley',
      unitOrPlot: 'Plot # A-12',
      areaKathaOrSqFt: '5 Katha',
      customerName: 'Mr. Zahirul Haque',
      customerPhone: '+8801711111111',
      salePrice: 7250000,
      commissionEarned: 362500,
      commissionPaid: 362500,
      commissionStatus: 'Paid',
      saleDate: '2026-08-15'
    }
  ]
};

// ===================== ২. প্রাথমিক ডাটাবেজ =====================
const generateInitialUsers = (): UserProfile[] => {
  const users: UserProfile[] = [
    MASTER_SUPER_ADMIN,
    {
      id: 'UDP-CH-002',
      name: 'Engr. Md Mustafizur Rahman Rashid',
      email: 'chairman@unitydream.com',
      phone: MASTER_PHONE,
      password: 'pass123',
      role: 'Chairman',
      salesKatha: 60,
      totalEarnings: 4500000,
      heldEarnings: 0,
      teamSalesKatha: 280,
      teamEarnings: 3100000,
      isSuperAdmin: true,
      hasAccountsAccess: true,
      status: 'Active'
    },
    {
      id: 'UDP-MD-003',
      name: 'Mohammad Showkat Ali',
      email: 'md@unitydream.com',
      phone: MASTER_PHONE,
      password: 'pass123',
      role: 'Managing Director',
      salesKatha: 55,
      totalEarnings: 3950000,
      heldEarnings: 0,
      teamSalesKatha: 240,
      teamEarnings: 2900000,
      isSuperAdmin: true,
      hasAccountsAccess: true,
      status: 'Active'
    },
    {
      id: 'UDP-GM-004',
      name: 'Md. Mahmudur Rahman',
      email: 'gm@unitydream.com',
      phone: '+8801722222201',
      password: 'pass123',
      role: 'General Manager',
      salesKatha: 35,
      totalEarnings: 2100000,
      heldEarnings: 0,
      teamSalesKatha: 160,
      teamEarnings: 1450000,
      isSuperAdmin: false,
      hasAccountsAccess: true,
      status: 'Active'
    },
    {
      id: 'UDP-DGM-005',
      name: 'Rofiqul Kabir Saikat',
      email: 'dgm@unitydream.com',
      phone: '+8801722222202',
      password: 'pass123',
      role: 'DGM',
      salesKatha: 25,
      totalEarnings: 1550000,
      heldEarnings: 0,
      teamSalesKatha: 95,
      teamEarnings: 820000,
      isSuperAdmin: false,
      hasAccountsAccess: false,
      status: 'Active'
    },
    {
      id: 'UDP-AGM-006',
      name: 'Piyal Hasan Rubel',
      email: 'agm@unitydream.com',
      phone: '+8801722222203',
      password: 'pass123',
      role: 'AGM',
      salesKatha: 18,
      totalEarnings: 1120000,
      heldEarnings: 50000,
      teamSalesKatha: 60,
      teamEarnings: 510000,
      isSuperAdmin: false,
      hasAccountsAccess: false,
      status: 'Active'
    },
    {
      id: 'UDP-TL-007',
      name: 'Md. Tariqul Islam',
      email: 'accounts@unitydream.com',
      phone: MASTER_PHONE,
      password: 'pass123',
      role: 'Accounts Head',
      salesKatha: 0,
      totalEarnings: 0,
      heldEarnings: 0,
      teamSalesKatha: 0,
      teamEarnings: 0,
      isSuperAdmin: false,
      hasAccountsAccess: true,
      status: 'Active'
    },
    {
      id: 'UDP-BP-102',
      name: 'Samia Parvin Shanta',
      email: 'samia.parvin.shanta@gmail.com',
      phone: '+8801733333301',
      password: 'pass123',
      role: 'Business Partner',
      salesKatha: 12,
      totalEarnings: 870000,
      heldEarnings: 0,
      teamSalesKatha: 20,
      teamEarnings: 180000,
      isSuperAdmin: false,
      hasAccountsAccess: false,
      status: 'Active',
      salesHistory: [
        {
          id: 'SL-02',
          projectName: 'The Bay Icon International Hotel & Resort Ltd.',
          unitOrPlot: 'Suite # 402',
          areaKathaOrSqFt: '300 Sq Ft',
          customerName: 'Kazi Farhana',
          customerPhone: '+8801912345678',
          salePrice: 15000000,
          commissionEarned: 450000,
          commissionPaid: 350000,
          commissionStatus: 'Paid',
          saleDate: '2026-09-10'
        }
      ]
    },
    {
      id: 'UDP-AGT-201',
      name: 'Tanvir Hossain',
      email: 'tanvir.agent@unitydream.com',
      phone: '+8801744444401',
      password: 'pass123',
      role: 'Agent',
      salesKatha: 5,
      totalEarnings: 362500,
      heldEarnings: 0,
      teamSalesKatha: 0,
      teamEarnings: 0,
      isSuperAdmin: false,
      hasAccountsAccess: false,
      status: 'Active'
    },
    {
      id: 'UDP-CUST-301',
      name: 'Khandaker Rafiqul Alam',
      email: 'rafiqul.client@gmail.com',
      phone: '+8801712345678',
      password: 'pass123',
      role: 'Customer',
      salesKatha: 0,
      totalEarnings: 0,
      heldEarnings: 0,
      teamSalesKatha: 0,
      teamEarnings: 0,
      isSuperAdmin: false,
      hasAccountsAccess: false,
      status: 'Active',
      customerPurchase: {
        projectName: 'Dhaka Western Valley',
        unitOrPlot: 'Plot # 14, Block # A',
        area: '5 Katha',
        totalPrice: 1450000,
        bookingMoney: 145000,
        paidAmount: 500000,
        dueAmount: 950000,
        installmentCount: 60
      }
    }
  ];

  const rolesDistribution: UserRole[] = ['Business Partner', 'Agent', 'Customer'];
  for (let i = 11; i <= 100; i++) {
    const role = rolesDistribution[i % 3];
    users.push({
      id: `UDP-USR-${100 + i}`,
      name: `Partner/Member ${i}`,
      email: `user${i}@unitydreamproperties.com`,
      phone: `+8801700${100000 + i}`,
      password: 'pass123',
      role: role,
      salesKatha: role === 'Customer' ? 0 : (i % 8) * 2,
      totalEarnings: role === 'Customer' ? 0 : (i % 8) * 145000,
      heldEarnings: 0,
      teamSalesKatha: role === 'Business Partner' ? (i % 5) * 5 : 0,
      teamEarnings: role === 'Business Partner' ? (i % 5) * 45000 : 0,
      isSuperAdmin: false,
      hasAccountsAccess: false,
      status: 'Active',
      customerPurchase: role === 'Customer' ? {
        projectName: 'Padma Eco-City',
        unitOrPlot: `Plot # ${i}, Block # B`,
        area: '5 Katha',
        totalPrice: 5250000,
        bookingMoney: 525000,
        paidAmount: 1800000,
        dueAmount: 3450000,
        installmentCount: 48
      } : undefined
    });
  }

  return users;
};

const INITIAL_COA: ChartOfAccount[] = [
  { code: '1010', name: 'Cash in Hand & Multi-Bank Accounts', type: 'Asset', subType: 'Current Asset' },
  { code: '1020', name: 'Accounts Receivable (Plot / Flat Installments)', type: 'Asset', subType: 'Current Asset' },
  { code: '1030', name: 'Work-In-Progress (WIP Construction)', type: 'Asset', subType: 'Inventory / WIP' },
  { code: '1040', name: 'Land & Project Property Inventory', type: 'Asset', subType: 'Fixed / Inventory' },
  { code: '2010', name: 'Accounts Payable (Suppliers & Vendors)', type: 'Liability', subType: 'Current Liability' },
  { code: '2020', name: 'Sub-contractor Retention Money Payable', type: 'Liability', subType: 'Current Liability' },
  { code: '2030', name: 'Govt. NBR TDS & VDS Payable', type: 'Liability', subType: 'Tax Liability' },
  { code: '3010', name: 'Paid Up Capital & Shareholder Equity', type: 'Equity', subType: 'Equity' },
  { code: '4010', name: 'Plot & Commercial Space Sales Revenue', type: 'Revenue', subType: 'Operating Revenue' },
  { code: '5010', name: 'Land Acquisition & Owner Sharing Cost', type: 'Expense', subType: 'Direct Cost' },
  { code: '5020', name: 'Raw Material Cost (Rod, Cement, Sand)', type: 'Expense', subType: 'Direct Cost' },
  { code: '5030', name: 'Contractor Civil Construction Expense', type: 'Expense', subType: 'Direct Cost' },
  { code: '5040', name: 'Partner Sales Commission & Marketing', type: 'Expense', subType: 'Selling Expense' },
  { code: '5050', name: 'Staff Salary & Office Admin Overhead', type: 'Expense', subType: 'Administrative' }
];

const INITIAL_TRANSACTIONS: ERPTransaction[] = [
  {
    id: 'TXN-001',
    voucherNo: 'VR-2026-101',
    date: '2026-10-01',
    projectId: '1',
    projectName: 'Dhaka Western Valley',
    accountCode: '4010',
    accountName: 'Plot Sales Revenue',
    type: 'Credit',
    category: 'Plot Sales Revenue',
    description: 'প্লট সেলস বুকিং ডাউনপেমেন্ট প্রাপ্তি (৫ কাঠা)',
    grossAmount: 1450000,
    tdsAmount: 0,
    vdsAmount: 0,
    retentionAmount: 0,
    netAmount: 1450000,
    recordedBy: 'MOHAMMAD ATIQUL ISLAM'
  },
  {
    id: 'TXN-002',
    voucherNo: 'VR-2026-102',
    date: '2026-10-02',
    projectId: '1',
    projectName: 'Dhaka Western Valley',
    accountCode: '5020',
    accountName: 'Raw Material Cost',
    type: 'Debit',
    category: 'Material Construction',
    description: 'প্রকল্পের সীমানা প্রাচীর ও বালু ভরাট মেটেরিয়াল ক্রয়',
    grossAmount: 320000,
    tdsAmount: 9600,
    vdsAmount: 16000,
    retentionAmount: 0,
    netAmount: 294400,
    recordedBy: 'Md. Tariqul Islam'
  },
  {
    id: 'TXN-003',
    voucherNo: 'VR-2026-103',
    date: '2026-10-03',
    projectId: '2',
    projectName: 'The Bay Icon International Hotel & Resort Ltd.',
    accountCode: '4010',
    accountName: 'Plot & Commercial Space Sales Revenue',
    type: 'Credit',
    category: 'Plot Sales Revenue',
    description: 'কক্সবাজার রিসোর্ট ফ্র্যাকশনাল ওনারশিপ শেয়ার সেলস',
    grossAmount: 5000000,
    tdsAmount: 0,
    vdsAmount: 0,
    retentionAmount: 0,
    netAmount: 5000000,
    recordedBy: 'MOHAMMAD ATIQUL ISLAM'
  },
  {
    id: 'TXN-004',
    voucherNo: 'VR-2026-104',
    date: '2026-10-04',
    projectId: '2',
    projectName: 'The Bay Icon International Hotel & Resort Ltd.',
    accountCode: '5030',
    accountName: 'Contractor Civil Construction Expense',
    type: 'Debit',
    category: 'Contractor RA Bill',
    description: 'কলাতলী সাইটের আরএ বিল-৩ (রানিং বিল) পেমেন্ট',
    grossAmount: 850000,
    tdsAmount: 42500,
    vdsAmount: 63750,
    retentionAmount: 42500,
    netAmount: 701250,
    recordedBy: 'Md. Tariqul Islam'
  },
  {
    id: 'TXN-005',
    voucherNo: 'VR-2026-105',
    date: '2026-10-05',
    projectId: '1',
    projectName: 'Dhaka Western Valley',
    accountCode: '5040',
    accountName: 'Partner Sales Commission',
    type: 'Debit',
    category: 'Commission Payout',
    description: 'পার্টনার কমিশন বিতরণ (UDP-BP-102)',
    grossAmount: 72500,
    tdsAmount: 7250,
    vdsAmount: 0,
    retentionAmount: 0,
    netAmount: 65250,
    recordedBy: 'Md. Tariqul Islam'
  }
];

const INITIAL_RECEIVABLES: CustomerReceivable[] = [
  {
    id: 'AR-01',
    customerName: 'Khandaker Rafiqul Alam',
    phone: '+8801712345678',
    projectName: 'Dhaka Western Valley',
    unitOrPlot: 'Plot # 14, Block # A (5 Katha)',
    totalPrice: 1450000,
    paidAmount: 500000,
    dueAmount: 950000,
    nextInstallmentDate: '2026-10-25',
    daysOverdue: 0
  },
  {
    id: 'AR-02',
    customerName: 'Engr. Shahinul Islam',
    phone: '+8801819998877',
    projectName: 'The Bay Icon Resort',
    unitOrPlot: 'Suite # 502 (Share 300 Sq Ft)',
    totalPrice: 15000000,
    paidAmount: 8000000,
    dueAmount: 7000000,
    nextInstallmentDate: '2026-09-30',
    daysOverdue: 8
  }
];

// প্রজেক্ট ক্যাটালগ
const projectsData = [
  {
    id: '1',
    name: 'Dhaka Western Valley',
    developer: 'পুষ্পধারা প্রপার্টিজ লিমিটেড অনুমোদিত',
    location: 'ঢাকা ওয়েস্টার্ন জোন (সাভার সংলগ্ন)',
    tag: 'Residential Plots',
    badge: 'Ongoing Flagship',
    size: 'সর্বনিম্ন ৫ কাঠা (৫ ও ১০ কাঠা প্লট)',
    price: '১৪,৫০,০০০ ৳ / কাঠা',
    statusBadge: 'প্যাকেজ / রেট',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    terms: [
      'সর্বনিম্ন প্লট সাইজ ৫ কাঠা থেকে শুরু। ৩ কাঠার কোনো প্লট বরাদ্দযোগ্য নয়।',
      'এককালীন পরিশোধে বিশেষ মূল্যছাড় ও তাৎক্ষণিক সাফ-কবলা রেজিস্ট্রেশন সুবিধা।',
      'সর্বোচ্চ ৬০টি সহজ মাসিক কিস্তিতে মূল্য পরিশোধের সুবর্ণ সুযোগ।',
      'বুকিং মানি মোট মূল্যের ১০% প্রদান সাপেক্ষে সাময়িক প্লট বরাদ্দ নিশ্চিত করা হবে।'
    ]
  },
  {
    id: '2',
    name: 'The Bay Icon International Hotel & Resort Ltd.',
    developer: 'পুষ্পধারা প্রপার্টিজ লিমিটেড / Bay Icon Ltd.',
    location: 'কলাতলী মেরিন ড্রাইভ, কক্সবাজার',
    tag: '5-Star Luxury Hospitality & Commercial',
    badge: 'Under Construction',
    size: '১০০, ৩০০, ৫০০, ১,০০০, ২,০০০, ৩,০০০ ও ৫,০০০ Sq Ft / Fractional Share',
    price: '৫০,০০০ ৳ / প্রতি স্কয়ার ফিট',
    statusBadge: 'শেয়ার ও ওনারশিপ ইনভেস্টমেন্ট',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    terms: [
      'প্রতি স্কয়ার ফিটের কর্পোরেট মূল্য ৫০,০০০ টাকা নির্ধারিত।',
      '১০০ থেকে ৫০০০ স্কয়ার ফিট ফ্র্যাকশনাল ওনারশিপ শেয়ার বরাদ্দযোগ্য।',
      'আজীবন সাব-কবলা দলিল ও নিয়মিত লভ্যাংশ (ROI) পাওয়ার আইনি নিশ্চয়তা।'
    ]
  },
  {
    id: '3',
    name: 'Padma Eco-City',
    developer: 'পুষ্পধারা প্রপার্টিজ লিমিটেড',
    location: 'ঢাকা-মাওয়া এক্সপ্রেসওয়ে (পদ্মা সেতু সংলগ্ন)',
    tag: 'Township / Mega Plot Project',
    badge: 'Ongoing Flagship',
    size: 'সর্বনিম্ন ৫ কাঠা (৫, ১০ ও ২০ কাঠা প্লট)',
    price: '১০,৫০,০০০ ৳ / কাঠা থেকে শুরু',
    statusBadge: 'প্যাকেজ / রেট',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    terms: [
      'প্রকল্পে প্লট সাইজ সর্বনিম্ন ৫ কাঠা। ৩ কাঠার প্লট বরাদ্দ বন্ধ।',
      'পদ্মা সেতু সংলগ্ন আধুনিক ইকো-সিটি এবং সহজ ৩৬-৭২ মাসের কিস্তি সুবিধা।'
    ]
  },
  {
    id: '4',
    name: 'Pushpodhara Satellite City',
    developer: 'পুষ্পধারা প্রপার্টিজ লিমিটেড',
    location: 'ঢাকা জেলা পয়েন্ট থেকে ২২ কিমি ও পদ্মা সেতু থেকে কাছে',
    tag: 'Satellite Town / Plots',
    badge: 'Available',
    size: 'সর্বনিম্ন ৫ কাঠা (৫ ও ১০ কাঠা প্লট)',
    price: 'আকর্ষণীয় কিস্তি সুবিধা',
    statusBadge: 'প্যাকেজ / প্লট',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    terms: [
      'সর্বনিম্ন প্লট সাইজ ৫ কাঠা নির্ধারিত।',
      'স্কুল, কলেজ, মসজিদ, পার্ক ও বাণিজ্যিক জোন পরিকল্পিত।'
    ]
  },
  {
    id: '5',
    name: 'Narayanganj Bhuighar Project',
    developer: 'পুষ্পধারা প্রপার্টিজ লিমিটেড',
    location: 'ভূঁইগড়, নারায়ণগঞ্জ',
    tag: 'Residential / Commercial Land',
    badge: 'Upcoming Project',
    size: 'সর্বনিম্ন ৫ কাঠা প্লট',
    price: 'যোগাযোগ সাপেক্ষে',
    statusBadge: 'বুকিং চলছে',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    terms: ['বাণিজ্যিক ও আবাসিক সমন্বিত প্লট। সর্বনিম্ন ৫ কাঠা প্লট বরাদ্দ।']
  },
  {
    id: '6',
    name: 'Rampura Project',
    developer: 'পুষ্পধারা প্রপার্টিজ লিমিটেড',
    location: 'রামপুরা কাঁচাবাজার সংলগ্ন, ঢাকা',
    tag: 'Commercial & Residential',
    badge: 'Prime Location',
    size: 'বাণিজ্যিক ও আবাসিক স্পেস',
    price: 'যোগাযোগ সাপেক্ষে',
    statusBadge: 'বুকিং চলছে',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    terms: ['বাণিজ্যিক ও আবাসিক স্পেসের সরাসরি ওনারশিপ বিনিয়োগ সুবিধা।']
  }
];

export default function UnityDreamPortal() {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<ERPTransaction[]>(INITIAL_TRANSACTIONS);
  const [receivables, setReceivables] = useState<CustomerReceivable[]>(INITIAL_RECEIVABLES);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Responsive & Modal States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<'login' | 'register' | 'forgot' | null>(null);
  const [showERP, setShowERP] = useState(false);
  
  // ট্যাব নেভিগেশন (১ম ট্যাব: পার্টনার লিস্ট)
  const [activeTab, setActiveTab] = useState<'partner_list' | 'journal_ledger' | 'project_costing' | 'ar_installments' | 'tax_vat' | 'balance_sheet' | 'admin_users'>('partner_list');
  const [selectedProjectForTerms, setSelectedProjectForTerms] = useState<typeof projectsData[0] | null>(null);
  const [viewDetailsUser, setViewDetailsUser] = useState<UserProfile | null>(null);
  const [editUserModal, setEditUserModal] = useState<UserProfile | null>(null);

  // Auth Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  // ভাউচার ইনপুটস
  const [voucherProjectId, setVoucherProjectId] = useState('1');
  const [voucherAccountCode, setVoucherAccountCode] = useState('4010');
  const [voucherType, setVoucherType] = useState<'Debit' | 'Credit'>('Credit');
  const [voucherCategory, setVoucherCategory] = useState<ERPTransaction['category']>('Plot Sales Revenue');
  const [voucherDesc, setVoucherDesc] = useState('');
  const [voucherGross, setVoucherGross] = useState<number>(0);
  const [voucherTdsRate, setVoucherTdsRate] = useState<number>(0);
  const [voucherVdsRate, setVoucherVdsRate] = useState<number>(0);
  const [voucherRetentionRate, setVoucherRetentionRate] = useState<number>(0);

  // ইউজার অ্যাড মোডাল
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Business Partner');
  const [newUserPassword, setNewUserPassword] = useState('pass123');
  const [newUserAccountsAccess, setNewUserAccountsAccess] = useState(false);

  useEffect(() => {
    const savedUsers = localStorage.getItem('udp_erp_users_v2');
    if (savedUsers) {
      try { 
        setUsersList(JSON.parse(savedUsers)); 
      } catch (e) { 
        console.error(e); 
      }
    } else {
      const initial = generateInitialUsers();
      setUsersList(initial);
      localStorage.setItem('udp_erp_users_v2', JSON.stringify(initial));
    }

    const savedTxns = localStorage.getItem('udp_erp_txns');
    if (savedTxns) {
      try { setTransactions(JSON.parse(savedTxns)); } catch (e) { console.error(e); }
    }

    const savedAr = localStorage.getItem('udp_erp_ar');
    if (savedAr) {
      try { setReceivables(JSON.parse(savedAr)); } catch (e) { console.error(e); }
    }

    const activeSession = localStorage.getItem('udp_active_session');
    if (activeSession) {
      try { setCurrentUser(JSON.parse(activeSession)); } catch (e) { console.error(e); }
    }
  }, []);

  const saveUsers = (list: UserProfile[]) => {
    setUsersList(list);
    localStorage.setItem('udp_erp_users_v2', JSON.stringify(list));
  };

  const saveTxns = (list: ERPTransaction[]) => {
    setTransactions(list);
    localStorage.setItem('udp_erp_txns', JSON.stringify(list));
  };

  const triggerWhatsApp = (phone: string, text: string) => {
    const formatted = phone.replace(/[^0-9]/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const totalCreditRevenue = useMemo(() => {
    return transactions.filter(t => t.type === 'Credit').reduce((acc, t) => acc + t.grossAmount, 0);
  }, [transactions]);

  const totalDebitExpense = useMemo(() => {
    return transactions.filter(t => t.type === 'Debit').reduce((acc, t) => acc + t.grossAmount, 0);
  }, [transactions]);

  const totalTDSCollected = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.tdsAmount, 0);
  }, [transactions]);

  const totalVDSCollected = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.vdsAmount, 0);
  }, [transactions]);

  const totalRetentionPayable = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.retentionAmount, 0);
  }, [transactions]);

  const netCashInHand = useMemo(() => {
    const cashIn = transactions.filter(t => t.type === 'Credit').reduce((acc, t) => acc + t.netAmount, 0);
    const cashOut = transactions.filter(t => t.type === 'Debit').reduce((acc, t) => acc + t.netAmount, 0);
    return cashIn - cashOut;
  }, [transactions]);

  const projectCostMatrix: ProjectCostReport[] = useMemo(() => {
    return projectsData.map(proj => {
      const projTxns = transactions.filter(t => t.projectId === proj.id);
      const rev = projTxns.filter(t => t.type === 'Credit').reduce((acc, t) => acc + t.grossAmount, 0);
      const mat = projTxns.filter(t => t.category === 'Material Construction').reduce((acc, t) => acc + t.grossAmount, 0);
      const cont = projTxns.filter(t => t.category === 'Contractor RA Bill').reduce((acc, t) => acc + t.grossAmount, 0);
      const land = projTxns.filter(t => t.category === 'Land Cost').reduce((acc, t) => acc + t.grossAmount, 0);
      const ovh = projTxns.filter(t => t.category === 'Office Overhead' || t.category === 'Commission Payout' || t.category === 'Staff Salary').reduce((acc, t) => acc + t.grossAmount, 0);
      
      const wip = mat + cont + land;
      const net = rev - (mat + cont + land + ovh);
      return {
        id: proj.id,
        name: proj.name,
        totalRevenue: rev,
        landAndDirectCost: land,
        materialCost: mat,
        contractorCost: cont,
        overheadCost: ovh,
        wipValue: wip,
        netProfitLoss: net
      };
    });
  }, [transactions]);

  const visiblePartners = useMemo(() => {
    if (!currentUser) return [];

    const userWeight = ROLE_HIERARCHY[currentUser.role] || 0;

    if (['Super Admin', 'Chairman', 'Managing Director'].includes(currentUser.role)) {
      return usersList;
    }

    if (currentUser.role === 'General Manager') {
      return usersList.filter(u => !['Super Admin', 'Chairman', 'Managing Director'].includes(u.role));
    }

    if (['DGM', 'AGM', 'Team Leader', 'Business Partner'].includes(currentUser.role)) {
      return usersList.filter(u => ROLE_HIERARCHY[u.role] < userWeight || u.id === currentUser.id);
    }

    if (currentUser.role === 'Agent') {
      return usersList.filter(u => u.role === 'Agent' || u.id === currentUser.id);
    }

    if (currentUser.role === 'Customer') {
      return usersList.filter(u => u.id === currentUser.id);
    }

    return usersList.filter(u => u.id === currentUser.id);
  }, [currentUser, usersList]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usersList.find(u => u.email.trim().toLowerCase() === loginEmail.trim().toLowerCase());
    if (!user) {
      alert('ইমেইলটি সঠিক নয় অথবা অ্যাকাউন্ট পাওয়া যায়নি!');
      return;
    }
    if (user.password && user.password !== loginPassword) {
      alert('পাসওয়ার্ড ভুল হয়েছে!');
      return;
    }
    if (user.status === 'Blocked') {
      alert('আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত (Blocked) করা হয়েছে! অ্যাডমিনের সাথে যোগাযোগ করুন।');
      return;
    }
    setCurrentUser(user);
    localStorage.setItem('udp_active_session', JSON.stringify(user));
    setAuthModal(null);
    setLoginEmail('');
    setLoginPassword('');
    alert(`স্বাগতম ${user.name}! পদবী: ${user.role}। সফলভাবে লগইন হয়েছে।`);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = regEmail.trim().toLowerCase();
    if (usersList.some(u => u.email.trim().toLowerCase() === cleanEmail)) {
      alert('এই ইমেইলে ইতোমধ্যে অ্যাকাউন্ট রয়েছে!');
      setAuthModal('login');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      alert('পাসওয়ার্ড মেলেনি!');
      return;
    }

    const newId = `UDP-BP-${Math.floor(100 + Math.random() * 900)}`;
    const newUser: UserProfile = {
      id: newId,
      name: regName.trim(),
      email: cleanEmail,
      phone: regPhone.trim(),
      password: regPassword,
      role: 'Business Partner',
      salesKatha: 0,
      totalEarnings: 0,
      heldEarnings: 0,
      teamSalesKatha: 0,
      teamEarnings: 0,
      isSuperAdmin: false,
      hasAccountsAccess: false,
      status: 'Active'
    };

    const updated = [...usersList, newUser];
    saveUsers(updated);
    setCurrentUser(newUser);
    localStorage.setItem('udp_active_session', JSON.stringify(newUser));
    setAuthModal(null);

    const msg = `*UNITY DREAM PROPERTIES LTD. Registration Confirmed*\nName: ${newUser.name}\nUser ID: ${newUser.id}\nRole: Business Partner\nHelpline: ${MASTER_PHONE}`;
    triggerWhatsApp(newUser.phone, msg);
    triggerWhatsApp(MASTER_PHONE, `*New User Joined UDP*\nID: ${newUser.id}\nName: ${newUser.name}\nPhone: ${newUser.phone}`);

    setRegName(''); setRegEmail(''); setRegPhone(''); setRegPassword(''); setRegConfirmPassword('');
    alert(`অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! ইউজার আইডি: ${newId}`);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usersList.find(u => u.email.trim().toLowerCase() === forgotEmail.trim().toLowerCase());
    if (!user) {
      alert('ইমেইলটি ডাটাবেজে পাওয়া যায়নি!');
      return;
    }
    if (user.password) {
      triggerWhatsApp(user.phone, `*UNITY DREAM PROPERTIES LTD. Credentials*\nUser ID: ${user.id}\nPassword: ${user.password}\nHelpline: ${MASTER_PHONE}`);
      alert(`ইউজার আইডি (${user.id}) ও পাসওয়ার্ড আপনার হোয়াটসঅ্যাপে পাঠানো হয়েছে!`);
    }
    setForgotEmail('');
    setAuthModal('login');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('udp_active_session');
    setShowERP(false);
    setAccountMenuOpen(false);
    alert('লগআউট সম্পন্ন হয়েছে।');
  };

  const handleAddVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.hasAccountsAccess && !currentUser?.isSuperAdmin) {
      alert('আপনার অ্যাকাউন্টস লেনদেন যুক্ত করার অনুমতি নেই!');
      return;
    }
    if (voucherGross <= 0) {
      alert('ভাউচারের টাকার পরিমাণ ০ এর বেশি হতে হবে!');
      return;
    }

    const matchedProject = projectsData.find(p => p.id === voucherProjectId);
    const matchedAccount = INITIAL_COA.find(c => c.code === voucherAccountCode);

    const tds = (voucherGross * voucherTdsRate) / 100;
    const vds = (voucherGross * voucherVdsRate) / 100;
    const retention = (voucherGross * voucherRetentionRate) / 100;
    const net = voucherType === 'Debit' ? voucherGross - (tds + vds + retention) : voucherGross;

    const newTxn: ERPTransaction = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      voucherNo: `VR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      projectId: voucherProjectId,
      projectName: matchedProject?.name || 'General Project',
      accountCode: voucherAccountCode,
      accountName: matchedAccount?.name || 'General Expense',
      type: voucherType,
      category: voucherCategory,
      description: voucherDesc.trim() || `${voucherCategory} Transaction`,
      grossAmount: voucherGross,
      tdsAmount: tds,
      vdsAmount: vds,
      retentionAmount: retention,
      netAmount: net,
      recordedBy: currentUser.name
    };

    const updated = [newTxn, ...transactions];
    saveTxns(updated);

    triggerWhatsApp(
      MASTER_PHONE,
      `*UDP Financial Transaction Alert*\nVoucher: ${newTxn.voucherNo}\nType: ${newTxn.type}\nGross: ${newTxn.grossAmount.toLocaleString('bn-BD')} BDT\nNet: ${newTxn.netAmount.toLocaleString('bn-BD')} BDT\nProject: ${newTxn.projectName}\nRecorded By: ${newTxn.recordedBy}`
    );

    setVoucherDesc('');
    setVoucherGross(0);
    setVoucherTdsRate(0);
    setVoucherVdsRate(0);
    setVoucherRetentionRate(0);
    alert(`ভাউচার (${newTxn.voucherNo}) সফলভাবে যুক্ত হয়েছে এবং মাস্টার নম্বরে নোটিফিকেশন পাঠানো হয়েছে!`);
  };

  const handleDeleteUser = (email: string) => {
    if (!currentUser?.isSuperAdmin) return;
    if (email === MASTER_SUPER_ADMIN.email) {
      alert('সুপার অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা যাবে না!');
      return;
    }
    if (confirm('আপনি কি এই ইউজারটি স্থায়ীভাবে ডাটাবেজ থেকে মুছে ফেলতে চান?')) {
      const updated = usersList.filter(u => u.email !== email);
      saveUsers(updated);
      alert('ইউজার সফলভাবে মুছে ফেলা হয়েছে!');
    }
  };

  const handleAdminCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.isSuperAdmin) return;

    const cleanEmail = newUserEmail.trim().toLowerCase();
    if (usersList.some(u => u.email.trim().toLowerCase() === cleanEmail)) {
      alert('এই ইমেইলে ইতোমধ্যে অ্যাকাউন্ট রয়েছে!');
      return;
    }

    const createdId = `UDP-${newUserRole.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const createdUser: UserProfile = {
      id: createdId,
      name: newUserName.trim(),
      email: cleanEmail,
      phone: newUserPhone.trim(),
      password: newUserPassword,
      role: newUserRole,
      salesKatha: 0,
      totalEarnings: 0,
      heldEarnings: 0,
      teamSalesKatha: 0,
      teamEarnings: 0,
      isSuperAdmin: ['Super Admin', 'Chairman', 'Managing Director'].includes(newUserRole),
      hasAccountsAccess: newUserAccountsAccess || ['Super Admin', 'Accounts Head'].includes(newUserRole),
      status: 'Active'
    };

    const updated = [...usersList, createdUser];
    saveUsers(updated);

    triggerWhatsApp(
      createdUser.phone,
      `*UNITY DREAM PROPERTIES LTD. Official Account Created*\nName: ${createdUser.name}\nUser ID: ${createdUser.id}\nRole: ${createdUser.role}\nPassword: ${createdUser.password}\nPortal: https://hp-seven-weld.vercel.app/unitydreamproperties\nHelpline: ${MASTER_PHONE}`
    );

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setShowAddUserModal(false);
    alert(`নতুন ইউজার (${createdId}) ক্লাউড ডাটাবেজে যুক্ত হয়েছে!`);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal || !currentUser?.isSuperAdmin) return;

    const updated = usersList.map(u => {
      if (u.id === editUserModal.id) {
        return {
          ...editUserModal,
          isSuperAdmin: ['Super Admin', 'Chairman', 'Managing Director'].includes(editUserModal.role)
        };
      }
      return u;
    });

    saveUsers(updated);
    setEditUserModal(null);
    alert('ইউজারের তথ্য ও স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      
      {/* ===================== ১. হেডার ও মেনুবার ===================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            <div className="flex items-center gap-3 shrink-0 mr-4">
              <img 
                src="/logo.jpg" 
                alt="Unity Dream Properties" 
                className="h-11 sm:h-12 w-auto object-contain rounded"
                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
              />
              <div className="flex flex-col justify-center">
                <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 whitespace-nowrap">
                  UNITY DREAM PROPERTIES
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 tracking-wide">
                  <span className="hidden sm:inline">BTM পার্টনার অফ পুষ্পধারা প্রপার্টিজ লি:</span>
                  <span className="sm:hidden">বিটিএম পার্টনার অফ PPL</span>
                </span>
              </div>
            </div>

            <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-slate-700 ml-4">
              <a href="#home" className="hover:text-emerald-600 transition-colors">Home</a>
              <a href="#management" className="hover:text-emerald-600 transition-colors">Management</a>
              <a href="#for-sale" className="hover:text-emerald-600 transition-colors whitespace-nowrap">For Sale</a>
              <a href="#roommates" className="hover:text-emerald-600 transition-colors">Roommates</a>
              <a href="#jobs" className="hover:text-emerald-600 transition-colors">Jobs</a>
              <a href="#contact" className="hover:text-emerald-600 transition-colors">Contact</a>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <button 
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 px-3 sm:px-4 py-2 rounded-lg border border-emerald-200 text-xs font-bold transition-all whitespace-nowrap"
                >
                  <span>👤</span>
                  <span>{currentUser ? currentUser.name.split(' ')[0] : 'My account'}</span>
                  <span className="text-[10px]">▼</span>
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 text-xs">
                    {currentUser ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100 bg-slate-50">
                          <p className="font-extrabold text-slate-900 leading-tight">{currentUser.name}</p>
                          <p className="text-[11px] text-emerald-600 font-bold mt-0.5">{currentUser.role}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{currentUser.email}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{currentUser.phone}</p>
                        </div>

                        <button 
                          onClick={() => { setShowERP(true); setAccountMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-2"
                        >
                          <span>📊</span> রিয়েল এস্টেট ERP ড্যাশবোর্ড
                        </button>

                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 font-bold border-t border-gray-100 flex items-center gap-2"
                        >
                          <span>🚪</span> Log Out (লগআউট)
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => { setAuthModal('login'); setAccountMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-800 flex items-center gap-2 font-bold"
                        >
                          <span>🔑</span> Login (লগইন)
                        </button>
                        <button 
                          onClick={() => { setAuthModal('register'); setAccountMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-800 flex items-center gap-2 font-bold"
                        >
                          <span>📝</span> Create Account (নতুন অ্যাকাউন্ট)
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <span className="text-xl font-bold leading-none">✕</span>
                ) : (
                  <span className="text-xl font-bold leading-none">☰</span>
                )}
              </button>
            </div>

          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 px-4 pt-3 pb-5 shadow-lg space-y-3 text-sm font-semibold text-slate-700">
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700">Home</a>
            <a href="#management" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700">Management</a>
            <a href="#for-sale" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700">For Sale</a>
            <a href="#roommates" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700">Roommates</a>
            <a href="#jobs" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700">Jobs</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700">Contact</a>
          </div>
        )}
      </header>

      {/* ===================== ২. কেন্দ্রীয় ক্লাউড ERP ব্যানার ===================== */}
      <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                সেন্ট্রাল ক্লাউড ডাটাবেজ সংযুক্ত (অনলাইন সিংকিং সক্রিয়)
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Unity Dream Properties — সেন্ট্রাল একাউন্টিং, প্রজেক্ট কস্টিং ও রিয়েল এস্টেট ERP
              </h2>
            </div>
            
            <div>
              <button 
                onClick={() => {
                  if (!currentUser) {
                    alert('অনুগ্রহ করে আগে লগইন করুন!');
                    setAuthModal('login');
                    return;
                  }
                  setShowERP(!showERP);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <span>{showERP ? 'ERP বন্ধ করুন' : 'সেন্ট্রাল ERP ও একাউন্টিং খুলুন'}</span>
              </button>
            </div>
          </div>

          {showERP && currentUser && (
            <div className="mt-6 pt-6 border-t border-slate-700/80 bg-slate-950/95 p-5 rounded-xl">
              
              <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-5">
                <button 
                  onClick={() => setActiveTab('partner_list')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'partner_list' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  ⭐ পার্টনার লিস্ট (সেলস, কমিশন ও ডিটেইলস)
                </button>

                {(currentUser.hasAccountsAccess || currentUser.isSuperAdmin) && (
                  <>
                    <button 
                      onClick={() => setActiveTab('journal_ledger')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'journal_ledger' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      📒 জেনারেল জার্নাল ও ভাউচার (GL/Debit-Credit)
                    </button>

                    <button 
                      onClick={() => setActiveTab('project_costing')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'project_costing' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      🏗️ প্রজেক্ট কস্টিং, মেটেরিয়াল ও WIP
                    </button>

                    <button 
                      onClick={() => setActiveTab('ar_installments')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'ar_installments' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      👥 কাস্টমার কিস্তি ও এজিং (AR)
                    </button>

                    <button 
                      onClick={() => setActiveTab('tax_vat')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'tax_vat' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      ⚖️ বিডি ট্যাক্স ও ভ্যাট (TDS/VDS Mushak)
                    </button>

                    <button 
                      onClick={() => setActiveTab('balance_sheet')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'balance_sheet' ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      📈 ব্যালেন্স শীট ও ট্রেজারি
                    </button>
                  </>
                )}

                {currentUser.isSuperAdmin && (
                  <button 
                    onClick={() => setActiveTab('admin_users')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'admin_users' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    👑 ইউজার ডাটাবেজ ও পারমিশন কন্ট্রোল
                  </button>
                )}
              </div>

              {/* TAB 1: পার্টনার লিস্ট */}
              {activeTab === 'partner_list' && (
                <div className="text-xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400">
                        ⭐ পার্টনার ও টিম পারফরম্যান্স নেটওয়ার্ক
                      </h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        আপনার পদবী: <strong className="text-white">{currentUser.role}</strong> ({currentUser.name}) | 
                        অধীনস্থ দৃশ্যমান মেম্বার: <strong className="text-amber-400">{visiblePartners.length} জন</strong>
                      </p>
                    </div>
                    <div className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-lg">
                      🔒 আপনার রোল অনুসারে অনুমোদিত ডেটা প্রদর্শিত হচ্ছে
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/80">
                          <th className="py-2.5 px-3">আইডি ও নাম</th>
                          <th className="py-2.5 px-3">পদবী (Role)</th>
                          <th className="py-2.5 px-3">মোবাইল</th>
                          <th className="py-2.5 px-3 text-right">ব্যক্তিগত সেলস</th>
                          <th className="py-2.5 px-3 text-right">অর্জিত কমিশন</th>
                          <th className="py-2.5 px-3 text-right">টিম সেলস</th>
                          <th className="py-2.5 px-3 text-right">টিম ওভাররাইড</th>
                          <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                          <th className="py-2.5 px-3 text-center">ডিটেইলস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-slate-800 text-slate-300">
                        {visiblePartners.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-bold text-white block">{user.name}</span>
                              <span className="font-mono text-emerald-400 text-[10px]">{user.id}</span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-200">
                              <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px]">{user.phone}</td>
                            <td className="py-3 px-3 text-right font-bold text-emerald-400">
                              {user.salesKatha} কাঠা
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-amber-400">
                              {user.totalEarnings.toLocaleString('bn-BD')} ৳
                            </td>
                            <td className="py-3 px-3 text-right text-slate-400">
                              {user.teamSalesKatha} কাঠা
                            </td>
                            <td className="py-3 px-3 text-right text-purple-400">
                              {user.teamEarnings.toLocaleString('bn-BD')} ৳
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                user.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button 
                                onClick={() => setViewDetailsUser(user)}
                                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-2.5 py-1 rounded border border-slate-700 text-[11px]"
                              >
                                বিস্তারিত দেখুন
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: জেনারেল জার্নাল ও ভাউচার */}
              {activeTab === 'journal_ledger' && (currentUser.hasAccountsAccess || currentUser.isSuperAdmin) && (
                <div>
                  <form onSubmit={handleAddVoucher} className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6 text-xs">
                    <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                      <span>✍️</span> রিয়েল এস্টেট ভাউচার এন্ট্রি (জার্নাল, TDS, VDS ও অটো এসএমএস অ্যালার্ট)
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">প্রকল্প (Project)</label>
                        <select 
                          value={voucherProjectId} 
                          onChange={(e) => setVoucherProjectId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                        >
                          {projectsData.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">চার্ট অব অ্যাকাউন্টস (COA)</label>
                        <select 
                          value={voucherAccountCode} 
                          onChange={(e) => setVoucherAccountCode(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                        >
                          {INITIAL_COA.map(c => (
                            <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">লেনদেনের ধরন (Type)</label>
                        <select 
                          value={voucherType} 
                          onChange={(e) => setVoucherType(e.target.value as 'Debit' | 'Credit')}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                        >
                          <option value="Credit">Credit (আয় / বুকিং / রিসিট)</option>
                          <option value="Debit">Debit (ব্যয় / মেটেরিয়াল / পেমেন্ট)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">ক্যাটাগরি</label>
                        <select 
                          value={voucherCategory} 
                          onChange={(e) => setVoucherCategory(e.target.value as ERPTransaction['category'])}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                        >
                          <option value="Plot Sales Revenue">Plot Sales Revenue (প্লট/ফ্ল্যাট বিক্রি)</option>
                          <option value="Customer Installment">Customer Installment (কিস্তি আদায়)</option>
                          <option value="Material Construction">Material Construction (রড, সিমেন্ট, বালু)</option>
                          <option value="Contractor RA Bill">Contractor RA Bill (ঠিকাদার রানিং বিল)</option>
                          <option value="Land Cost">Land Cost (জমি অধিগ্রহণ ও সাইন-অন)</option>
                          <option value="Office Overhead">Office Overhead (অফিস খরচ)</option>
                          <option value="Staff Salary">Staff Salary (স্টাফ স্যালারি)</option>
                          <option value="Commission Payout">Commission Payout (কমিশন প্রদান)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-slate-400 block mb-1">বিবরণ (Narration)</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="ভাউচারের সুনির্দিষ্ট বিবরণ দিন..."
                          value={voucherDesc}
                          onChange={(e) => setVoucherDesc(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">মোট বিল (Gross ৳)</label>
                        <input 
                          type="number" 
                          required 
                          min="1"
                          placeholder="পরিমাণ"
                          value={voucherGross || ''}
                          onChange={(e) => setVoucherGross(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold text-amber-400"
                        />
                      </div>

                      {voucherType === 'Debit' ? (
                        <div className="grid grid-cols-3 gap-1">
                          <div>
                            <label className="text-[10px] text-slate-400 block">TDS %</label>
                            <input 
                              type="number" 
                              placeholder="%"
                              value={voucherTdsRate || ''}
                              onChange={(e) => setVoucherTdsRate(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white text-center"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block">VDS %</label>
                            <input 
                              type="number" 
                              placeholder="%"
                              value={voucherVdsRate || ''}
                              onChange={(e) => setVoucherVdsRate(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white text-center"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block">Ret %</label>
                            <input 
                              type="number" 
                              placeholder="%"
                              value={voucherRetentionRate || ''}
                              onChange={(e) => setVoucherRetentionRate(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white text-center"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center text-emerald-400 font-semibold text-[11px] pt-4">
                          ✓ কোম্পানির মূল একাউন্টসে ক্রেডিট হবে ও মাস্টার অ্যালার্ট যাবে
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-between items-center pt-2 border-t border-slate-800">
                      <span className="text-slate-400 text-[11px]">
                        নিট সমন্বয়: <strong className="text-white">
                          {voucherType === 'Debit' 
                            ? (voucherGross - ((voucherGross * voucherTdsRate)/100 + (voucherGross * voucherVdsRate)/100 + (voucherGross * voucherRetentionRate)/100)).toLocaleString('bn-BD')
                            : voucherGross.toLocaleString('bn-BD')} ৳
                        </strong>
                      </span>
                      <button 
                        type="submit" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded shadow text-xs"
                      >
                        ভাউচার সেভ করুন
                      </button>
                    </div>
                  </form>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/80">
                          <th className="py-2.5 px-3">ভাউচার নং</th>
                          <th className="py-2.5 px-3">তারিখ</th>
                          <th className="py-2.5 px-3">প্রকল্প</th>
                          <th className="py-2.5 px-3">COA ও খাত</th>
                          <th className="py-2.5 px-3">বিবরণ</th>
                          <th className="py-2.5 px-3 text-right">গ্রস পরিমাণ</th>
                          <th className="py-2.5 px-3 text-right">নিট লেনদেন</th>
                          <th className="py-2.5 px-3 text-center">রেকর্ডকারী</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-slate-800 text-slate-300">
                        {transactions.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-900/50">
                            <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{t.voucherNo}</td>
                            <td className="py-2.5 px-3 font-mono">{t.date}</td>
                            <td className="py-2.5 px-3">{t.projectName}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px]">{t.accountCode} - {t.category}</td>
                            <td className="py-2.5 px-3">{t.description}</td>
                            <td className={`py-2.5 px-3 text-right font-bold ${t.type === 'Credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {t.grossAmount.toLocaleString('bn-BD')} ৳
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-white">
                              {t.netAmount.toLocaleString('bn-BD')} ৳
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-400 text-[11px]">{t.recordedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: প্রজেক্ট কস্টিং ও লাভ ক্ষতি */}
              {activeTab === 'project_costing' && (currentUser.hasAccountsAccess || currentUser.isSuperAdmin) && (
                <div className="text-xs">
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-indigo-400">
                      🏗️ প্রকল্পভিত্তিক লাভ-ক্ষতি (Project P&L) ও Work-in-Progress (WIP) বিশ্লেষণ
                    </h4>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/80">
                          <th className="py-2.5 px-3">প্রকল্পের নাম</th>
                          <th className="py-2.5 px-3 text-right">মোট সেলস রেভিনিউ</th>
                          <th className="py-2.5 px-3 text-right">মেটেরিয়াল খরচ</th>
                          <th className="py-2.5 px-3 text-right">ঠিকাদার বিল</th>
                          <th className="py-2.5 px-3 text-right">ভূমি ও ডাইরেক্ট খরচ</th>
                          <th className="py-2.5 px-3 text-right">চলতি WIP মূল্য</th>
                          <th className="py-2.5 px-3 text-right">নিট লাভ/ক্ষতি (P&L)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-slate-800 text-slate-300">
                        {projectCostMatrix.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/50">
                            <td className="py-3 px-3 font-bold text-white">{p.name}</td>
                            <td className="py-3 px-3 text-right font-bold text-emerald-400">{p.totalRevenue.toLocaleString('bn-BD')} ৳</td>
                            <td className="py-3 px-3 text-right">{p.materialCost.toLocaleString('bn-BD')} ৳</td>
                            <td className="py-3 px-3 text-right">{p.contractorCost.toLocaleString('bn-BD')} ৳</td>
                            <td className="py-3 px-3 text-right">{p.landAndDirectCost.toLocaleString('bn-BD')} ৳</td>
                            <td className="py-3 px-3 text-right font-bold text-amber-400">{p.wipValue.toLocaleString('bn-BD')} ৳</td>
                            <td className={`py-3 px-3 text-right font-extrabold ${p.netProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {p.netProfitLoss.toLocaleString('bn-BD')} ৳
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: কাস্টমার কিস্তি ও এজিং */}
              {activeTab === 'ar_installments' && (currentUser.hasAccountsAccess || currentUser.isSuperAdmin) && (
                <div className="text-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-sky-400">
                      👥 কাস্টমার ইনস্টলমেন্ট ট্র্যাকিং ও রিসিভেবল এজিং (Receivable Aging)
                    </h4>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/80">
                          <th className="py-2.5 px-3">গ্রাহকের নাম ও ফোন</th>
                          <th className="py-2.5 px-3">প্রকল্প ও ইউনিট</th>
                          <th className="py-2.5 px-3 text-right">মোট চুক্তি মূল্য</th>
                          <th className="py-2.5 px-3 text-right">আদায়কৃত টাকা</th>
                          <th className="py-2.5 px-3 text-right">বর্তমান বকেয়া</th>
                          <th className="py-2.5 px-3">পরবর্তী কিস্তির তারিখ</th>
                          <th className="py-2.5 px-3 text-center">এজিং স্ট্যাটাস</th>
                          <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-slate-800 text-slate-300">
                        {receivables.map((ar) => (
                          <tr key={ar.id} className="hover:bg-slate-900/50">
                            <td className="py-3 px-3">
                              <span className="font-bold text-white block">{ar.customerName}</span>
                              <span className="font-mono text-slate-400 text-[10px]">{ar.phone}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-slate-200 block">{ar.projectName}</span>
                              <span className="text-slate-400 text-[10px]">{ar.unitOrPlot}</span>
                            </td>
                            <td className="py-3 px-3 text-right">{ar.totalPrice.toLocaleString('bn-BD')} ৳</td>
                            <td className="py-3 px-3 text-right font-bold text-emerald-400">{ar.paidAmount.toLocaleString('bn-BD')} ৳</td>
                            <td className="py-3 px-3 text-right font-bold text-rose-400">{ar.dueAmount.toLocaleString('bn-BD')} ৳</td>
                            <td className="py-3 px-3 font-mono">{ar.nextInstallmentDate}</td>
                            <td className="py-3 px-3 text-center">
                              {ar.daysOverdue > 0 ? (
                                <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded font-bold">
                                  {ar.daysOverdue} দিন বাকি
                                </span>
                              ) : (
                                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                                  রেগুলার
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button 
                                onClick={() => {
                                  triggerWhatsApp(
                                    ar.phone,
                                    `*UNITY DREAM PROPERTIES LTD. কিস্তি রিমাইন্ডার*\nগ্রাহক: ${ar.customerName}\nপ্রকল্প: ${ar.projectName}\nবকেয়া: ${ar.dueAmount.toLocaleString('bn-BD')} ৳\nতারিখ: ${ar.nextInstallmentDate}\nহেল্পলাইন: ${MASTER_PHONE}`
                                  );
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-bold"
                              >
                                রিমাইন্ডার
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: বিডি ট্যাক্স ও ভ্যাট */}
              {activeTab === 'tax_vat' && (currentUser.hasAccountsAccess || currentUser.isSuperAdmin) && (
                <div className="text-xs">
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-rose-400">
                      ⚖️ বাংলাদেশী ট্যাক্স, ভ্যাট (NBR Mushak 6.3) ও উৎসে কর কর্তন রেজিস্টার
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block font-semibold">মোট উৎসে কর (TDS / AIT)</span>
                      <span className="text-2xl font-black text-rose-400 mt-1 block">
                        {totalTDSCollected.toLocaleString('bn-BD')} ৳
                      </span>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block font-semibold">মোট উৎসে ভ্যাট (VDS / NBR 6.3)</span>
                      <span className="text-2xl font-black text-amber-400 mt-1 block">
                        {totalVDSCollected.toLocaleString('bn-BD')} ৳
                      </span>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block font-semibold">ঠিকাদার রিটেনশন মানি</span>
                      <span className="text-2xl font-black text-indigo-400 mt-1 block">
                        {totalRetentionPayable.toLocaleString('bn-BD')} ৳
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ব্যালেন্স শীট ও ট্রেজারি */}
              {activeTab === 'balance_sheet' && (currentUser.hasAccountsAccess || currentUser.isSuperAdmin) && (
                <div className="text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block font-semibold">মোট ক্যাশ ব্যালেন্স (Assets)</span>
                      <span className="text-2xl font-black text-teal-400 mt-1 block">
                        {netCashInHand.toLocaleString('bn-BD')} ৳
                      </span>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block font-semibold">গ্রাহকদের মোট কিস্তি বকেয়া</span>
                      <span className="text-2xl font-black text-sky-400 mt-1 block">
                        {receivables.reduce((acc, r) => acc + r.dueAmount, 0).toLocaleString('bn-BD')} ৳
                      </span>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block font-semibold">চলতি নেট প্রফিট (YTD Net Profit)</span>
                      <span className="text-2xl font-black text-amber-400 mt-1 block">
                        {(totalCreditRevenue - totalDebitExpense).toLocaleString('bn-BD')} ৳
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: ইউজার ডাটাবেজ ও পারমিশন কন্ট্রোল */}
              {activeTab === 'admin_users' && currentUser.isSuperAdmin && (
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-red-400">
                        👑 সেন্ট্রাল ইউজার ডাটাবেজ ও পারমিশন কন্ট্রোল (Super Admin Control)
                      </h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        সুপার অ্যাডমিন হিসেবে যেকোনো ইউজারের পদবী, এক্সেস, কমিশন ও স্ট্যাটাস সম্পূর্ণ নিয়ন্ত্রণ করুন।
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowAddUserModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded shadow text-xs flex items-center gap-1.5"
                    >
                      <span>➕</span> নতুন ইউজার যুক্ত করুন
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2.5 px-3">ইউজার আইডি</th>
                          <th className="py-2.5 px-3">নাম</th>
                          <th className="py-2.5 px-3">ইমেইল</th>
                          <th className="py-2.5 px-3">মোবাইল</th>
                          <th className="py-2.5 px-3">পদবী (Role)</th>
                          <th className="py-2.5 px-3">পাসওয়ার্ড</th>
                          <th className="py-2.5 px-3">স্ট্যাটাস</th>
                          <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-slate-800 text-slate-300">
                        {usersList.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-800/40">
                            <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{user.id}</td>
                            <td className="py-3 px-3 font-bold text-white">{user.name}</td>
                            <td className="py-3 px-3 font-mono">{user.email}</td>
                            <td className="py-3 px-3 font-mono">{user.phone}</td>
                            <td className="py-3 px-3">
                              <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-amber-300">{user.password || 'N/A'}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                user.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {user.id === 'UDP-SA-001' ? (
                                <span className="text-slate-500 font-mono text-[10px]">Master Admin</span>
                              ) : (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button 
                                    onClick={() => setEditUserModal(user)}
                                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px]"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(user.email)}
                                    className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-rose-900"
                                  >
                                    ডিলিট
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </section>

      {/* ===================== ৩. প্রজেক্টস শোকেস ===================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1.5 bg-emerald-600 rounded"></span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              আমাদের অনুমোদিত ও পার্টনার প্রজেক্টসমূহ
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsData.map((project) => (
            <div 
              key={project.id} 
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img 
                    src={project.image} 
                    alt={project.name} 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-emerald-800/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow">
                    {project.tag}
                  </span>
                  <span className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded-md shadow">
                    {project.badge}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs text-slate-500 font-semibold">{project.developer}</p>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 leading-snug">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                    📍 {project.location}
                  </p>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex justify-between items-end">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">সাইজ</span>
                      <span className="font-bold text-xs text-slate-800">{project.size}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        {project.statusBadge}
                      </span>
                      <span className="font-extrabold text-sm text-emerald-700">{project.price}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button 
                  onClick={() => setSelectedProjectForTerms(project)}
                  className="w-full text-center py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
                >
                  বিস্তারিত ও বুকিং শর্তাবলী
                </button>
              </div>

            </div>
          ))}
        </div>
      </main>

      {/* ===================== ৪. প্রজেক্ট শর্তাবলী ও হোয়াটসঅ্যাপ বুকিং মোডাল ===================== */}
      {selectedProjectForTerms && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
            <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{selectedProjectForTerms.name}</h3>
                <p className="text-xs text-emerald-200 mt-0.5">{selectedProjectForTerms.location}</p>
              </div>
              <button 
                onClick={() => setSelectedProjectForTerms(null)} 
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                📋 বুকিং নিয়মাবলী ও আইনি শর্তসমূহ:
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                {selectedProjectForTerms.terms.map((term, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-gray-500 block">অফিসিয়াল বুকিং ও হেল্পলাইন</span>
                  <a href={`tel:${MASTER_PHONE}`} className="text-xs font-bold text-emerald-800 hover:underline">
                    {MASTER_PHONE}
                  </a>
                </div>
                
                <button 
                  onClick={() => {
                    triggerWhatsApp(
                      MASTER_PHONE,
                      `*UNITY DREAM PROPERTIES LTD. - বুকিং অনুসন্ধান*\nপ্রকল্পের নাম: ${selectedProjectForTerms.name}\nলোকেশন: ${selectedProjectForTerms.location}\nমূল্য/সাইজ: ${selectedProjectForTerms.price} (${selectedProjectForTerms.size})\n\nআমি এই প্রকল্পটির বুকিং ও বিস্তারিত শর্তাবলী সম্পর্কে আলোচনা করতে আগ্রহী।`
                    );
                    setSelectedProjectForTerms(null);
                  }}
                  className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow flex items-center justify-center gap-2"
                >
                  <span>💬</span> হোয়াটসঅ্যাপে বুকিং ও তথ্য পাঠান
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ৫. ইউজার ডিটেইলস ইনফো মোডাল ===================== */}
      {viewDetailsUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-700">
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
              <div>
                <h3 className="font-bold text-base text-emerald-400">{viewDetailsUser.name}</h3>
                <p className="text-xs text-slate-400">আইডি: {viewDetailsUser.id} | পদবী: {viewDetailsUser.role}</p>
              </div>
              <button onClick={() => setViewDetailsUser(null)} className="text-white hover:text-gray-300 text-xl font-bold">
                ✕
              </button>
            </div>

            <div className="p-6 text-xs space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>মোবাইল: <strong className="text-white">{viewDetailsUser.phone}</strong></div>
                <div>ইমেইল: <strong className="text-white">{viewDetailsUser.email}</strong></div>
                <div>স্ট্যাটাস: <strong className="text-emerald-400">{viewDetailsUser.status}</strong></div>
                <div>কমিশন স্থিতি: <strong className="text-amber-400">{viewDetailsUser.heldEarnings > 0 ? 'কমিশন হোল্ড রয়েছে' : 'নরমাল'}</strong></div>
              </div>

              {viewDetailsUser.customerPurchase && (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h5 className="font-bold text-amber-400 mb-2">🏡 ক্রয়কৃত ফ্ল্যাট / প্লটের বিবরণ</h5>
                  <div className="space-y-1.5 text-slate-300">
                    <div>প্রকল্প: <strong className="text-white">{viewDetailsUser.customerPurchase.projectName}</strong></div>
                    <div>ইউনিট / প্লট: <strong className="text-white">{viewDetailsUser.customerPurchase.unitOrPlot}</strong> ({viewDetailsUser.customerPurchase.area})</div>
                    <div>মোট মূল্য: <strong className="text-white">{viewDetailsUser.customerPurchase.totalPrice.toLocaleString('bn-BD')} ৳</strong></div>
                    <div>পরিশোধিত: <strong className="text-emerald-400">{viewDetailsUser.customerPurchase.paidAmount.toLocaleString('bn-BD')} ৳</strong></div>
                    <div>বকেয়া: <strong className="text-rose-400">{viewDetailsUser.customerPurchase.dueAmount.toLocaleString('bn-BD')} ৳</strong></div>
                  </div>
                </div>
              )}

              {viewDetailsUser.salesHistory && viewDetailsUser.salesHistory.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h5 className="font-bold text-emerald-400 mb-2">📋 পার্টনার বিক্রয় ও কমিশন রেকর্ড</h5>
                  {viewDetailsUser.salesHistory.map((s) => (
                    <div key={s.id} className="border-t border-slate-800 pt-2 mt-2 space-y-1 text-slate-300">
                      <div>প্রকল্প: <strong>{s.projectName}</strong> ({s.unitOrPlot})</div>
                      <div>ক্রেতার নাম: <strong>{s.customerName}</strong> ({s.customerPhone})</div>
                      <div>বিক্রয় মূল্য: <strong>{s.salePrice.toLocaleString('bn-BD')} ৳</strong></div>
                      <div>অর্জিত কমিশন: <strong className="text-amber-400">{s.commissionEarned.toLocaleString('bn-BD')} ৳</strong></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-800 px-6 py-3 text-right">
              <button 
                onClick={() => setViewDetailsUser(null)} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ৬. সুপার এডমিন ইউজার এডিট মোডাল ===================== */}
      {editUserModal && currentUser?.isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">👑 ইউজার এডিট ও অ্যাকশন কন্ট্রোল ({editUserModal.id})</h3>
              <button onClick={() => setEditUserModal(null)} className="text-white hover:text-gray-300 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 text-xs space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">পূর্ণ নাম</label>
                <input 
                  type="text" 
                  value={editUserModal.name}
                  onChange={(e) => setEditUserModal({ ...editUserModal, name: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">মোবাইল</label>
                <input 
                  type="tel" 
                  value={editUserModal.phone}
                  onChange={(e) => setEditUserModal({ ...editUserModal, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">পদবী (Role)</label>
                <select 
                  value={editUserModal.role}
                  onChange={(e) => setEditUserModal({ ...editUserModal, role: e.target.value as UserRole })}
                  className="w-full border border-gray-300 rounded p-2 font-bold"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Chairman">Chairman</option>
                  <option value="Managing Director">Managing Director</option>
                  <option value="General Manager">General Manager</option>
                  <option value="DGM">DGM</option>
                  <option value="AGM">AGM</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Business Partner">Business Partner</option>
                  <option value="Agent">Agent</option>
                  <option value="Customer">Customer</option>
                  <option value="Accounts Head">Accounts Head</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">পাসওয়ার্ড</label>
                <input 
                  type="text" 
                  value={editUserModal.password || ''}
                  onChange={(e) => setEditUserModal({ ...editUserModal, password: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">অ্যাকাউন্ট স্ট্যাটাস</label>
                <select 
                  value={editUserModal.status}
                  onChange={(e) => setEditUserModal({ ...editUserModal, status: e.target.value as 'Active' | 'Blocked' })}
                  className="w-full border border-gray-300 rounded p-2 font-bold"
                >
                  <option value="Active">Active (সক্রিয়)</option>
                  <option value="Blocked">Blocked (ব্যান / স্থগিত)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input 
                    type="checkbox" 
                    checked={editUserModal.hasAccountsAccess}
                    onChange={(e) => setEditUserModal({ ...editUserModal, hasAccountsAccess: e.target.checked })}
                  />
                  সেন্ট্রাল অ্যাকাউন্টস ও জেনারেল লেজার এক্সেস দিন
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setEditUserModal(null)} 
                  className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded shadow"
                >
                  আপডেট সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== ৭. ফুটার সেকশন ===================== */}
      <footer id="contact" className="w-full bg-slate-900 border-t border-slate-800 py-10 text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800 text-sm">
            <div>
              <h4 className="text-white font-bold text-base tracking-wide mb-2">UNITY DREAM PROPERTIES</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                BTM পার্টনার অফ পুষ্পধারা প্রপার্টিজ লি:। সেন্ট্রাল ক্লাউড ডাটাবেজ সমন্বিত রিয়েল এস্টেট ইআরপি সিস্টেম।
              </p>
              <p className="text-xs text-amber-400 mt-2 font-mono">
                Helpline: {MASTER_PHONE}
              </p>
            </div>

            <div>
              <h5 className="text-white font-semibold text-sm mb-2 flex items-center gap-1.5">
                <span>📍</span> কর্পোরেট হেড অফিস
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                ৫/৬ আউটার সার্কুলার রোড, হোসাফ টাওয়ার (৪র্থ তলা),<br />
                মালিবাগ মোড়, মালিবাগ, ঢাকা-১২১৭, বাংলাদেশ।
              </p>
            </div>

            <div>
              <h5 className="text-white font-semibold text-sm mb-2">অনুমোদিত প্রকল্পসমূহ</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                ঢাকা ওয়েস্টার্ন ভ্যালি • দ্য বে আইকন • পদ্মা ইকো সিটি • পুষ্পধারা স্যাটেলাইট সিটি • নারায়ণগঞ্জ ভূঁইগড় • রামপুরা
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p className="text-slate-400">
              © 2026 Unity Dream Properties | BTM পার্টনার অফ পুষ্পধারা প্রপার্টিজ লি:
            </p>
            <p className="text-slate-500">
              Hosaf Tower, Malibag, Dhaka | Helpline: {MASTER_PHONE}
            </p>
          </div>
        </div>
      </footer>

      {/* ===================== ৮. লগইন, রেজিস্টার ও পাসওয়ার্ড রিকভারি মোডাল ===================== */}
      {authModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>👤</span> 
                {authModal === 'login' && 'LOGIN TO ERP'}
                {authModal === 'register' && 'CREATE NEW ACCOUNT'}
                {authModal === 'forgot' && 'PASSWORD RECOVERY'}
              </h3>
              <button onClick={() => setAuthModal(null)} className="text-white hover:text-gray-200 text-xl font-bold">✕</button>
            </div>

            <div className="p-6">
              {authModal === 'login' && (
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter registered email" 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700">Password</label>
                      <button 
                        type="button"
                        onClick={() => setAuthModal('forgot')}
                        className="text-[11px] text-red-600 hover:underline font-bold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input 
                      type="password" 
                      required 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password" 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded shadow transition-colors text-sm mt-2"
                  >
                    Login
                  </button>

                  <div className="mt-4 text-center text-xs text-gray-600">
                    Don't have an account yet?{' '}
                    <button 
                      type="button"
                      onClick={() => setAuthModal('register')}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Create New Account
                    </button>
                  </div>
                </form>
              )}

              {authModal === 'forgot' && (
                <form onSubmit={handleForgotPassword}>
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      নিবন্ধিত ইমেইল লিখুন। আপনার পাসওয়ার্ড WhatsApp-এ পাঠানো হবে।
                    </p>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Registered Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter registered email" 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded shadow transition-colors text-sm"
                  >
                    Send Recovery on WhatsApp
                  </button>

                  <div className="mt-4 text-center text-xs text-gray-600 flex justify-between items-center pt-3 border-t border-gray-100">
                    <button 
                      type="button"
                      onClick={() => setAuthModal('login')}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      ← Back to Login
                    </button>
                    <a 
                      href={`https://api.whatsapp.com/send?phone=8801689333000&text=পাসওয়ার্ড%20রিকভারি%20সহায়তা%20প্রয়োজন`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 font-bold hover:underline"
                    >
                      Helpline: {MASTER_PHONE}
                    </a>
                  </div>
                </form>
              )}

              {authModal === 'register' && (
                <form onSubmit={handleRegister}>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-medium text-gray-700 mb-0.5">Full Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Enter full name" 
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:border-emerald-600" 
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-0.5">E-mail *</label>
                      <input 
                        type="email" 
                        required 
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="Enter valid e-mail" 
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:border-emerald-600" 
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-0.5">Mobile (WhatsApp Number) *</label>
                      <input 
                        type="tel" 
                        required 
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="e.g. +8801700000000" 
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:border-emerald-600 font-mono" 
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-0.5">Password *</label>
                      <input 
                        type="password" 
                        required 
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Password" 
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:border-emerald-600" 
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-0.5">Confirm Password *</label>
                      <input 
                        type="password" 
                        required 
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Retype password" 
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:border-emerald-600" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded shadow transition-colors text-sm"
                  >
                    Register & Send WhatsApp ID
                  </button>

                  <div className="mt-3 text-center text-xs text-gray-600">
                    <button 
                      type="button"
                      onClick={() => setAuthModal('login')}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Already have an account? Click for login
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== ৯. সুপার এডমিন নতুন ইউজার অ্যাড মোডাল ===================== */}
      {showAddUserModal && currentUser?.isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">👑 নতুন ইউজার যোগ করুন (Super Admin Panel)</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-white hover:text-gray-300 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleAdminCreateUser} className="p-6 text-xs space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">পূর্ণ নাম *</label>
                <input 
                  type="text" 
                  required 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Md. Hasan Ali" 
                  className="w-full border border-gray-300 rounded p-2 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">ইমেইল *</label>
                <input 
                  type="email" 
                  required 
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. hasan@unitydream.com" 
                  className="w-full border border-gray-300 rounded p-2 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">মোবাইল (WhatsApp) *</label>
                <input 
                  type="tel" 
                  required 
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+8801700000000" 
                  className="w-full border border-gray-300 rounded p-2 focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">কোম্পানি পদবী (Role) *</label>
                <select 
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full border border-gray-300 rounded p-2 font-bold"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Chairman">Chairman</option>
                  <option value="Managing Director">Managing Director</option>
                  <option value="General Manager">General Manager</option>
                  <option value="DGM">DGM</option>
                  <option value="AGM">AGM</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Business Partner">Business Partner</option>
                  <option value="Agent">Agent</option>
                  <option value="Customer">Customer</option>
                  <option value="Accounts Head">Accounts Head</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">পাসওয়ার্ড *</label>
                <input 
                  type="text" 
                  required 
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input 
                    type="checkbox" 
                    checked={newUserAccountsAccess}
                    onChange={(e) => setNewUserAccountsAccess(e.target.checked)}
                  />
                  সেন্ট্রাল অ্যাকাউন্টস ও জেনারেল লেজার এক্সেস দিন
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddUserModal(false)} 
                  className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded shadow"
                >
                  ইউজার সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}