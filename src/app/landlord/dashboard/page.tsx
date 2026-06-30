"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { api } from '@/services/api';

interface Property {
  id: string;
  name: string;
  address: string;
  propertyCode: string;
}

interface Unit {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  baseRent: number;
  status: string; // 'VACANT' | 'OCCUPIED' | 'MAINTENANCE'
}

interface Lease {
  id: string;
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitNumber: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  gracePeriodDays: number;
  status: string;
}

interface MockTenant {
  id: string;
  name: string;
  email: string;
}

const MOCK_TENANTS: MockTenant[] = [
  { id: '87915574-d4b7-4b77-8027-2c938d2f1f0a', name: 'Jane Doe', email: 'jane@tenant.com' },
  { id: '929c5e31-5089-4d2d-94c6-4b8a8bcf44ee', name: 'Bob Smith', email: 'bob@tenant.com' },
  { id: 'c0a80101-7fa8-11ec-90d6-0242ac120003', name: 'Alice Johnson', email: 'alice@tenant.com' },
];

export default function LandlordDashboardPage() {
  const router = useRouter();

  // Retrieve user details safely
  const [user, setUser] = useState<{ email: string; roles: string[] } | null>(() => {
    if (typeof window !== 'undefined') {
      const userString = localStorage.getItem('rentflow_user');
      return userString ? JSON.parse(userString) : null;
    }
    return null;
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<'properties' | 'units' | 'leases'>('properties');

  // Lists & States
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [tenants, setTenants] = useState<MockTenant[]>([]);

  // Add Property Form State
  const [propName, setPropName] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propCode, setPropCode] = useState('');

  // Add Unit Form State
  const [unitPropId, setUnitPropId] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [unitBaseRent, setUnitBaseRent] = useState('');

  // Create Lease Form State
  const [leaseTenantId, setLeaseTenantId] = useState('');
  const [leaseUnitId, setLeaseUnitId] = useState('');
  const [leaseStartDate, setLeaseStartDate] = useState('');
  const [leaseEndDate, setLeaseEndDate] = useState('');
  const [leaseGracePeriod, setLeaseGracePeriod] = useState('5');

  // UI Feedback States
  const [statusMessage, setStatusMessage] = useState<{ text: React.ReactNode; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Initial Data
  useEffect(() => {
    const localProps = localStorage.getItem('rentflow_props');
    const localUnits = localStorage.getItem('rentflow_units');
    const localLeases = localStorage.getItem('rentflow_leases');

    const initialProps = localProps ? JSON.parse(localProps) : [];
    const initialUnits = localUnits ? JSON.parse(localUnits) : [];
    const initialLeases = localLeases ? JSON.parse(localLeases) : [];

    setProperties(initialProps);
    setUnits(initialUnits);
    setLeases(initialLeases);

    fetchPropertiesFromBackend();
    fetchTenantsFromBackend();
    fetchUnitsFromBackend();
    fetchLeasesFromBackend();
  }, []);

  const fetchPropertiesFromBackend = async () => {
    try {
      const response = await api.get('/api/v1/properties');
      if (response.data && Array.isArray(response.data)) {
        const backendProps: Property[] = response.data.map((item: any, idx: number) => {
          if (typeof item === 'string') {
            return {
              id: `be-prop-${idx}`,
              name: item,
              address: 'Fetched from Backend',
              propertyCode: `BE-PROP-${idx}`,
            };
          }
          return {
            id: item.id || `be-prop-${idx}`,
            name: item.name || 'Unnamed Property',
            address: item.address || '',
            propertyCode: item.propertyCode || '',
          };
        });

        setProperties(backendProps);
        localStorage.setItem('rentflow_props', JSON.stringify(backendProps));
      }
    } catch (e) {
      console.warn('Could not fetch properties from backend, using local store:', e);
    }
  };

  const fetchTenantsFromBackend = async () => {
    try {
      const response = await api.get('/api/v1/tenants');
      if (response.data && Array.isArray(response.data)) {
        const backendTenants: MockTenant[] = response.data.map((item: any) => ({
          id: item.id,
          name: item.name || 'Unnamed Tenant',
          email: item.email || '',
        }));

        setTenants(backendTenants);
      }
    } catch (e) {
      console.warn('Could not fetch tenants from backend, using local store:', e);
    }
  };

  const fetchUnitsFromBackend = async () => {
    try {
      const response = await api.get('/api/v1/properties/units');
      if (response.data && Array.isArray(response.data)) {
        const backendUnits: Unit[] = response.data.map((item: any) => ({
          id: item.id,
          propertyId: item.propertyId,
          propertyName: item.propertyName || 'Unnamed Property',
          unitNumber: item.unitNumber,
          baseRent: typeof item.baseRent === 'number' ? item.baseRent : parseFloat(item.baseRent),
          status: item.status,
        }));

        setUnits(backendUnits);
        localStorage.setItem('rentflow_units', JSON.stringify(backendUnits));
      }
    } catch (e) {
      console.warn('Could not fetch units from backend, using local store:', e);
    }
  };

  const fetchLeasesFromBackend = async () => {
    try {
      const response = await api.get('/api/v1/leases');
      if (response.data && Array.isArray(response.data)) {
        const backendLeases: Lease[] = response.data.map((item: any) => ({
          id: item.id,
          tenantId: item.tenantId,
          tenantName: item.tenantName || 'Unnamed Tenant',
          unitId: item.unitId,
          unitNumber: item.unitNumber || '',
          propertyName: item.propertyName || 'Unnamed Property',
          startDate: item.startDate,
          endDate: item.endDate,
          gracePeriodDays: item.gracePeriodDays,
          status: item.status,
          nombaVactNumber: item.nombaVactNumber,
          nombaVactBank: item.nombaVactBank,
        }));

        setLeases(backendLeases);
        localStorage.setItem('rentflow_leases', JSON.stringify(backendLeases));
      }
    } catch (e) {
      console.warn('Could not fetch leases from backend, using local store:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rentflow_token');
    localStorage.removeItem('rentflow_user');
    router.replace('/login');
  };

  // Add Property Handler
  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propName || !propAddress || !propCode) {
      showFeedback('Please fill out all fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      name: propName,
      address: propAddress,
      propertyCode: propCode,
    };

    try {
      const response = await api.post('/api/v1/properties', payload);

      const newProp: Property = {
        id: response.data?.id || `prop-${Date.now()}`,
        name: response.data?.name || propName,
        address: response.data?.address || propAddress,
        propertyCode: response.data?.propertyCode || propCode,
      };

      updatePropertiesState(newProp);
      showFeedback('Property added successfully to backend!', 'success');
      resetPropertyForm();
    } catch (error: any) {
      console.error('Property creation backend failed, saving locally:', error);

      const newProp: Property = {
        id: `local-prop-${Date.now()}`,
        name: propName,
        address: propAddress,
        propertyCode: propCode,
      };

      updatePropertiesState(newProp);
      showFeedback('Backend unavailable. Property saved to local browser state!', 'info');
      resetPropertyForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePropertiesState = (newProp: Property) => {
    const updated = [...properties, newProp];
    setProperties(updated);
    localStorage.setItem('rentflow_props', JSON.stringify(updated));
  };

  const resetPropertyForm = () => {
    setPropName('');
    setPropAddress('');
    setPropCode('');
  };

  // Add Unit Handler
  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitPropId || !unitNumber || !unitBaseRent) {
      showFeedback('Please fill out all fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const rent = parseFloat(unitBaseRent);
    if (isNaN(rent) || rent <= 0) {
      showFeedback('Please enter a valid base rent amount.', 'error');
      setIsSubmitting(false);
      return;
    }

    const selectedProp = properties.find((p) => p.id === unitPropId);
    const propNameStr = selectedProp ? selectedProp.name : 'Unknown Property';

    const payload = {
      unitNumber: unitNumber,
      baseRent: rent,
    };

    try {
      const response = await api.post(`/api/v1/properties/${unitPropId}/units`, payload);

      const newUnit: Unit = {
        id: response.data?.id || `unit-${Date.now()}`,
        propertyId: unitPropId,
        propertyName: propNameStr,
        unitNumber: response.data?.unitNumber || unitNumber,
        baseRent: response.data?.baseRent || rent,
        status: response.data?.status || 'VACANT',
      };

      updateUnitsState(newUnit);
      showFeedback('Unit added successfully to backend!', 'success');
      resetUnitForm();
    } catch (error: any) {
      console.error('Unit creation backend failed, saving locally:', error);

      const newUnit: Unit = {
        id: `local-unit-${Date.now()}`,
        propertyId: unitPropId,
        propertyName: propNameStr,
        unitNumber: unitNumber,
        baseRent: rent,
        status: 'VACANT',
      };

      updateUnitsState(newUnit);
      showFeedback('Backend unavailable. Unit saved to local browser state!', 'info');
      resetUnitForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUnitsState = (newUnit: Unit) => {
    const updated = [...units, newUnit];
    setUnits(updated);
    localStorage.setItem('rentflow_units', JSON.stringify(updated));
  };

  const resetUnitForm = () => {
    setUnitNumber('');
    setUnitBaseRent('');
  };

  // Create Lease Handler
  const handleCreateLease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaseTenantId || !leaseUnitId || !leaseStartDate || !leaseEndDate) {
      showFeedback('Please fill out all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const selectedTenant = tenants.find((t) => t.id === leaseTenantId);
    const tenantNameStr = selectedTenant ? selectedTenant.name : 'Unknown Tenant';

    const selectedUnit = units.find((u) => u.id === leaseUnitId);
    const unitNoStr = selectedUnit ? selectedUnit.unitNumber : 'Unknown Unit';
    const propNameStr = selectedUnit ? selectedUnit.propertyName : 'Unknown Property';

    const graceDays = parseInt(leaseGracePeriod);

    const payload = {
      tenantId: leaseTenantId,
      unitId: leaseUnitId,
      startDate: leaseStartDate,
      endDate: leaseEndDate,
      gracePeriodDays: isNaN(graceDays) ? 5 : graceDays,
    };

    try {
      const response = await api.post('/api/v1/leases', payload);

      const newLease: Lease = {
        id: response.data?.id || `lease-${Date.now()}`,
        tenantId: leaseTenantId,
        tenantName: tenantNameStr,
        unitId: leaseUnitId,
        unitNumber: unitNoStr,
        propertyName: propNameStr,
        startDate: response.data?.startDate || leaseStartDate,
        endDate: response.data?.endDate || leaseEndDate,
        gracePeriodDays: response.data?.gracePeriodDays || graceDays,
        status: response.data?.status || 'ACTIVE',
      };

      updateLeasesState(newLease, leaseUnitId);

      const vactNum = response.data?.nombaVactNumber || '9923847582';
      const vactBank = response.data?.nombaVactBank || 'Wema Bank';
      const vactRef = response.data?.nombaVactRef || `RF_LSE_${newLease.id.replace(/-/g, '')}`;

      const feedbackElement = (
        <div className="flex flex-col gap-2 w-full text-left">
          <div className="font-semibold">Lease agreement created successfully in backend!</div>
          <div className="mt-1 text-xs border-t border-brand-emerald-green/20 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="block text-[10px] uppercase font-bold text-on-surface-variant">Bank Name</span>
              <span className="font-semibold text-brand-deep-slate">{vactBank}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-on-surface-variant">Account Number</span>
              <span className="font-mono font-bold text-brand-deep-slate">{vactNum}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-on-surface-variant">Account Ref</span>
              <span className="font-mono text-brand-deep-slate">{vactRef}</span>
            </div>
          </div>
        </div>
      );

      showFeedback(feedbackElement, 'success');
      resetLeaseForm();
    } catch (error: any) {
      console.error('Lease creation backend failed, saving locally:', error);

      const newLease: Lease = {
        id: `local-lease-${Date.now()}`,
        tenantId: leaseTenantId,
        tenantName: tenantNameStr,
        unitId: leaseUnitId,
        unitNumber: unitNoStr,
        propertyName: propNameStr,
        startDate: leaseStartDate,
        endDate: leaseEndDate,
        gracePeriodDays: graceDays,
        status: 'PENDING_VIRTUAL_ACCOUNT',
      };

      updateLeasesState(newLease, leaseUnitId);

      const vactNum = '9923847582';
      const vactBank = 'Wema Bank';
      const vactRef = `RF_LSE_${newLease.id.replace(/-/g, '')}`;

      const feedbackElement = (
        <div className="flex flex-col gap-2 w-full text-left">
          <div className="font-semibold">Backend unavailable. Lease saved to local browser state!</div>
          <div className="mt-1 text-xs border-t border-indigo-500/20 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#001a42] opacity-85">Bank Name (Mock)</span>
              <span className="font-semibold text-brand-deep-slate">{vactBank}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#001a42] opacity-85">Account Number (Mock)</span>
              <span className="font-mono font-bold text-brand-deep-slate">{vactNum}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-[#001a42] opacity-85">Account Ref (Mock)</span>
              <span className="font-mono text-brand-deep-slate">{vactRef}</span>
            </div>
          </div>
        </div>
      );

      showFeedback(feedbackElement, 'info');
      resetLeaseForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLeasesState = (newLease: Lease, unitId: string) => {
    const updatedLeases = [...leases, newLease];
    setLeases(updatedLeases);
    localStorage.setItem('rentflow_leases', JSON.stringify(updatedLeases));

    const updatedUnits = units.map((u) => {
      if (u.id === unitId) {
        return { ...u, status: 'OCCUPIED' };
      }
      return u;
    });
    setUnits(updatedUnits);
    localStorage.setItem('rentflow_units', JSON.stringify(updatedUnits));
  };

  const resetLeaseForm = () => {
    setLeaseTenantId('');
    setLeaseUnitId('');
    setLeaseStartDate('');
    setLeaseEndDate('');
    setLeaseGracePeriod('5');
  };

  const showFeedback = (text: React.ReactNode, type: 'success' | 'error' | 'info') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 10000);
  };

  return (
    <ProtectedRoute allowedRole="ROLE_LANDLORD">
      <div className="max-w-[1440px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 min-h-screen">

        {/* Sidebar Navigation */}
        <aside className="bg-brand-deep-slate text-on-primary rounded-lg p-6 flex flex-col justify-between lg:h-[calc(100vh-64px)] lg:sticky lg:top-8">
          <div>
            <div className="text-2xl font-bold tracking-tight mb-6">RentFlow</div>
            {user && (
              <div className="mb-6 text-xs opacity-80">
                <p>Connected Landlord</p>
                <strong className="block text-sm mt-0.5 truncate">{user.email}</strong>
              </div>
            )}
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => { setActiveTab('properties'); setStatusMessage(null); }}
                className={`text-left px-3.5 py-2.5 rounded-[6px] font-semibold text-sm transition ${
                  activeTab === 'properties'
                    ? 'bg-white/10 text-on-primary border-l-3 border-brand-emerald-green'
                    : 'text-[#7c839b] hover:bg-white/5 hover:text-white'
                }`}
              >
                Manage Properties
              </button>
              <button
                onClick={() => { setActiveTab('units'); setStatusMessage(null); }}
                className={`text-left px-3.5 py-2.5 rounded-[6px] font-semibold text-sm transition ${
                  activeTab === 'units'
                    ? 'bg-white/10 text-on-primary border-l-3 border-brand-emerald-green'
                    : 'text-[#7c839b] hover:bg-white/5 hover:text-white'
                }`}
              >
                Manage Units
              </button>
              <button
                onClick={() => { setActiveTab('leases'); setStatusMessage(null); }}
                className={`text-left px-3.5 py-2.5 rounded-[6px] font-semibold text-sm transition ${
                  activeTab === 'leases'
                    ? 'bg-white/10 text-on-primary border-l-3 border-brand-emerald-green'
                    : 'text-[#7c839b] hover:bg-white/5 hover:text-white'
                }`}
              >
                Manage Leases
              </button>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="mt-6 bg-transparent border border-white/20 text-on-primary py-2.5 rounded-[6px] cursor-pointer font-semibold hover:bg-white/10 transition"
          >
            Sign Out
          </button>
        </aside>

        {/* Main Panel Content */}
        <main className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-outline-variant pb-4">
            <div className="headerInfo">
              <h1 className="text-2xl md:text-3xl font-semibold text-brand-deep-slate">Landlord Portal</h1>
              <p className="text-sm text-on-surface-variant">Define properties, units, and assign tenant leases with automated ledger splitting.</p>
            </div>
          </div>

          {/* Global Feedback Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-[6px] text-sm flex items-start gap-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-brand-emerald-green/30 text-brand-emerald-green'
                  : statusMessage.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-600'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-[#001a42]'
              }`}
              style={statusMessage.type === 'info' ? { backgroundColor: '#dae2fd', borderColor: '#adc6ff', color: '#001a42' } : {}}
              role="alert"
            >
              <div className="w-full">{statusMessage.text}</div>
            </div>
          )}

          {/* TAB 1: PROPERTIES */}
          {activeTab === 'properties' && (
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
                <h2 className="text-lg font-semibold text-brand-deep-slate border-b border-surface-container-low pb-2 mb-4">Add Property</h2>
                <form onSubmit={handleAddProperty} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="propName" className="text-sm font-semibold text-on-surface">Property Name</label>
                    <input
                      id="propName"
                      type="text"
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                      placeholder="e.g. Oakwood Apartments"
                      value={propName}
                      onChange={(e) => setPropName(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="propAddress" className="text-sm font-semibold text-on-surface">Property Address</label>
                    <input
                      id="propAddress"
                      type="text"
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                      placeholder="e.g. 14 Broad Street, Lagos Island"
                      value={propAddress}
                      onChange={(e) => setPropAddress(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="propCode" className="text-sm font-semibold text-on-surface">Property Code (Unique)</label>
                    <input
                      id="propCode"
                      type="text"
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                      placeholder="e.g. OAK-01"
                      value={propCode}
                      onChange={(e) => setPropCode(e.target.value.toUpperCase())}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="submit"
                    className="min-h-[44px] bg-brand-deep-slate text-on-primary text-sm font-semibold rounded-[6px] cursor-pointer hover:bg-slate-800 transition disabled:opacity-55"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving Property...' : 'Save Property'}
                  </button>
                </form>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="p-3 text-xs font-semibold uppercase text-on-surface-variant">Property Name</th>
                      <th className="p-3 text-xs font-semibold uppercase text-on-surface-variant">Code</th>
                      <th className="p-3 text-xs font-semibold uppercase text-on-surface-variant">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {properties.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-sm text-on-surface-variant">
                          No properties found. Add one on the left.
                        </td>
                      </tr>
                    ) : (
                      properties.map((p) => (
                        <tr key={p.id} className="hover:bg-surface/50">
                          <td className="p-3.5 text-sm text-on-surface"><strong>{p.name}</strong></td>
                          <td className="p-3.5 text-sm font-mono text-on-surface">{p.propertyCode}</td>
                          <td className="p-3.5 text-sm text-on-surface-variant">{p.address}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: UNITS */}
          {activeTab === 'units' && (
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
                <h2 className="text-lg font-semibold text-brand-deep-slate border-b border-surface-container-low pb-2 mb-4">Add Unit</h2>
                <form onSubmit={handleAddUnit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="unitProp" className="text-sm font-semibold text-on-surface">Select Property</label>
                    <select
                      id="unitProp"
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15 cursor-pointer"
                      value={unitPropId}
                      onChange={(e) => setUnitPropId(e.target.value)}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">-- Select Property --</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.propertyCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="unitNumber" className="text-sm font-semibold text-on-surface">Unit Number</label>
                    <input
                      id="unitNumber"
                      type="text"
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                      placeholder="e.g. Suite 3B"
                      value={unitNumber}
                      onChange={(e) => setUnitNumber(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="unitBaseRent" className="text-sm font-semibold text-on-surface">Base Rent (₦ per annum)</label>
                    <input
                      id="unitBaseRent"
                      type="number"
                      min="1"
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                      placeholder="e.g. 1500000"
                      value={unitBaseRent}
                      onChange={(e) => setUnitBaseRent(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="submit"
                    className="min-h-[44px] bg-brand-deep-slate text-on-primary text-sm font-semibold rounded-[6px] cursor-pointer hover:bg-slate-800 transition disabled:opacity-55"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving Unit...' : 'Save Unit'}
                  </button>
                </form>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="p-3 text-xs font-semibold uppercase text-on-surface-variant">Unit Number</th>
                      <th className="p-3 text-xs font-semibold uppercase text-on-surface-variant">Property</th>
                      <th className="p-3 text-xs font-semibold uppercase text-on-surface-variant">Base Rent</th>
                      <th className="p-3 text-xs font-semibold uppercase text-on-surface-variant">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {units.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-sm text-on-surface-variant">
                          No units found. Add one on the left.
                        </td>
                      </tr>
                    ) : (
                      units.map((u) => (
                        <tr key={u.id} className="hover:bg-surface/50">
                          <td className="p-3.5 text-sm text-on-surface"><strong>{u.unitNumber}</strong></td>
                          <td className="p-3.5 text-sm text-on-surface">{u.propertyName}</td>
                          <td className="p-3.5 text-sm font-mono text-on-surface tabular-nums">₦ {Number(u.baseRent).toLocaleString()}</td>
                          <td className="p-3.5 text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                                u.status === 'VACANT' 
                                  ? 'bg-emerald-500/10 text-brand-emerald-green' 
                                  : 'bg-amber-500/10 text-[#b45309]'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LEASES */}
          {activeTab === 'leases' && (
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
                <h2 className="text-lg font-semibold text-brand-deep-slate border-b border-surface-container-low pb-2 mb-4">Create Lease</h2>
                <form onSubmit={handleCreateLease} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="leaseTenant" className="text-sm font-semibold text-on-surface">Select Tenant</label>
                    <select
                      id="leaseTenant"
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15 cursor-pointer"
                      value={leaseTenantId}
                      onChange={(e) => setLeaseTenantId(e.target.value)}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">-- Select Tenant --</option>
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="leaseUnit" className="text-sm font-semibold text-on-surface">Select Vacant Unit</label>
                    <select
                      id="leaseUnit"
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15 cursor-pointer"
                      value={leaseUnitId}
                      onChange={(e) => setLeaseUnitId(e.target.value)}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">-- Select Unit --</option>
                      {units
                        .filter((u) => u.status === 'VACANT')
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.propertyName} - Unit {u.unitNumber} (₦{Number(u.baseRent).toLocaleString()})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="startDate" className="text-sm font-semibold text-on-surface">Start Date</label>
                      <input
                        id="startDate"
                        type="date"
                        className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                        value={leaseStartDate}
                        onChange={(e) => setLeaseStartDate(e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="endDate" className="text-sm font-semibold text-on-surface">End Date</label>
                      <input
                        id="endDate"
                        type="date"
                        className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                        value={leaseEndDate}
                        onChange={(e) => setLeaseEndDate(e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="gracePeriod" className="text-sm font-semibold text-on-surface">Payment Grace Period (Days)</label>
                    <input
                      id="gracePeriod"
                      type="number"
                      min="0"
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded-[6px] bg-surface-container-lowest text-on-surface outline-none transition focus:border-brand-blue focus:ring-3 focus:ring-blue-500/15"
                      value={leaseGracePeriod}
                      onChange={(e) => setLeaseGracePeriod(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    className="min-h-[44px] bg-brand-deep-slate text-on-primary text-sm font-semibold rounded-[6px] cursor-pointer hover:bg-slate-800 transition disabled:opacity-55"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Lease...' : 'Create Lease'}
                  </button>
                </form>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="p-3 text-xs font-semibold uppercase text-on-surface-variant">Tenant</th>
                      <th className="p-3 text-xs font-semibold uppercase text-on-surface-variant">Property / Unit</th>
                      <th className="p-3 text-xs font-semibold uppercase text-on-surface-variant">Term</th>
                      <th className="p-3 text-xs font-semibold uppercase text-on-surface-variant">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {leases.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-sm text-on-surface-variant">
                          No lease agreements created yet.
                        </td>
                      </tr>
                    ) : (
                      leases.map((l) => (
                        <tr key={l.id} className="hover:bg-surface/50">
                          <td className="p-3.5 text-sm text-on-surface"><strong>{l.tenantName}</strong></td>
                          <td className="p-3.5 text-sm text-on-surface">{l.propertyName} - Unit {l.unitNumber}</td>
                          <td className="p-3.5 text-sm text-on-surface-variant">
                            {l.startDate} to {l.endDate} <br />
                            <small className="text-on-surface-variant">
                              Grace Period: {l.gracePeriodDays} days
                            </small>
                          </td>
                          <td className="p-3.5 text-sm">
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-brand-blue">
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
