"use client";

import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import {
  Dialog, DialogBody, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Download, X, ShoppingCart,
  Eye, Search, SlidersHorizontal,
  Package, Trash2, DollarSign,
} from 'lucide-react';
import { getOrders, createOrder, updateOrder } from '@/services/orderService';
import { type Order, type OrderStatus, type PaymentStatus, mockCustomers } from '@/data/mockData';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const orderStatusOptions: OrderStatus[] = [
  'Draft', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Returned',
];
const paymentStatusOptions: PaymentStatus[] = ['Pending', 'Paid', 'Partial', 'Refunded'];

// ── Shared input style ──────────────────────────────
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
  focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.12)]
`;

const FieldLabel = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
  <label
    htmlFor={htmlFor}
    className="block text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-1.5"
  >
    {children}
  </label>
);

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('orders', 'create');

  useEffect(() => { loadOrders(); }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const filters = statusFilter !== 'all'
        ? { status: statusFilter as OrderStatus } : undefined;
      setOrders(await getOrders(filters));
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = searchQuery
    ? orders.filter(o =>
        o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  const columns: Column<Order>[] = [
    {
      key: 'orderId',
      header: 'Order ID',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-primary font-display text-[0.84rem]">
          {item.orderId}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (item) => (
        <span className="text-[0.84rem] font-medium text-foreground">
          {item.customerName}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (item) => (
        <span className="
          inline-flex items-center gap-1.5 px-2.5 py-1
          bg-muted/50 border border-border/60
          rounded-full text-[0.72rem] font-semibold text-muted-foreground
        ">
          <Package size={11} />
          {item.items.length} item{item.items.length !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total',
      sortable: true,
      render: (item) => (
        <span className="text-[0.84rem] font-bold text-foreground">
          {formatCurrency(item.totalAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      sortable: true,
      render: (item) => <StatusBadge status={item.paymentStatus} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (item) => (
        <span className="text-[0.78rem] text-muted-foreground">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedOrder(item); }}
          className="
            w-8 h-8 flex items-center justify-center rounded-lg
            bg-muted/40 border border-border/60
            text-muted-foreground
            hover:bg-primary/10 hover:border-primary/30 hover:text-primary
            transition-all duration-200
          "
        >
          <Eye size={13} />
        </button>
      ),
    },
  ];

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Payment Status', 'Created At'];
    const rows = filteredOrders.map(o => [
      o.orderId, o.customerName, o.items.length,
      formatCurrency(o.totalAmount), o.status, o.paymentStatus, formatDate(o.createdAt),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Orders exported successfully');
  };

  return (
    <PageWrapper
      title="Orders"
      description="Manage customer orders"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="
              flex items-center gap-2 px-3.5 py-2
              bg-muted/40 border border-border/60 rounded-[10px]
              text-[0.82rem] font-semibold text-muted-foreground
              hover:bg-primary/8 hover:border-primary/30 hover:text-foreground
              hover:-translate-y-px transition-all duration-200
            "
          >
            <Download size={14} /> Export CSV
          </button>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="
                flex items-center gap-2 px-3.5 py-2 rounded-[10px]
                text-[0.82rem] font-bold text-white font-display
                hover:-translate-y-px transition-all duration-200
                hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
              "
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              <Plus size={14} /> New Order
            </button>
          )}
        </div>
      }
    >
      {/* ── Filter Bar ── */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[0.78rem] text-muted-foreground">
              <SlidersHorizontal size={13} />
              <span className="font-medium hidden sm:block">Filter:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0 focus:border-primary/50">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Statuses</SelectItem>
                {orderStatusOptions.map(s => (
                  <SelectItem key={s} value={s} className="text-[0.82rem]">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="w-8 h-8 flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded-[8px] text-destructive hover:bg-destructive/20 transition-colors duration-150"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Active filter pill */}
        {(searchQuery || statusFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
            <span className="text-[0.72rem] text-muted-foreground font-medium uppercase tracking-wide">
              Active filters:
            </span>
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[0.72rem] font-semibold text-primary">
                {statusFilter}
                <button onClick={() => setStatusFilter('all')}><X size={10} /></button>
              </span>
            )}
            <span className="text-[0.72rem] text-muted-foreground ml-auto">
              {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <SkeletonLoader variant="table" count={10} />
      ) : (
        <DataTable
          data={filteredOrders}
          columns={columns}
          emptyMessage="No orders found"
        />
      )}

      <CreateOrderModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => { setShowCreateModal(false); loadOrders(); }}
      />

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdate={() => { setSelectedOrder(null); loadOrders(); }}
      />
    </PageWrapper>
  );
}

/* ─────────────────────────────────────────────
   Create Order Modal
───────────────────────────────────────────── */
interface CreateOrderModalProps {
  open: boolean; onClose: () => void; onSuccess: () => void;
}

function CreateOrderModal({ open, onClose, onSuccess }: CreateOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    items: [{ name: '', quantity: 1, price: 0 }],
  });

  const handleAddItem = () =>
    setFormData(p => ({ ...p, items: [...p.items, { name: '', quantity: 1, price: 0 }] }));

  const handleRemoveItem = (index: number) =>
    setFormData(p => ({ ...p, items: p.items.filter((_, i) => i !== index) }));

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const items = [...formData.items];
    items[index] = { ...items[index], [field]: value };
    setFormData(p => ({ ...p, items }));
  };

  const totalAmount = formData.items.reduce((s, i) => s + i.quantity * i.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const customer = mockCustomers.find(c => c.id === formData.customerId);
      await createOrder({
        customerId: formData.customerId,
        customerName: customer?.name || formData.customerName,
        items: formData.items.filter(i => i.name),
        totalAmount,
      });
      toast.success('Order created successfully');
      onSuccess();
    } catch {
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>Create a new customer order</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form id="create-order-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Customer */}
            <div>
              <FieldLabel>Customer</FieldLabel>
              <Select
                value={formData.customerId}
                onValueChange={(v) => {
                  const c = mockCustomers.find(x => x.id === v);
                  setFormData(p => ({ ...p, customerId: v, customerName: c?.name || '' }));
                }}
              >
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  {mockCustomers.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-[0.82rem]">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <FieldLabel>Order Items</FieldLabel>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="
                    flex items-center gap-1.5 px-3 py-1.5
                    bg-primary/10 border border-primary/20
                    rounded-[8px] text-[0.75rem] font-bold text-primary
                    hover:bg-primary/15 transition-colors duration-150
                  "
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[1fr_80px_110px_36px] gap-2 mb-2 px-1">
                {['Item Name', 'Qty', 'Price', ''].map(h => (
                  <span key={h} className="text-[0.68rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
                    {h}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-[1fr_80px_110px_36px] gap-2 items-center">
                    <input
                      placeholder="Item name"
                      value={item.name}
                      onChange={e => handleItemChange(index, 'name', e.target.value)}
                      className={inputCls}
                    />
                    <input
                      type="number"
                      placeholder="1"
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className={inputCls}
                    />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={item.price}
                      onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                      className={inputCls}
                    />
                    {formData.items.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="
                          w-9 h-10 flex items-center justify-center
                          bg-destructive/10 border border-destructive/20
                          rounded-[9px] text-destructive
                          hover:bg-destructive/20 transition-colors duration-150
                        "
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : <div />}
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="
              flex items-center justify-between
              px-4 py-3.5 rounded-xl
              bg-primary/5 border border-primary/15
              relative overflow-hidden
              before:absolute before:inset-x-0 before:top-0 before:h-px
              before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent
            ">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign size={13} className="text-primary" />
                </div>
                <span className="text-[0.84rem] font-semibold text-foreground">Total Amount</span>
              </div>
              <span className="text-[1.2rem] font-extrabold font-display nb-crumb-active">
                {formatCurrency(totalAmount)}
              </span>
            </div>

          </form>
        </DialogBody>

        <DialogFooter>
          <button
            type="button" onClick={onClose}
            className="px-4 py-2 rounded-[9px] text-[0.82rem] font-semibold bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-order-form"
            disabled={loading || !formData.customerId}
            className="px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : 'Create Order'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────
   Order Detail Modal
───────────────────────────────────────────── */
interface OrderDetailModalProps {
  order: Order | null; onClose: () => void; onUpdate: () => void;
}

function OrderDetailModal({ order, onClose, onUpdate }: OrderDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(order?.status || 'Draft');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order?.paymentStatus || 'Pending');
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('orders', 'edit');

  useEffect(() => {
    if (order) { setStatus(order.status); setPaymentStatus(order.paymentStatus); }
  }, [order]);

  const handleUpdate = async () => {
    if (!order) return;
    setLoading(true);
    try {
      await updateOrder(order.id, { status, paymentStatus });
      toast.success('Order updated successfully');
      onUpdate();
    } catch {
      toast.error('Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const hasChanges = status !== order.status || paymentStatus !== order.paymentStatus;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-primary" />
              {order.orderId}
            </span>
          </DialogTitle>
          <DialogDescription>
            Order details for{' '}
            <span className="font-semibold text-foreground">{order.customerName}</span>
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-5">

          {/* Status pills */}
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
            <span className="ml-auto text-[0.72rem] text-muted-foreground">
              {formatDate(order.createdAt, 'datetime')}
            </span>
          </div>

          {/* Items list */}
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-2">
              Items
            </p>
            <div className="space-y-1.5">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2.5 bg-muted/30 border border-border/40 rounded-[9px] hover:bg-muted/50 transition-colors duration-150"
                >
                  <span className="text-[0.84rem] font-medium text-foreground">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.72rem] text-muted-foreground">
                      {item.quantity} ×
                    </span>
                    <span className="text-[0.82rem] font-semibold text-foreground">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="
            flex items-center justify-between
            px-4 py-3 rounded-xl
            bg-primary/5 border border-primary/15
            relative overflow-hidden
            before:absolute before:inset-x-0 before:top-0 before:h-px
            before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent
          ">
            <span className="text-[0.84rem] font-semibold text-foreground">Total</span>
            <span className="text-[1.15rem] font-extrabold font-display nb-crumb-active">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>

          {/* Edit selects */}
          {canEdit && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Order Status</FieldLabel>
                <Select value={status} onValueChange={v => setStatus(v as OrderStatus)}>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="nb-dropdown">
                    {orderStatusOptions.map(s => (
                      <SelectItem key={s} value={s} className="text-[0.82rem]">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Payment Status</FieldLabel>
                <Select value={paymentStatus} onValueChange={v => setPaymentStatus(v as PaymentStatus)}>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="nb-dropdown">
                    {paymentStatusOptions.map(s => (
                      <SelectItem key={s} value={s} className="text-[0.82rem]">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

        </DialogBody>

        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[9px] text-[0.82rem] font-semibold bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200"
          >
            Close
          </button>
          {canEdit && (
            <button
              onClick={handleUpdate}
              disabled={loading || !hasChanges}
              className="px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : 'Update Order'}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}