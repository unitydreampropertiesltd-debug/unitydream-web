'use client';

import React, { useState } from 'react';

// টাইপস্ক্রিপ্ট টাইপ ডিফাইন করা
interface InstallmentItem {
  no: number;
  amount: string;
  dueDate: string;
  status: 'Unpaid' | 'Paid' | 'Overdue';
}

export default function BookingInstallmentManager() {
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('Dhaka Western Valley');
  const [unitNo, setUnitNo] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [downPayment, setDownPayment] = useState<string>('');
  const [installmentsCount, setInstallmentsCount] = useState<number>(12);
  const [previewSchedule, setPreviewSchedule] = useState<InstallmentItem[]>([]);

  // কিস্তি স্বয়ংক্রিয় হিসাব করার ফাংশন
  const calculateInstallments = () => {
    const total = parseFloat(totalAmount) || 0;
    const down = parseFloat(downPayment) || 0;
    const count = parseInt(installmentsCount.toString(), 10) || 1;

    if (total <= down || count <= 0) return;

    const remaining = total - down;
    const monthlyAmount = (remaining / count).toFixed(2);

    const schedule: InstallmentItem[] = [];
    const today = new Date();

    for (let i = 1; i <= count; i++) {
      const dueDate = new Date(today.getFullYear(), today.getMonth() + i, today.getDate());
      schedule.push({
        no: i,
        amount: monthlyAmount,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'Unpaid'
      });
    }
    setPreviewSchedule(schedule);
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: 'auto', color: '#1f2937' }}>
      <h2 style={{ color: '#047857', borderBottom: '2px solid #047857', paddingBottom: '8px' }}>
        নতুন বুকিং ও কিস্তি প্ল্যান তৈরি করুন
      </h2>

      {/* কাস্টমার ও ইউনিট ডিটেইলস */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
        <div>
          <label style={{ fontWeight: '600' }}>গ্রাহকের নাম:</label>
          <input 
            type="text" 
            style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
            value={customerName} 
            onChange={(e) => setCustomerName(e.target.value)} 
            placeholder="উদাঃ মোঃ রফিকুল ইসলাম"
          />
        </div>
        <div>
          <label style={{ fontWeight: '600' }}>মোবাইল নম্বর:</label>
          <input 
            type="text" 
            style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
            value={customerPhone} 
            onChange={(e) => setCustomerPhone(e.target.value)} 
            placeholder="017xxxxxxxx"
          />
        </div>
        <div>
          <label style={{ fontWeight: '600' }}>প্রজেক্টের নাম:</label>
          <select 
            style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
            value={projectName} 
            onChange={(e) => setProjectName(e.target.value)}
          >
            <option value="Dhaka Western Valley">Dhaka Western Valley</option>
            <option value="The Bay Icon">The Bay Icon</option>
            <option value="Padma Eco-City">Padma Eco-City</option>
          </select>
        </div>
        <div>
          <label style={{ fontWeight: '600' }}>প্লট / ফ্ল্যাট নম্বর:</label>
          <input 
            type="text" 
            style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
            value={unitNo} 
            onChange={(e) => setUnitNo(e.target.value)} 
            placeholder="Plot-12, Road-04"
          />
        </div>
        <div>
          <label style={{ fontWeight: '600' }}>মোট মূল্য (টাকা):</label>
          <input 
            type="number" 
            style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
            value={totalAmount} 
            onChange={(e) => setTotalAmount(e.target.value)} 
            placeholder="2500000"
          />
        </div>
        <div>
          <label style={{ fontWeight: '600' }}>ডাউনপেমেন্ট (টাকা):</label>
          <input 
            type="number" 
            style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
            value={downPayment} 
            onChange={(e) => setDownPayment(e.target.value)} 
            placeholder="500000"
          />
        </div>
        <div>
          <label style={{ fontWeight: '600' }}>মোট কিস্তির সংখ্যা (মাস):</label>
          <input 
            type="number" 
            style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
            value={installmentsCount} 
            onChange={(e) => setInstallmentsCount(Number(e.target.value))} 
          />
        </div>
      </div>

      <button 
        type="button"
        onClick={calculateInstallments}
        style={{ marginTop: '20px', padding: '10px 20px', background: '#047857', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        কিস্তির শিডিউল প্রিভিউ দেখুন
      </button>

      {/* কিস্তির তালিকা টেবিল */}
      {previewSchedule.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#111827' }}>প্রত্যাশিত কিস্তি বিবরণী</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '12px' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>কিস্তি নং</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>টাকার পরিমাণ (টাকা)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>জমার শেষ তারিখ</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {previewSchedule.map((item) => (
                <tr key={item.no}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>কিস্তি #{item.no}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.amount} ৳</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.dueDate}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', color: '#d97706', fontWeight: 'bold' }}>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}