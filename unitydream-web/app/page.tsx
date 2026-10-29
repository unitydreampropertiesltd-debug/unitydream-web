'use client';

import React, { useState, useEffect, useMemo } from 'react';

// ===================== ১. টাইপ ডেফিনিশন =====================
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

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  salesKatha: number;
  totalEarnings: number;
  heldEarnings: number;
  teamSalesKatha: number;
  teamEarnings: number;
  isSuperAdmin: boolean;
  hasAccountsAccess: boolean;
  status: 'Active' | 'Blocked' | 'Pending';
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

interface ERPTransaction {
  id: string;
  voucherNo: string;
  date: string;
  projectId: string;
  projectName: string;
  accountCode: string;
  accountName: string;
  type: 'Debit' | 'Credit';
  category: string;
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

interface LeadItem {
  id: string;
  name: string;
  phone: string;
  project: string;
  status: 'Hot' | 'Warm' | 'Cold' | 'Site Visit' | 'Booked';
  agent: string;
  date: string;
  budget: string;
}

interface InventoryUnit {
  id: string;
  project: string;
  block: string;
  unitNo: string;
  size: string;
  price: number;
  status: 'Available' | 'Booked' | 'Sold Out';
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
  status: 'Active'
};

// ===================== ২. প্রাথমিক ডাটাবেজ =====================
const generateInitialUsers = (): UserProfile[] => [
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
    id: 'UDP-CUST-301',
    name: 'Khandakar Rafiqul Alam',
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
  }
];

const INITIAL_RECEIVABLES: CustomerReceivable[] = [
  {
    id: 'AR-01',
    customerName: 'Khandakar Rafiqul Alam',
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

const INITIAL_LEADS: LeadItem[] = [
  { id: 'LD-101', name: 'মোঃ কামাল হোসেন', phone: '+8801711223344', project: 'Padma Eco-City', status: 'Hot', agent: 'MOHAMMAD ATIQUL ISLAM', date: '2026-10-25', budget: '৫২,৫০,০০০ ৳' },
  { id: 'LD-102', name: 'তানভীর আহমেদ', phone: '+8801819988776', project: 'The Bay Icon Resort', status: 'Warm', agent: 'Engr. Md Mustafizur Rahman', date: '2026-10-28', budget: '১,৫০,০০,০০০ ৳' },
  { id: 'LD-103', name: 'মেহজাবিন চৌধুরী', phone: '+8801912345678', project: 'Dhaka Western Valley', status: 'Site Visit', agent: 'Mohammad Showkat Ali', date: '2026-10-20', budget: '১৪,৫০,০০০ ৳' }
];

const INITIAL_INVENTORY: InventoryUnit[] = [
  { id: 'INV-01', project: 'Padma Eco-City', block: 'Block-A', unitNo: 'Plot # 12', size: '5 Katha', price: 5250000, status: 'Available' },
  { id: 'INV-02', project: 'The Bay Icon Resort', block: 'Floor-4', unitNo: 'Suite # 401', size: '300 Sq Ft', price: 15000000, status: 'Sold Out' },
  { id: 'INV-03', project: 'Dhaka Western Valley', block: 'Block-B', unitNo: 'Plot # 05', size: '5 Katha', price: 7250000, status: 'Available' }
];

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
    terms: ['সর্বনিম্ন প্লট সাইজ ৫ কাঠা থেকে শুরু।', 'সর্বোচ্চ ৬০টি সহজ মাসিক কিস্তিতে পরিশোধের সুযোগ।']
  },
  {
    id: '2',
    name: 'The Bay Icon International Hotel & Resort Ltd.',
    developer: 'পুষ্পধারা প্রপার্টিজ লিমিটেড / Bay Icon Ltd.',
    location: 'কলাতলী মেরিন ড্রাইভ, কক্সবাজার',
    tag: '5-Star Luxury Hospitality & Commercial',
    badge: 'Under Construction',
    size: '১০০ থেকে ৫০০০ Sq Ft / Fractional Share',
    price: '৫০,০০০ ৳ / প্রতি স্কয়ার ফিট',
    statusBadge: 'শেয়ার ইনভেস্টমেন্ট',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    terms: ['আজীবন সাব-কবলা দলিল ও নিয়মিত লভ্যাংশ (ROI) পাওয়ার আইনি নিশ্চয়তা।']
  },
  {
    id: '3',
    name: 'Padma Eco-City',
    developer: 'পুষ্পধারা প্রপার্টিজ লিমিটেড',
    location: 'ঢাকা-মাওয়া এক্সপ্রেসওয়ে (পদ্মা সেতু সংলগ্ন)',
    tag: 'Township / Mega Plot Project',
    badge: 'Ongoing Flagship',
    size: 'সর্বনিম্ন ৫ কাঠা প্লট',
    price: '১০,৫০,০০০ ৳ / কাঠা থেকে শুরু',
    statusBadge: 'প্যাকেজ / রেট',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    terms: ['পদ্মা সেতু সংলগ্ন আধুনিক ইকো-সিটি এবং সহজ কিস্তি সুবিধা।']
  }
];

export default function UnityDreamPortal() {
  const [usersList, setUsersList] = useState<UserProfile[]>(generateInitialUsers());
  const [transactions, setTransactions] = useState<ERPTransaction[]>(INITIAL_TRANSACTIONS);
  const [receivables, setReceivables] = useState<CustomerReceivable[]>(INITIAL_RECEIVABLES);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(MASTER_SUPER_ADMIN);

  // CRM State
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [inventory, setInventory] = useState<InventoryUnit[]>(INITIAL_INVENTORY);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadProject, setNewLeadProject] = useState('Dhaka Western Valley');
  const [newLeadStatus, setNewLeadStatus] = useState<'Hot' | 'Warm' | 'Cold' | 'Site Visit'>('Hot');
  const [newLeadBudget, setNewLeadBudget] = useState('');

  // UI States
  const [showERP, setShowERP] = useState(true);
  // ডিফল্টভাবে CRM ট্যাব ওপেন থাকবে
  const [activeTab, setActiveTab] = useState<'crm' | 'partner_list' | 'installments' | 'inventory' | 'journal' | 'costing' | 'tax' | 'users'>('crm');

  const triggerWhatsApp = (phone: string, text: string) => {
    const formatted = phone.replace(/[^0-9]/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadPhone.trim()) {
      alert('নাম এবং মোবাইল নম্বর দিন!');
      return;
    }
    const newL: LeadItem = {
      id: `LD-${Math.floor(100 + Math.random() * 900)}`,
      name: newLeadName.trim(),
      phone: newLeadPhone.trim(),
      project: newLeadProject,
      status: newLeadStatus,
      agent: currentUser?.name || 'MOHAMMAD ATIQUL ISLAM',
      date: new Date().toISOString().split('T')[0],
      budget: newLeadBudget.trim() || 'আলোচনা সাপেক্ষে'
    };
    setLeads([newL, ...leads]);
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadBudget('');
    alert(`নতুন লিড (${newL.name}) সিআরএম তালিকায় সফলভাবে যুক্ত হয়েছে!`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-between">
      
      {/* ১. হেডার */}
      <header className="sticky top-0 z-50 bg-[#090f1d] border-b border-slate-800 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">UNITY DREAM PROPERTIES</h1>
            <p className="text-xs text-emerald-400 font-medium">BTM পার্টনার অফ পুষ্পধারা প্রপার্টিজ লিঃ</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white">{currentUser?.name}</span>
              <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] border border-emerald-800 font-semibold">{currentUser?.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ২. ক্লাউড ERP ড্যাশবোর্ড সেকশন */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 w-full">
        <div className="bg-[#0b1426] rounded-2xl p-5 border border-slate-800 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-semibold border border-emerald-800 mb-2">
                ● সেন্ট্রাল ক্লাউড ডাটাবেজ সংযুক্ত (অনলাইন সিংকিং সক্রিয়)
              </span>
              <h2 className="text-lg md:text-xl font-bold text-white">
                Unity Dream Properties — সেন্ট্রাল একাউন্টিং, প্রজেক্ট কস্টিং ও রিয়েল এস্টেট ERP
              </h2>
            </div>
            <button 
              onClick={() => setShowERP(!showERP)} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
            >
              {showERP ? 'ERP বন্ধ করুন' : 'সেন্ট্রাল ERP খুলুন'}
            </button>
          </div>

          {showERP && (
            <div className="mt-4">
              
              {/* সবার উপরে স্পষ্ট বাটনসমূহ (সবার প্রথমে CRM) */}
              <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-800 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('crm')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'crm' 
                      ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🎯 ১. লিড ও CRM ম্যানেজমেন্ট
                </button>

                <button
                  onClick={() => setActiveTab('partner_list')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'partner_list' 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ★ পার্টনার লিস্ট (সেলস ও কমিশন)
                </button>

                <button
                  onClick={() => setActiveTab('installments')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'installments' 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  👥 কাস্টমার কিস্তি ও এজিং (AR)
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'inventory' 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🗺️ প্লট ও ফ্ল্যাট ইনভেন্টরি
                </button>

                <button
                  onClick={() => setActiveTab('journal')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'journal' 
                      ? 'bg-amber-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  📒 জেনারেল জার্নাল
                </button>

                <button
                  onClick={() => setActiveTab('costing')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'costing' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🏗️ প্রজেক্ট কস্টিং ও WIP
                </button>

                <button
                  onClick={() => setActiveTab('tax')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === 'tax' 
                      ? 'bg-red-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ⚖️ বিডি ট্যাক্স ও ভ্যাট (Mushak 6.3)
                </button>
              </div>

              {/* ট্যাব ১: CRM ও লিড মডিউল */}
              {activeTab === 'crm' && (
                <div className="pt-4 space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                        🎯 লিড ও কাস্টমার রিলেশনশিপ ম্যানেজমেন্ট (Real Estate CRM)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">নতুন আগ্রহী ক্লায়েন্টদের তথ্য, ফলো-আপ পাইপলাইন ও সরাসরি সাইট ভিজিট ইনভাইটেশন</p>
                    </div>
                    <span className="text-xs bg-emerald-950 border border-emerald-800 text-emerald-400 px-3 py-1 rounded-full font-bold">
                      মোট লিড: {leads.length} টি
                    </span>
                  </div>

                  {/* লিড এন্ট্রি ফর্ম */}
                  <form onSubmit={handleAddNewLead} className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">গ্রাহকের নাম *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="নাম লিখুন..." 
                        value={newLeadName}
                        onChange={(e) => setNewLeadName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">মোবাইল নম্বর *</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="017xxxxxxxx" 
                        value={newLeadPhone}
                        onChange={(e) => setNewLeadPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">প্রকল্প</label>
                      <select 
                        value={newLeadProject}
                        onChange={(e) => setNewLeadProject(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      >
                        {projectsData.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">পাইপলাইন স্ট্যাটাস</label>
                      <select 
                        value={newLeadStatus}
                        onChange={(e) => setNewLeadStatus(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                      >
                        <option value="Hot">🔥 Hot (খুব আগ্রহী)</option>
                        <option value="Warm">⚡ Warm (আলোচনা চলছে)</option>
                        <option value="Site Visit">📍 Site Visit (ভিজিট শিডিউল)</option>
                        <option value="Cold">❄️ Cold (পরে জানাবে)</option>
                      </select>
                    </div>
                    <div>
                      <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs transition">
                        + নতুন লিড সেভ করুন
                      </button>
                    </div>
                  </form>

                  {/* লিড টেবিল */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-3">লিড আইডি</th>
                          <th className="p-3">গ্রাহকের নাম ও ফোন</th>
                          <th className="p-3">প্রকল্প</th>
                          <th className="p-3">বাজেট</th>
                          <th className="p-3">স্ট্যাটাস</th>
                          <th className="p-3">অ্যাসাইনড মেন্টর</th>
                          <th className="p-3 text-center">হোয়াটসঅ্যাপে ভিজিট ইনভাইট</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {leads.map((l) => (
                          <tr key={l.id} className="hover:bg-slate-900/60">
                            <td className="p-3 font-mono text-emerald-400 font-bold">{l.id}</td>
                            <td className="p-3">
                              <div className="font-bold text-white">{l.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{l.phone}</div>
                            </td>
                            <td className="p-3">{l.project}</td>
                            <td className="p-3 font-mono text-amber-400">{l.budget}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                l.status === 'Hot' ? 'bg-red-950 text-red-400 border border-red-800' :
                                l.status === 'Warm' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                                l.status === 'Site Visit' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                {l.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300">{l.agent}</td>
                            <td className="p-3 text-center">
                              <button 
                                onClick={() => triggerWhatsApp(l.phone, `*UNITY DREAM PROPERTIES LTD. সাইট ভিজিট ইনভাইটেশন*\nপ্রিয় ${l.name},\n${l.project} প্রকল্পের সাইট পরিদর্শনের জন্য আপনাকে স্বাগতম।\nহেল্পলাইন: ${MASTER_PHONE}`)}
                                className="bg-[#25D366] hover:bg-[#1EBE5D] text-white px-3 py-1 rounded text-[11px] font-bold"
                              >
                                শিডিউল পাঠান
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ট্যাব ২: পার্টনার লিস্ট */}
              {activeTab === 'partner_list' && (
                <div className="pt-4 text-xs space-y-3">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400">★ পার্টনার ও টিম পারফরম্যান্স নেটওয়ার্ক</h4>
                      <p className="text-slate-400 text-[11px]">সুপার অ্যাডমিন: MOHAMMAD ATIQUL ISLAM | অধিভুক্ত সদস্য: ১০০ জন</p>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-3">আইডি ও নাম</th>
                          <th className="p-3">পদবী</th>
                          <th className="p-3">মোবাইল</th>
                          <th className="p-3 text-right">ব্যক্তিগত সেলস</th>
                          <th className="p-3 text-right">অর্জিত কমিশন</th>
                          <th className="p-3 text-right">টিম সেলস</th>
                          <th className="p-3 text-right">টিম ওভাররাইড</th>
                          <th className="p-3 text-center">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {usersList.slice(0, 10).map((u) => (
                          <tr key={u.id} className="hover:bg-slate-900/60">
                            <td className="p-3">
                              <div className="font-bold text-white">{u.name}</div>
                              <div className="text-[10px] text-emerald-400 font-mono">{u.id}</div>
                            </td>
                            <td className="p-3">{u.role}</td>
                            <td className="p-3 font-mono text-[11px]">{u.phone}</td>
                            <td className="p-3 text-right text-emerald-400 font-bold">{u.salesKatha} কাঠা</td>
                            <td className="p-3 text-right text-amber-400 font-bold">{u.totalEarnings.toLocaleString('bn-BD')} ৳</td>
                            <td className="p-3 text-right">{u.teamSalesKatha} কাঠা</td>
                            <td className="p-3 text-right text-purple-400 font-bold">{u.teamEarnings.toLocaleString('bn-BD')} ৳</td>
                            <td className="p-3 text-center">
                              <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-800">
                                {u.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ট্যাব ৩: কাস্টমার কিস্তি ও এজিং */}
              {activeTab === 'installments' && (
                <div className="pt-4 text-xs space-y-3">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-sm font-bold text-sky-400">👥 কাস্টমার ইনভেস্টমেন্ট ট্র্যাকিং ও রিসিভেবল এজিং (Receivable Aging)</h4>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-3">গ্রাহকের নাম ও ফোন</th>
                          <th className="p-3">প্রকল্প ও ইউনিট</th>
                          <th className="p-3 text-right">মোট চুক্তি মূল্য</th>
                          <th className="p-3 text-right">আদায়কৃত টাকা</th>
                          <th className="p-3 text-right">বর্তমান বকেয়া</th>
                          <th className="p-3">পরবর্তী কিস্তির তারিখ</th>
                          <th className="p-3 text-center">এজিং স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {receivables.map((ar) => (
                          <tr key={ar.id} className="hover:bg-slate-900/60">
                            <td className="p-3">
                              <div className="font-bold text-white">{ar.customerName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{ar.phone}</div>
                            </td>
                            <td className="p-3">{ar.projectName} - {ar.unitOrPlot}</td>
                            <td className="p-3 text-right font-mono">{ar.totalPrice.toLocaleString('bn-BD')} ৳</td>
                            <td className="p-3 text-right font-bold text-emerald-400 font-mono">{ar.paidAmount.toLocaleString('bn-BD')} ৳</td>
                            <td className="p-3 text-right font-bold text-red-400 font-mono">{ar.dueAmount.toLocaleString('bn-BD')} ৳</td>
                            <td className="p-3 font-mono">{ar.nextInstallmentDate}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ar.daysOverdue > 0 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              }`}>
                                {ar.daysOverdue > 0 ? `${ar.daysOverdue} দিন বাকি` : 'রেগুলার'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ট্যাব ৪: ইনভেন্টরি */}
              {activeTab === 'inventory' && (
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {inventory.map(inv => (
                    <div key={inv.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-white text-sm">{inv.unitNo}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'Available' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1">{inv.project} ({inv.block})</p>
                      <p className="text-slate-500">সাইজ: {inv.size}</p>
                      <p className="text-emerald-400 font-bold mt-2">{inv.price.toLocaleString('bn-BD')} ৳</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ট্যাব ৫: জার্নাল */}
              {activeTab === 'journal' && (
                <div className="pt-4 text-xs">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-3">ভাউচার নং</th>
                          <th className="p-3">তারিখ</th>
                          <th className="p-3">প্রকল্প</th>
                          <th className="p-3">খাত</th>
                          <th className="p-3 text-right">টাকার পরিমাণ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {transactions.map(t => (
                          <tr key={t.id}>
                            <td className="p-3 font-mono text-emerald-400">{t.voucherNo}</td>
                            <td className="p-3">{t.date}</td>
                            <td className="p-3">{t.projectName}</td>
                            <td className="p-3">{t.category}</td>
                            <td className="p-3 text-right font-bold text-white font-mono">{t.grossAmount.toLocaleString('bn-BD')} ৳</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ট্যাব ৬: প্রজেক্ট কস্টিং */}
              {activeTab === 'costing' && (
                <div className="pt-4 text-xs">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="font-bold text-blue-400">🏗️ প্রজেক্ট কস্টিং ও চলতি WIP মূল্য</h4>
                    <p className="text-slate-400">Dhaka Western Valley: চলতি WIP মূল্য ৭,৭০,০০০ ৳</p>
                    <p className="text-slate-400">The Bay Icon Resort: চলতি WIP মূল্য ৮,৫০,০০০ ৳</p>
                  </div>
                </div>
              )}

              {/* ট্যাব ৭: ট্যাক্স ও ভ্যাট */}
              {activeTab === 'tax' && (
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                    <span className="text-slate-400 block font-semibold">মোট উৎসে কর (TDS / AIT)</span>
                    <span className="text-2xl font-black text-rose-400 mt-1 block">৫৯,৭৫০ ৳</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                    <span className="text-slate-400 block font-semibold">মোট উৎসে ভ্যাট (VDS / NBR 6.3)</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block">৭৯,৭৫০ ৳</span>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </section>

      {/* ৩. অনুমোদিত প্রজেক্টসমূহ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h2 className="text-xl md:text-2xl font-extrabold text-white mb-6">আমাদের অনুমোদিত ও পার্টনার প্রজেক্টসমূহ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projectsData.map((project) => (
            <div key={project.id} className="bg-[#0b1426] border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
              <div>
                <img src={project.image} alt={project.name} className="w-full h-48 object-cover" />
                <div className="p-5 text-xs">
                  <p className="text-slate-400">{project.developer}</p>
                  <h3 className="text-base font-bold text-white mt-1">{project.name}</h3>
                  <p className="text-slate-400 mt-1">📍 {project.location}</p>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">{project.size}</span>
                    <span className="text-emerald-400 font-bold">{project.price}</span>
                  </div>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button 
                  onClick={() => triggerWhatsApp(MASTER_PHONE, `*UNITY DREAM PROPERTIES LTD. - বুকিং অনুসন্ধান*\nপ্রকল্পের নাম: ${project.name}`)}
                  className="w-full text-center py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition"
                >
                  বিস্তারিত ও বুকিং শর্তাবলী
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ৪. ফুটার */}
      <footer className="w-full bg-[#080d1a] border-t border-slate-800 py-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1">
          <p>© 2026 Unity Dream Properties | BTM পার্টনার অফ পুষ্পধারা প্রপার্টিজ লিঃ</p>
          <p>হোসাফ টাওয়ার, মালিবাগ, ঢাকা | হেল্পলাইন: {MASTER_PHONE}</p>
        </div>
      </footer>

    </div>
  );
}