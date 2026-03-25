"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Utensils, 
  Bed, 
  Users, 
  CreditCard, 
  ArrowRight,
  Filter,
  Download,
  Clock
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface AuditEntry {
  period: string;
  roomRevenue: string | number;
  foodRevenue: string | number;
  membershipRevenue: string | number;
  totalGrossETB: string | number;
  roomCount: number;
  orderCount: number;
  membershipCount: number;
}

export default function AuditLogPage() {
  const [view, setView] = useState<'overview' | 'ROOM' | 'FOOD' | 'MEMBERSHIP'>('overview');
  const [interval, setInterval] = useState<'day' | 'week' | 'month'>('day');
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<AuditEntry[]>([]);
  const [details, setDetails] = useState<any[]>([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [activeRooms, setActiveRooms] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      if (view === 'overview') {
        const [reportRes, allTransRes] = await Promise.all([
          fetch(`/api/admin/audit?interval=${interval}${startDate ? `&startDate=${startDate}` : ""}${endDate ? `&endDate=${endDate}` : ""}`),
          fetch(`/api/admin/audit?type=ALL${startDate ? `&startDate=${startDate}` : ""}${endDate ? `&endDate=${endDate}` : ""}`)
        ]);

        if (reportRes.ok) {
          const result = await reportRes.json();
          setData(result.report);
          setTotalRooms(result.totalRooms);
          setActiveRooms(result.activeRooms);
          setAvailableRooms(result.availableRooms);
          setAllRooms(result.allRooms);
        }
        if (allTransRes.ok) {
          const result = await allTransRes.json();
          setAllTransactions(result);
        }
      } else {
        const res = await fetch(`/api/admin/audit?type=${view}${startDate ? `&startDate=${startDate}` : ""}${endDate ? `&endDate=${endDate}` : ""}`);
        if (res.ok) {
          const result = await res.json();
          setDetails(result);
        }
      }
    } catch (error) {
      console.error("Failed to fetch audit data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [view, interval, startDate, endDate]);

  const totals = data.reduce((acc, curr) => ({
    room: acc.room + Number(curr.roomRevenue),
    food: acc.food + Number(curr.foodRevenue),
    membership: acc.membership + Number(curr.membershipRevenue),
    total: acc.total + Number(curr.totalGrossETB),
    roomCount: acc.roomCount + Number(curr.roomCount),
    orderCount: acc.orderCount + Number(curr.orderCount),
    membershipCount: acc.membershipCount + Number(curr.membershipCount)
  }), { room: 0, food: 0, membership: 0, total: 0, roomCount: 0, orderCount: 0, membershipCount: 0 });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Financial Audit Log</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2 italic">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Performance Tracking & Revenue Analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          {view === 'overview' && (
            <div className="bg-slate-900 p-1 rounded-2xl flex shadow-xl">
               {(['day', 'week', 'month'] as const).map((t) => (
                 <button
                   key={t}
                   onClick={() => setInterval(t)}
                   className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                     interval === t ? "bg-amber-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                   }`}
                 >
                   {t === 'day' ? 'Daily' : t === 'week' ? 'Weekly' : 'Monthly'}
                 </button>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* View Selector (The "Room", "Order", "Membership" buttons) */}
      <div className="flex flex-wrap gap-4 items-center border-b border-slate-200 pb-2">
        <TabButton active={view === 'overview'} onClick={() => setView('overview')} label="Executive Overview" icon={<BarChart3 className="w-4 h-4" />} />
        <TabButton 
          active={view === 'ROOM'} 
          onClick={() => setView('ROOM')} 
          label={`Room Revenue (${activeRooms} Active)`} 
          icon={<Bed className="w-4 h-4" />} 
        />
        <TabButton active={view === 'FOOD'} onClick={() => setView('FOOD')} label="Order Revenue" icon={<Utensils className="w-4 h-4" />} />
        <TabButton active={view === 'MEMBERSHIP'} onClick={() => setView('MEMBERSHIP')} label="Membership Revenue" icon={<Users className="w-4 h-4" />} />
      </div>

      {/* Date Filters */}
      <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white/80 backdrop-blur-md overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row items-end gap-6 bg-slate-50/50">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-amber-500 outline-none transition-all bg-white font-medium text-slate-700" 
              />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-amber-500 outline-none transition-all bg-white font-medium text-slate-700" 
              />
            </div>
          </div>
          <Button 
            className="h-14 px-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl transition-all active:scale-95"
            onClick={() => { setStartDate(""); setEndDate(""); }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Room Income" 
          amount={totals.room} 
          icon={<Bed className="w-6 h-6" />} 
          color="amber" 
          delay={0}
          stats={`${activeRooms} Active / ${availableRooms} Available`}
          onClick={() => setView('ROOM')}
        />
        <SummaryCard 
          title="Restaurant Income" 
          amount={totals.food} 
          icon={<Utensils className="w-6 h-6" />} 
          color="emerald" 
          delay={0.1}
          stats={`${totals.orderCount} Orders Fulfilled`}
          onClick={() => setView('FOOD')}
        />
        <SummaryCard 
          title="Membership Fees" 
          amount={totals.membership} 
          icon={<Users className="w-6 h-6" />} 
          color="blue" 
          delay={0.2}
          stats={`${totals.membershipCount} Active Memberships`}
          onClick={() => setView('MEMBERSHIP')}
        />
        <SummaryCard 
          title="Total Audit" 
          amount={totals.total} 
          icon={<CreditCard className="w-6 h-6" />} 
          color="slate" 
          delay={0.3}
          isTotal
        />
      </div>

      {/* Data Section */}
      <div className="space-y-10">
        {view === 'ROOM' && allRooms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {allRooms.map((room) => (
              <div 
                key={room.id}
                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                  room.status === 'OCCUPIED' 
                    ? "bg-amber-50 border-amber-200 text-amber-700 shadow-inner" 
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Room</div>
                <div className="text-2xl font-serif font-bold">{room.roomNumber}</div>
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                   room.status === 'OCCUPIED' ? "bg-amber-200" : "bg-emerald-200"
                }`}>
                  {room.status}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-serif font-bold text-slate-900">
                  {view === 'overview' ? 'Historical Breakdown' : `${view.charAt(0) + view.slice(1).toLowerCase()} Detail Ledger`}
                </CardTitle>
                <CardDescription className="italic">
                  {view === 'overview' ? 'Aggregated revenue streams per period' : 'Individual transaction records for deep auditing'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {view === 'overview' ? (
                <AuditOverviewTable data={data} loading={loading} />
              ) : (
                <DetailedAuditTable type={view} data={details} loading={loading} />
              )}
            </div>
          </CardContent>
        </Card>

        {view === 'overview' && allTransactions.length > 0 && (
          <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-serif font-bold text-slate-900 font-serif">Daily Transaction Ledger</CardTitle>
                  <CardDescription className="italic underline decoration-amber-500/30">Complete record of all orders and income activities</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <DetailedAuditTable type="ALL" data={allTransactions} loading={loading} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all font-bold uppercase tracking-widest text-[10px] ${
        active 
          ? "border-amber-600 text-amber-600 bg-amber-50/50" 
          : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function AuditOverviewTable({ data, loading }: { data: AuditEntry[], loading: boolean }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-slate-50/50">
          <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Period</th>
          <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rooms</th>
          <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Restaurant</th>
          <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Memberships</th>
          <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total (ETB)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <TableLoading colSpan={5} />
          ) : data.length === 0 ? (
            <TableEmpty colSpan={5} />
          ) : (
            data.map((row, idx) => (
              <motion.tr 
                key={row.period}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-8 py-6 font-bold text-slate-700 flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  {row.period}
                </td>
                <td className="px-8 py-6 text-right font-medium text-slate-600">{Number(row.roomRevenue).toLocaleString()} ETB</td>
                <td className="px-8 py-6 text-right font-medium text-slate-600">{Number(row.foodRevenue).toLocaleString()} ETB</td>
                <td className="px-8 py-6 text-right font-medium text-slate-600">{Number(row.membershipRevenue).toLocaleString()} ETB</td>
                <td className="px-8 py-6 text-right font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {Number(row.totalGrossETB).toLocaleString()} ETB
                </td>
              </motion.tr>
            ))
          )}
        </AnimatePresence>
      </tbody>
    </table>
  );
}

function DetailedAuditTable({ type, data, loading }: { type: string, data: any[], loading: boolean }) {
  if (loading) return <table className="w-full"><tbody><TableLoading colSpan={4} /></tbody></table>;
  if (data.length === 0) return <table className="w-full"><tbody><TableEmpty colSpan={4} /></tbody></table>;

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-slate-50/50">
          <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
          <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Entity Info</th>
          <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
          <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((row, idx) => {
          const rowType = type === "ALL" ? row.type : type;
          return (
            <motion.tr 
              key={row.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="hover:bg-slate-50/50 transition-colors group"
            >
              <td className="px-8 py-6 text-slate-500 font-medium whitespace-nowrap">
                {new Date(row.createdAt).toLocaleDateString()}
              </td>
              <td className="px-8 py-6">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">
                    {rowType === 'ROOM' ? row.guestName : rowType === 'FOOD' ? row.customerName : row.memberName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {rowType === 'ROOM' ? `Room ${row.roomId}` : rowType === 'FOOD' ? `Order ID: ${row.id}` : `Member ID: ${row.membershipId}`}
                  </span>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                  rowType === 'ROOM' ? 'bg-amber-100 text-amber-600' : 
                  rowType === 'FOOD' ? 'bg-emerald-100 text-emerald-600' : 
                  'bg-blue-100 text-blue-600'
                }`}>
                  {rowType === 'ROOM' ? 'Booking' : rowType === 'FOOD' ? (row.orderType || 'Order') : (row.membershipType || 'Membership')}
                </span>
              </td>
              <td className="px-8 py-6 text-right font-black text-slate-900">
                 {Number(row.amount).toLocaleString()} ETB
              </td>
            </motion.tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TableLoading({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-8 py-20 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">Reconciling Ledgers...</p>
        </div>
      </td>
    </tr>
  );
}

function TableEmpty({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-8 py-20 text-center text-slate-400 italic">No records found.</td>
    </tr>
  );
}

function SummaryCard({ title, amount, icon, color, delay, stats, onClick, isTotal = false }: { 
  title: string, 
  amount: number, 
  icon: React.ReactNode, 
  color: 'amber' | 'emerald' | 'blue' | 'slate',
  delay: number,
  stats?: string,
  onClick?: () => void,
  isTotal?: boolean
}) {
  const colors = {
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    slate: "bg-slate-900 text-white"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={onClick ? "cursor-pointer" : ""}
    >
      <Card className={`border-0 shadow-xl rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-500 ${isTotal ? 'bg-slate-900' : 'bg-white'}`}>
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${isTotal ? 'bg-white/10 text-amber-500' : colors[color]}`}>
              {icon}
            </div>
            {amount > 0 && (
               <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                 <TrendingUp className="w-3 h-3" />
                 Active
               </div>
            )}
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${isTotal ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className={`text-3xl font-serif font-bold ${isTotal ? 'text-white' : 'text-slate-900'}`}>{amount.toLocaleString()}</h3>
            <span className={`text-[10px] font-bold ${isTotal ? 'text-amber-500' : 'text-slate-400'}`}>ETB</span>
          </div>
          {stats && (
            <p className={`text-[10px] font-medium italic ${isTotal ? 'text-slate-500' : 'text-slate-400'}`}>
              {stats}
            </p>
          )}
        </CardContent>
        {!isTotal && (
          <div className="h-1.5 w-full bg-slate-50 overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ delay: delay + 0.5, duration: 1.5, ease: "easeOut" }}
              className={`h-full w-full ${
                color === 'amber' ? 'bg-amber-500' : 
                color === 'emerald' ? 'bg-emerald-500' : 
                'bg-blue-500'
              }`}
            />
          </div>
        )}
      </Card>
    </motion.div>
  );
}
