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

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Saved Addresses</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your delivery addresses</p>
        </div>
        {!showForm && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5">
            <Plus size={16} /> Add Address
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-heading text-lg font-bold text-gray-900 mb-5">
            {editId ? 'Edit Address' : 'Add New Address'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name: 'fullName', label: 'Full Name', placeholder: 'Priya Sharma' },
              { name: 'phone', label: 'Phone', placeholder: '9876543210', type: 'tel' },
              { name: 'addressLine1', label: 'Address Line 1', placeholder: 'House/Flat No., Street', col: 'sm:col-span-2' },
              { name: 'addressLine2', label: 'Address Line 2 (Optional)', placeholder: 'Landmark, Colony', col: 'sm:col-span-2' },
              { name: 'city', label: 'City', placeholder: 'Mumbai' },
              { name: 'pincode', label: 'Pincode', placeholder: '400001', type: 'tel' },
            ].map(field => (
              <div key={field.name} className={field.col ?? ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                <input type={field.type ?? 'text'} value={form[field.name as keyof typeof form] as string}
                  onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
                  placeholder={field.placeholder} className="input" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="input">
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : editId ? 'Update Address' : 'Save Address'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-20">
          <MapPin size={48} className="text-gray-200 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold text-gray-800 mb-2">No addresses saved</h2>
          <p className="text-gray-500 text-sm mb-6">Add a delivery address to speed up checkout</p>
          <button onClick={openAdd} className="btn-primary">Add Address</button>
        </div>
      )}

      {addresses.length > 0 && (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr._id} className={`bg-white rounded-2xl border-2 p-5 transition ${addr.isDefault ? 'border-gray-900' : 'border-gray-100 hover:border-gray-300'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full mb-2">
                      <Check size={10} /> Default
                    </span>
                  )}
                  <p className="font-semibold text-gray-900">{addr.fullName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{addr.phone}</p>
                  <p className="text-sm text-gray-600 mt-1">{addr.addressLine1}</p>
                  {addr.addressLine2 && <p className="text-sm text-gray-600">{addr.addressLine2}</p>}
                  <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-sm text-gray-500">{addr.country}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => openEdit(addr)}
                    className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition">
                    <Edit2 size={14} />
                  </button>
                  {addr._id && (
                    <button onClick={() => handleDelete(addr._id!)}
                      className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-gray-400 transition">
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
