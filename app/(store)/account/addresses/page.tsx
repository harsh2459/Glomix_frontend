'use client';

import { useState } from 'react';
import { MapPin, Plus, Trash2, Check, Edit2 } from 'lucide-react';
import { useAuthStore } from '../../../../stores/authStore';
import { IAddress } from '../../../../types';
import { apiPost, apiPut, apiDelete } from '../../../../lib/api';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh',
  'Chandigarh','Puducherry','Andaman and Nicobar Islands',
];

const EMPTY_FORM = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India', isDefault: false,
};

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-xl)',
  padding: '1.5rem',
};

export default function AddressesPage() {
  const { user, fetchUser } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const addresses = user?.addresses ?? [];

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (addr: IAddress) => {
    setForm({ fullName: addr.fullName, phone: addr.phone, addressLine1: addr.addressLine1, addressLine2: addr.addressLine2 ?? '', city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country, isDefault: addr.isDefault });
    setEditId(addr._id ?? null);
    setShowForm(true);
  };

  const handleSave = async () => {
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'] as const;
    for (const field of required) {
      if (!form[field].trim()) { toast.error(`Please fill in ${field}`); return; }
    }
    setSaving(true);
    try {
      if (editId) {
        await apiPut(`/auth/addresses/${editId}`, form);
      } else {
        await apiPost('/auth/addresses', { ...form, isDefault: addresses.length === 0 });
      }
      await fetchUser();
      setShowForm(false);
      toast.success(editId ? 'Address updated' : 'Address added');
    } catch {
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/auth/addresses/${id}`);
      await fetchUser();
      toast.success('Address removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-sub)', marginBottom: 6,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)' }}>Saved Addresses</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Manage your delivery addresses</p>
        </div>
        {!showForm && (
          <button onClick={openAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '0.6rem 1.25rem' }}>
            <Plus size={15} /> Add Address
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={cardStyle}>
          <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem' }}>
            {editId ? 'Edit Address' : 'Add New Address'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { name: 'fullName', label: 'Full Name', placeholder: 'Priya Sharma' },
              { name: 'phone', label: 'Phone', placeholder: '9876543210', type: 'tel' },
              { name: 'addressLine1', label: 'Address Line 1', placeholder: 'House/Flat No., Street', col: '2' },
              { name: 'addressLine2', label: 'Address Line 2 (Optional)', placeholder: 'Landmark, Colony', col: '2' },
              { name: 'city', label: 'City', placeholder: 'Mumbai' },
              { name: 'pincode', label: 'Pincode', placeholder: '400001', type: 'tel' },
            ].map(field => (
              <div key={field.name} style={{ gridColumn: field.col ? `span ${field.col}` : undefined }}>
                <label style={labelStyle}>{field.label}</label>
                <input type={field.type ?? 'text'} value={form[field.name as keyof typeof form] as string}
                  onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
                  placeholder={field.placeholder} className="input" />
              </div>
            ))}
            <div>
              <label style={labelStyle}>State</label>
              <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="input">
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: '1.25rem' }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : editId ? 'Update Address' : 'Save Address'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {addresses.length === 0 && !showForm && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '5rem 1.5rem' }}>
          <MapPin size={48} style={{ color: 'var(--bg-muted)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>No addresses saved</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: '1.5rem' }}>Add a delivery address to speed up checkout</p>
          <button onClick={openAdd} className="btn-primary" style={{ fontSize: 13, padding: '0.6rem 1.5rem' }}>Add Address</button>
        </div>
      )}

      {/* Address list */}
      {addresses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {addresses.map((addr) => (
            <div key={addr._id} style={{
              background: 'var(--surface)',
              border: `2px solid ${addr.isDefault ? 'var(--ink)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem',
              transition: 'border-color 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  {addr.isDefault && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-alt)', padding: '3px 10px', borderRadius: 'var(--radius-pill)', marginBottom: 8 }}>
                      <Check size={10} /> Default
                    </span>
                  )}
                  <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{addr.fullName}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{addr.phone}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 6 }}>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>{addr.addressLine2}</p>}
                  <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{addr.country}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={() => openEdit(addr)}
                    style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', color: 'var(--text-muted)', background: 'none', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-alt)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}>
                    <Edit2 size={14} />
                  </button>
                  {addr._id && (
                    <button onClick={() => handleDelete(addr._id!)}
                      style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', color: 'var(--text-faint)', background: 'none', transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--error-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--error-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--error)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'; }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
