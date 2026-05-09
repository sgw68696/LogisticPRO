"use client";

import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import {
  Dialog, DialogBody, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getInvoices, createInvoice,
  getExpenseData,
} from "@/services/financeService";
import { type Invoice } from "@/data/mockData";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Plus, Search, SlidersHorizontal, MoreHorizontal,
  FileText, Eye, Edit, Download,
  IndianRupee, TrendingDown, Receipt,
  CheckCircle, Clock,
} from "lucide-react";

// ── Shared styles ───────────────────────────
const inputCls = `
  w-full h-10 px-3
  bg-muted/40 border border-border
  rounded-[9px] text-[0.84rem] text-foreground
  outline-none placeholder:text-muted-foreground
  transition-all duration-200
  focus:border-primary/60 focus:bg-primary/5
  focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.12)]
`;

const selectTriggerCls = `
  h-10 text-[0.84rem]
  bg-muted/40 border-border rounded-[9px]
  focus:ring-0 focus:border-primary/60
`;

const FieldLabel = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
  <label
    htmlFor={htmlFor}
    className="block text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-1.5"
  >
    {children}
  </label>
);

// ── Types ───────────────────────────────────
interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  vendor: string;
  date: string;
  status: string;
}

// ── Category icon map ───────────────────────
const categoryColors: Record<string, string> = {
  Fuel:        'bg-orange-500/10 border-orange-500/20 text-orange-400',
  Maintenance: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  Salaries:    'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  Utilities:   'bg-sky-500/10 border-sky-500/20 text-sky-400',
  Insurance:   'bg-violet-500/10 border-violet-500/20 text-violet-400',
  Other:       'bg-muted/60 border-border/60 text-muted-foreground',
};

function CategoryPill({ category }: { category: string }) {
  const color = categoryColors[category] ?? categoryColors.Other;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-bold border ${color}`}>
      {category}
    </span>
  );
}

export default function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("invoices");
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({
    customerName: "", customerId: "", orderId: "",
    amount: 0, tax: 0, dueDate: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    category: "", description: "", amount: 0, vendor: "", date: "",
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [invoicesData, expenseData] = await Promise.all([
      getInvoices(), getExpenseData(),
    ]);
    setInvoices(invoicesData);
    setExpenses([
      { id: "exp-001", category: "Fuel",        description: "Monthly fuel costs",      amount: expenseData.fuel,        vendor: "Indian Oil",       date: "2025-01-15", status: "Paid" },
      { id: "exp-002", category: "Maintenance", description: "Vehicle maintenance",     amount: expenseData.maintenance, vendor: "AutoCare Services", date: "2025-01-10", status: "Paid" },
      { id: "exp-003", category: "Salaries",    description: "Staff salaries",          amount: expenseData.staff,       vendor: "Payroll",           date: "2025-01-01", status: "Paid" },
      { id: "exp-004", category: "Other",       description: "Miscellaneous expenses",  amount: expenseData.other,       vendor: "Various",           date: "2025-01-05", status: "Pending" },
    ]);
    setLoading(false);
  };

  const handleAddInvoice = async () => {
    await createInvoice({
      customerName: invoiceForm.customerName,
      customerId: invoiceForm.customerId || `CUST-${Date.now()}`,
      orderId: invoiceForm.orderId || `ORD-${Date.now()}`,
      amount: invoiceForm.amount + invoiceForm.tax,
      dueDate: invoiceForm.dueDate,
    });
    setIsAddInvoiceOpen(false);
    setInvoiceForm({ customerName: "", customerId: "", orderId: "", amount: 0, tax: 0, dueDate: "" });
    loadData();
  };

  const handleAddExpense = () => {
    setExpenses(prev => [...prev, { id: `exp-${Date.now()}`, ...expenseForm, status: "Pending" }]);
    setIsAddExpenseOpen(false);
    setExpenseForm({ category: "", description: "", amount: 0, vendor: "", date: "" });
  };

  const totalRevenue   = invoices.reduce((s, i) => s + (i.amount || 0), 0);
  const paidRevenue    = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + (i.amount || 0), 0);
  const pendingRevenue = invoices.filter(i => i.status === "Unpaid" || i.status === "Overdue").reduce((s, i) => s + (i.amount || 0), 0);
  const totalExpenses  = expenses.reduce((s, e) => s + e.amount, 0);

  const filteredInvoices = invoices.filter(inv => {
    const q = searchQuery.toLowerCase();
    return (
      (inv.invoiceId.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q)) &&
      (statusFilter === "all" || inv.status === statusFilter)
    );
  });

  const filteredExpenses = expenses.filter(exp => {
    const q = searchQuery.toLowerCase();
    return (
      (exp.description.toLowerCase().includes(q) || exp.vendor.toLowerCase().includes(q) || exp.category.toLowerCase().includes(q)) &&
      (statusFilter === "all" || exp.status === statusFilter)
    );
  });

  const kpiCards = [
    {
      label: 'Total Revenue', value: formatCurrency(totalRevenue),
      icon: <IndianRupee size={18} />,
      color: 'bg-primary/10 border-primary/15 text-primary',
      valueColor: 'text-foreground',
    },
    {
      label: 'Collected', value: formatCurrency(paidRevenue),
      icon: <CheckCircle size={18} />,
      color: 'bg-green-500/10 border-green-500/15 text-green-400',
      valueColor: 'text-green-400',
    },
    {
      label: 'Pending', value: formatCurrency(pendingRevenue),
      icon: <Clock size={18} />,
      color: 'bg-amber-500/10 border-amber-500/15 text-amber-400',
      valueColor: 'text-amber-400',
    },
    {
      label: 'Total Expenses', value: formatCurrency(totalExpenses),
      icon: <TrendingDown size={18} />,
      color: 'bg-red-500/10 border-red-500/15 text-red-400',
      valueColor: 'text-red-400',
    },
  ];

  // ── Columns ──────────────────────────────
  const invoiceColumns: Column<Invoice>[] = [
    {
      key: "invoiceId",
      header: "Invoice",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-primary/10 border border-primary/15">
            <FileText size={15} className="text-primary" />
          </div>
          <div>
            <p className="text-[0.84rem] font-bold text-primary font-mono">{item.invoiceId}</p>
            <p className="text-[0.73rem] text-muted-foreground">{item.orderId}</p>
          </div>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      render: (item) => (
        <span className="text-[0.84rem] font-medium text-foreground">{item.customerName}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Issue Date",
      sortable: true,
      render: (item) => (
        <span className="text-[0.82rem] text-muted-foreground">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (item) => {
        const isOverdue = new Date(item.dueDate) < new Date() && item.status !== "Paid";
        return (
          <span className={`text-[0.82rem] font-medium ${isOverdue ? 'text-red-400' : 'text-muted-foreground'}`}>
            {formatDate(item.dueDate)}
          </span>
        );
      },
    },
    {
      key: "total",
      header: "Amount",
      sortable: true,
      render: (item) => (
        <span className="text-[0.84rem] font-bold text-foreground">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "actions",
      header: "",
      render: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted/40 border border-border/60 text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200">
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="nb-dropdown w-44">
            <DropdownMenuItem className="text-[0.82rem] gap-2 rounded-lg cursor-pointer">
              <Eye size={13} /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[0.82rem] gap-2 rounded-lg cursor-pointer">
              <Download size={13} /> Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[0.82rem] gap-2 rounded-lg cursor-pointer">
              <Edit size={13} /> Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const expenseColumns: Column<ExpenseItem>[] = [
    {
      key: "description",
      header: "Description",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-red-500/10 border border-red-500/15">
            <Receipt size={15} className="text-red-400" />
          </div>
          <div>
            <p className="text-[0.84rem] font-medium text-foreground">{item.description}</p>
            <CategoryPill category={item.category} />
          </div>
        </div>
      ),
    },
    {
      key: "vendor",
      header: "Vendor",
      sortable: true,
      render: (item) => (
        <span className="text-[0.82rem] text-muted-foreground">{item.vendor}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (item) => (
        <span className="text-[0.82rem] text-muted-foreground">{formatDate(item.date)}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (item) => (
        <span className="text-[0.84rem] font-bold text-red-400">
          -{formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "actions",
      header: "",
      render: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted/40 border border-border/60 text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200">
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="nb-dropdown w-44">
            <DropdownMenuItem className="text-[0.82rem] gap-2 rounded-lg cursor-pointer">
              <Eye size={13} /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[0.82rem] gap-2 rounded-lg cursor-pointer">
              <Edit size={13} /> Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) return (
    <PageWrapper title="Finance" description="Manage invoices and expenses">
      <SkeletonLoader variant="table" count={10} />
    </PageWrapper>
  );

  return (
    <PageWrapper
      title="Finance"
      description="Manage invoices, payments, and expenses"
      actions={
        <div className="flex gap-2">
          {/* Add Expense */}
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[0.82rem] font-bold bg-muted/40 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:-translate-y-px transition-all duration-200"
          >
            <Receipt size={13} /> Add Expense
          </button>
          {/* Create Invoice */}
          <button
            onClick={() => setIsAddInvoiceOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[0.82rem] font-bold text-white font-display hover:-translate-y-px transition-all duration-200 hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            <Plus size={14} /> Create Invoice
          </button>
        </div>
      }
    >
      {/* ── KPI Cards ── */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {kpiCards.map(({ label, value, icon, color, valueColor }) => (
          <div
            key={label}
            className="group relative bg-card border border-border/60 rounded-xl p-5 shadow-soft overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_8px_28px_oklch(var(--primary)/0.08)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-2">
                  {label}
                </p>
                <p className={`text-[1.6rem] font-extrabold font-display leading-none ${valueColor}`}>
                  {value}
                </p>
              </div>
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${color}`}>
                {icon}
              </div>
            </div>
            <div className="mt-3 h-[2px] rounded-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      {/* ── Tabs + Filter bar ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">

        {/* Combined tab + filter row */}
        <div className="bg-card border border-border/60 rounded-xl p-3 shadow-soft flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Tabs */}
          <TabsList className="bg-muted/40 border border-border/60 rounded-[10px] p-1 h-auto gap-1 flex-shrink-0">
            {[
              { value: 'invoices', label: 'Invoices', count: invoices.length, color: 'text-primary' },
              { value: 'expenses', label: 'Expenses', count: expenses.length, color: 'text-red-400' },
            ].map(({ value, label, count, color }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="text-[0.8rem] font-semibold rounded-[8px] px-4 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 text-muted-foreground transition-all duration-200"
              >
                {label}
                <span className={`ml-1.5 text-[0.7rem] font-bold ${color}`}>{count}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search + filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="nb-search w-full h-9 pl-8 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_2px_oklch(var(--primary)/0.1)]"
              />
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <SlidersHorizontal size={13} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0 focus:border-primary/50">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                {['all', 'Paid', 'Unpaid', 'Partial', 'Pending', 'Overdue'].map(v => (
                  <SelectItem key={v} value={v} className="text-[0.82rem]">
                    {v === 'all' ? 'All Status' : v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="invoices">
          <DataTable data={filteredInvoices} columns={invoiceColumns} pageSize={10} emptyMessage="No invoices found" />
        </TabsContent>

        <TabsContent value="expenses">
          <DataTable data={filteredExpenses} columns={expenseColumns} pageSize={10} emptyMessage="No expenses found" />
        </TabsContent>
      </Tabs>

      {/* ── Add Expense Dialog ── */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>Record a new expense.</DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div>
              <FieldLabel>Category</FieldLabel>
              <Select
                value={expenseForm.category}
                onValueChange={v => setExpenseForm(p => ({ ...p, category: v }))}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  {['Fuel', 'Maintenance', 'Salaries', 'Utilities', 'Insurance', 'Other'].map(c => (
                    <SelectItem key={c} value={c} className="text-[0.82rem]">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <FieldLabel htmlFor="exp-desc">Description</FieldLabel>
              <input
                id="exp-desc"
                placeholder="Expense description"
                value={expenseForm.description}
                onChange={e => setExpenseForm(p => ({ ...p, description: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel htmlFor="exp-amount">Amount (₹)</FieldLabel>
                <input
                  id="exp-amount"
                  type="number"
                  placeholder="0"
                  value={expenseForm.amount || ""}
                  onChange={e => setExpenseForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel htmlFor="exp-date">Date</FieldLabel>
                <input
                  id="exp-date"
                  type="date"
                  value={expenseForm.date}
                  onChange={e => setExpenseForm(p => ({ ...p, date: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="exp-vendor">Vendor</FieldLabel>
              <input
                id="exp-vendor"
                placeholder="Vendor name"
                value={expenseForm.vendor}
                onChange={e => setExpenseForm(p => ({ ...p, vendor: e.target.value }))}
                className={inputCls}
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(false)}
              className="px-4 py-2 rounded-[9px] text-[0.82rem] font-semibold bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddExpense}
              className="px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
              style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
            >
              Add Expense
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Invoice Dialog ── */}
      <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Create a new invoice for a customer.</DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div>
              <FieldLabel htmlFor="inv-customer">Customer Name</FieldLabel>
              <input
                id="inv-customer"
                placeholder="Customer name"
                value={invoiceForm.customerName}
                onChange={e => setInvoiceForm(p => ({ ...p, customerName: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel htmlFor="inv-amount">Amount (₹)</FieldLabel>
                <input
                  id="inv-amount"
                  type="number"
                  placeholder="0"
                  value={invoiceForm.amount || ""}
                  onChange={e => setInvoiceForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel htmlFor="inv-tax">Tax (₹)</FieldLabel>
                <input
                  id="inv-tax"
                  type="number"
                  placeholder="0"
                  value={invoiceForm.tax || ""}
                  onChange={e => setInvoiceForm(p => ({ ...p, tax: parseFloat(e.target.value) || 0 }))}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="inv-due">Due Date</FieldLabel>
              <input
                id="inv-due"
                type="date"
                value={invoiceForm.dueDate}
                onChange={e => setInvoiceForm(p => ({ ...p, dueDate: e.target.value }))}
                className={inputCls}
              />
            </div>

            {/* Total preview */}
            <div className="
              flex items-center justify-between
              px-4 py-3 rounded-xl
              bg-primary/5 border border-primary/15
            ">
              <span className="text-[0.78rem] font-semibold text-muted-foreground uppercase tracking-[0.6px]">
                Total
              </span>
              <span className="text-[1rem] font-extrabold font-display text-primary">
                {formatCurrency(invoiceForm.amount + invoiceForm.tax)}
              </span>
            </div>
          </DialogBody>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsAddInvoiceOpen(false)}
              className="px-4 py-2 rounded-[9px] text-[0.82rem] font-semibold bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddInvoice}
              className="px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              Create Invoice
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </PageWrapper>
  );
}