import React from 'react';
import { Clock, CheckCircle, XCircle, Ban, Award } from 'lucide-react';

const CONFIG = {
  pending:   { icon: Clock,        label: 'Pending',   cls: 'badge-pending' },
  approved:  { icon: CheckCircle,  label: 'Approved',  cls: 'badge-approved' },
  rejected:  { icon: XCircle,      label: 'Rejected',  cls: 'badge-rejected' },
  cancelled: { icon: Ban,          label: 'Cancelled', cls: 'badge-cancelled' },
  completed: { icon: Award,        label: 'Completed', cls: 'badge-completed' },
};

export default function BookingStatusBadge({ status }) {
  const { icon: Icon, label, cls } = CONFIG[status] || CONFIG.pending;
  return (
    <span className={`badge ${cls}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}
