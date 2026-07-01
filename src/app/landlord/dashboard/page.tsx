"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getProperties, createProperty, getUnits, createUnit } from '@/lib/api/properties';
import { getTenants } from '@/lib/api/tenants';
import { getLeases, createLease } from '@/lib/api/leases';
import { PropertyResponse, UnitResponse, LeaseResponse, TenantResponse } from '@/types/api';

export default function LandlordDashboardPage() {
  const router = useRouter();

  // Retrieve user details safely
  const [user] = useState<{ email: string; roles: string[] } | null>(() => {
    if (typeof window !== 'undefined') {
      const userString = localStorage.getItem('rentflow_user');
      return userString ? JSON.parse(userString) : null;
    }
    return null;
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<'properties' | 'units' | 'leases'>('properties');

  // Lists & States
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [leases, setLeases] = useState<LeaseResponse[]>([]);
  const [tenants, setTenants] = useState<TenantResponse[]>([]);

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

    if (localProps) setProperties(JSON.parse(localProps));
    if (localUnits) setUnits(JSON.parse(localUnits));
    if (localLeases) setLeases(JSON.parse(localLeases));

    fetchPropertiesFromBackend();
    fetchTenantsFromBackend();
    fetchUnitsFromBackend();
    fetchLeasesFromBackend();
  }, []);

  const fetchPropertiesFromBackend = async () => {
    try {
      const data = await getProperties();
      setProperties(data);
      localStorage.setItem('rentflow_props', JSON.stringify(data));
    } catch (e) {
      console.warn('Could not fetch properties from backend, using local store:', e);
    }
  };

  const fetchTenantsFromBackend = async () => {
    try {
      const data = await getTenants();
      setTenants(data);
    } catch (e) {
      console.warn('Could not fetch tenants from backend, using local store:', e);
    }
  };

  const fetchUnitsFromBackend = async () => {
    try {
      const data = await getUnits();
      setUnits(data);
      localStorage.setItem('rentflow_units', JSON.stringify(data));
    } catch (e) {
      console.warn('Could not fetch units from backend, using local store:', e);
    }
  };

  const fetchLeasesFromBackend = async () => {
    try {
      const data = await getLeases();
      setLeases(data);
      localStorage.setItem('rentflow_leases', JSON.stringify(data));
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
      const data = await createProperty(payload);
      const updated = [...properties, data];
      setProperties(updated);
      localStorage.setItem('rentflow_props', JSON.stringify(updated));
      showFeedback('Property added successfully to backend!', 'success');
      resetPropertyForm();
    } catch (error: any) {
      console.error('Property creation backend failed, saving locally:', error);
      
      const newProp: PropertyResponse = {
        id: `local-prop-${Date.now()}`,
        name: propName,
        address: propAddress,
        propertyCode: propCode,
      };

      const updated = [...properties, newProp];
      setProperties(updated);
      localStorage.setItem('rentflow_props', JSON.stringify(updated));

      const errMsg = error.message || 'Backend unavailable.';
      showFeedback(`${errMsg} Property saved to local browser state!`, 'info');
      resetPropertyForm();
    } finally {
      setIsSubmitting(false);
    }
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
      const data = await createUnit(unitPropId, payload);
      const newUnit: UnitResponse = {
        id: data.id,
        propertyId: unitPropId,
        propertyName: propNameStr,
        unitNumber: data.unitNumber,
        baseRent: data.baseRent,
        status: data.status || 'VACANT',
      };

      const updated = [...units, newUnit];
      setUnits(updated);
      localStorage.setItem('rentflow_units', JSON.stringify(updated));
      showFeedback('Unit added successfully to backend!', 'success');
      resetUnitForm();
    } catch (error: any) {
      console.error('Unit creation backend failed, saving locally:', error);

      const newUnit: UnitResponse = {
        id: `local-unit-${Date.now()}`,
        propertyId: unitPropId,
        propertyName: propNameStr,
        unitNumber: unitNumber,
        baseRent: rent,
        status: 'VACANT',
      };

      const updated = [...units, newUnit];
      setUnits(updated);
      localStorage.setItem('rentflow_units', JSON.stringify(updated));

      const errMsg = error.message || 'Backend unavailable.';
      showFeedback(`${errMsg} Unit saved to local browser state!`, 'info');
      resetUnitForm();
    } finally {
      setIsSubmitting(false);
    }
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
      const data = await createLease(payload);
      const newLease: LeaseResponse = {
        id: data.id,
        tenantId: leaseTenantId,
        tenantName: tenantNameStr,
        unitId: leaseUnitId,
        unitNumber: unitNoStr,
        propertyName: propNameStr,
        startDate: data.startDate,
        endDate: data.endDate || '',
        gracePeriodDays: data.gracePeriodDays ?? graceDays,
        status: data.status || 'ACTIVE',
        nombaVactNumber: data.nombaVactNumber,
        nombaVactBank: data.nombaVactBank,
        nombaVactRef: data.nombaVactRef,
      };

      const updatedLeases = [...leases, newLease];
      setLeases(updatedLeases);
      localStorage.setItem('rentflow_leases', JSON.stringify(updatedLeases));

      const updatedUnits = units.map((u) => {
        if (u.id === leaseUnitId) {
          return { ...u, status: 'OCCUPIED' };
        }
        return u;
      });
      setUnits(updatedUnits);
      localStorage.setItem('rentflow_units', JSON.stringify(updatedUnits));

      const vactNum = data.nombaVactNumber || '9923847582';
      const vactBank = data.nombaVactBank || 'Wema Bank';
      const vactRef = data.nombaVactRef || `RF_LSE_${newLease.id.replace(/-/g, '')}`;

      const feedbackElement = (
        <div className="flex flex-col gap-2 w-full text-left font-sans">
          <div className="font-semibold text-on-secondary-container">Lease agreement created successfully in backend!</div>
          <div className="mt-1 text-xs border-t border-on-secondary-container/20 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="block text-[10px] uppercase font-bold opacity-75">Bank Name</span>
              <span className="font-semibold text-brand-deep-slate">{vactBank}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold opacity-75">Account Number</span>
              <span className="font-mono font-bold text-brand-deep-slate">{vactNum}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold opacity-75">Account Ref</span>
              <span className="font-mono text-brand-deep-slate">{vactRef}</span>
            </div>
          </div>
        </div>
      );

      showFeedback(feedbackElement, 'success');
      resetLeaseForm();
    } catch (error: any) {
      console.error('Lease creation backend failed, saving locally:', error);

      const newLease: LeaseResponse = {
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

      const updatedLeases = [...leases, newLease];
      setLeases(updatedLeases);
      localStorage.setItem('rentflow_leases', JSON.stringify(updatedLeases));

      const updatedUnits = units.map((u) => {
        if (u.id === leaseUnitId) {
          return { ...u, status: 'OCCUPIED' };
        }
        return u;
      });
      setUnits(updatedUnits);
      localStorage.setItem('rentflow_units', JSON.stringify(updatedUnits));

      const vactNum = '9923847582';
      const vactBank = 'Wema Bank';
      const vactRef = `RF_LSE_${newLease.id.replace(/-/g, '')}`;

      const errMsg = error.message || 'Backend unavailable.';
      const feedbackElement = (
        <div className="flex flex-col gap-2 w-full text-left font-sans">
          <div className="font-semibold">{errMsg} Lease saved to local browser state!</div>
          <div className="mt-1 text-xs border-t border-[#001a42]/20 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="block text-[10px] uppercase font-bold opacity-75">Bank Name (Mock)</span>
              <span className="font-semibold text-brand-deep-slate">{vactBank}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold opacity-75">Account Number (Mock)</span>
              <span className="font-mono font-bold text-brand-deep-slate">{vactNum}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold opacity-75">Account Ref (Mock)</span>
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

  // Stats Calculations for Metric Cards
  const totalProperties = properties.length;
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'OCCUPIED').length;
  const vacantUnits = units.filter((u) => u.status === 'VACANT').length;
  const activeLeases = leases.filter((l) => l.status === 'ACTIVE').length;

  return (
    <ProtectedRoute allowedRole="ROLE_LANDLORD">
      <div className="max-w-[1440px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 min-h-screen bg-background">

        {/* Sidebar Navigation */}
        <aside className="bg-brand-deep-slate text-on-primary rounded-lg p-6 flex flex-col justify-between lg:h-[calc(100vh-64px)] lg:sticky lg:top-8 shadow-sm">
          <div>
            <div className="text-2xl font-bold tracking-tight mb-6 font-sans">RentFlow</div>
            {user && (
              <div className="mb-6 text-xs opacity-80 border-b border-white/10 pb-4">
                <p className="font-sans text-[10px] uppercase tracking-wider text-[#7c839b]">Connected Landlord</p>
                <strong className="block text-sm mt-0.5 truncate font-sans font-semibold text-white">{user.email}</strong>
              </div>
            )}
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => { setActiveTab('properties'); setStatusMessage(null); }}
                className={`text-left px-3.5 py-2.5 rounded font-semibold text-sm transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  activeTab === 'properties'
                    ? 'bg-white/10 text-on-primary border-l-4 border-brand-emerald-green'
                    : 'text-[#7c839b] hover:bg-white/5 hover:text-white'
                }`}
              >
                Manage Properties
              </button>
              <button
                onClick={() => { setActiveTab('units'); setStatusMessage(null); }}
                className={`text-left px-3.5 py-2.5 rounded font-semibold text-sm transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  activeTab === 'units'
                    ? 'bg-white/10 text-on-primary border-l-4 border-brand-emerald-green'
                    : 'text-[#7c839b] hover:bg-white/5 hover:text-white'
                }`}
              >
                Manage Units
              </button>
              <button
                onClick={() => { setActiveTab('leases'); setStatusMessage(null); }}
                className={`text-left px-3.5 py-2.5 rounded font-semibold text-sm transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  activeTab === 'leases'
                    ? 'bg-white/10 text-on-primary border-l-4 border-brand-emerald-green'
                    : 'text-[#7c839b] hover:bg-white/5 hover:text-white'
                }`}
              >
                Manage Leases
              </button>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="mt-6 bg-transparent border border-white/20 text-on-primary py-2.5 rounded cursor-pointer font-semibold text-sm hover:bg-white/10 transition duration-150 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Sign Out
          </button>
        </aside>

        {/* Main Panel Content */}
        <main className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-outline-variant pb-4">
            <div className="headerInfo">
              <h1 className="text-2xl md:text-3xl font-semibold text-brand-deep-slate font-sans">Landlord Portal</h1>
              <p className="text-sm text-on-surface-variant">Define properties, units, and assign tenant leases with automated ledger splitting.</p>
            </div>
          </div>

          {/* Metric Cards Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-5 flex flex-col gap-1.5 shadow-sm transition hover:shadow-md duration-150">
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-sans">Properties Portfolio</div>
              <div className="text-3xl font-bold text-brand-deep-slate font-sans">{totalProperties}</div>
              <div className="text-xs text-on-surface-variant mt-1 font-sans">Registered physical properties</div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-5 flex flex-col gap-1.5 shadow-sm transition hover:shadow-md duration-150">
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-sans">Total Rental Units</div>
              <div className="text-3xl font-bold text-brand-deep-slate font-sans">{totalUnits}</div>
              <div className="text-xs text-on-surface-variant mt-1 flex justify-between font-sans">
                <span>Occupied: <strong className="text-brand-emerald-green">{occupiedUnits}</strong></span>
                <span>Vacant: <strong className="text-red-500">{vacantUnits}</strong></span>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-5 flex flex-col gap-1.5 shadow-sm transition hover:shadow-md duration-150">
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-sans">Active Contracts</div>
              <div className="text-3xl font-bold text-brand-deep-slate font-sans">{activeLeases}</div>
              <div className="text-xs text-on-surface-variant mt-1 font-sans">Running active tenant agreements</div>
            </div>
          </section>

          {/* Global Feedback Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded text-sm flex items-start gap-2 border font-sans ${
                statusMessage.type === 'success'
                  ? 'bg-secondary-container border-secondary/20 text-on-secondary-container'
                  : statusMessage.type === 'error'
                  ? 'bg-error-container border-error/20 text-on-error-container'
                  : 'bg-primary-fixed border-primary-fixed-dim/20 text-on-primary-fixed'
              }`}
              role="alert"
            >
              <div className="w-full">{statusMessage.text}</div>
            </div>
          )}

          {/* TAB 1: PROPERTIES */}
          {activeTab === 'properties' && (
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-brand-deep-slate border-b border-surface-container-low pb-2 mb-4 font-sans">Add Property</h2>
                <form onSubmit={handleAddProperty} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="propName" className="text-sm font-semibold text-on-surface">Property Name</label>
                    <input
                      id="propName"
                      type="text"
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none transition duration-150 focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
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
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none transition duration-150 focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
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
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none transition duration-150 focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
                      placeholder="e.g. OAK-01"
                      value={propCode}
                      onChange={(e) => setPropCode(e.target.value.toUpperCase())}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="submit"
                    className="min-h-[44px] bg-brand-deep-slate text-on-primary text-sm font-semibold rounded cursor-pointer hover:bg-slate-800 transition duration-150 disabled:opacity-55 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving Property...' : 'Save Property'}
                  </button>
                </form>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-4 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Property Name</th>
                      <th className="p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Code</th>
                      <th className="p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Address</th>
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
                        <tr key={p.id} className="hover:bg-surface-container-low/30 transition duration-100 border-b border-slate-100">
                          <td className="p-3.5 text-sm text-on-surface font-semibold">{p.name}</td>
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
              <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-brand-deep-slate border-b border-surface-container-low pb-2 mb-4 font-sans">Add Unit</h2>
                <form onSubmit={handleAddUnit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="unitProp" className="text-sm font-semibold text-on-surface">Select Property</label>
                    <select
                      id="unitProp"
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none transition duration-150 focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 cursor-pointer"
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
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none transition duration-150 focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
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
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none transition duration-150 focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
                      placeholder="e.g. 1500000"
                      value={unitBaseRent}
                      onChange={(e) => setUnitBaseRent(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="submit"
                    className="min-h-[44px] bg-brand-deep-slate text-on-primary text-sm font-semibold rounded cursor-pointer hover:bg-slate-800 transition duration-150 disabled:opacity-55 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving Unit...' : 'Save Unit'}
                  </button>
                </form>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-4 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Unit Number</th>
                      <th className="p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Property</th>
                      <th className="p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Base Rent</th>
                      <th className="p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
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
                        <tr key={u.id} className="hover:bg-surface-container-low/30 transition duration-100 border-b border-slate-100">
                          <td className="p-3.5 text-sm text-on-surface font-semibold">{u.unitNumber}</td>
                          <td className="p-3.5 text-sm text-on-surface">{u.propertyName}</td>
                          <td className="p-3.5 text-sm font-mono tabular-nums text-on-surface">₦ {Number(u.baseRent).toLocaleString()}</td>
                          <td className="p-3.5 text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                                u.status === 'VACANT' 
                                  ? 'bg-error-container text-on-error-container' 
                                  : u.status === 'OCCUPIED'
                                  ? 'bg-secondary-container text-on-secondary-container'
                                  : 'bg-warning-container text-on-warning-container'
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
              <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-brand-deep-slate border-b border-surface-container-low pb-2 mb-4 font-sans">Create Lease</h2>
                <form onSubmit={handleCreateLease} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="leaseTenant" className="text-sm font-semibold text-on-surface">Select Tenant</label>
                    <select
                      id="leaseTenant"
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none transition duration-150 focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 cursor-pointer"
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
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none transition duration-150 focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 cursor-pointer"
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
                        className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none transition duration-150 focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
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
                        className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none transition duration-150 focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
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
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-base border border-outline-variant rounded bg-surface-container-lowest text-on-surface outline-none transition duration-150 focus:border-tertiary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
                      value={leaseGracePeriod}
                      onChange={(e) => setLeaseGracePeriod(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    className="min-h-[44px] bg-brand-deep-slate text-on-primary text-sm font-semibold rounded cursor-pointer hover:bg-slate-800 transition duration-150 disabled:opacity-55 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Lease...' : 'Create Lease'}
                  </button>
                </form>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-4 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Tenant</th>
                      <th className="p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Property / Unit</th>
                      <th className="p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Term</th>
                      <th className="p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
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
                        <tr key={l.id} className="hover:bg-surface-container-low/30 transition duration-100 border-b border-slate-100">
                          <td className="p-3.5 text-sm text-on-surface font-semibold">{l.tenantName}</td>
                          <td className="p-3.5 text-sm text-on-surface">{l.propertyName} - Unit {l.unitNumber}</td>
                          <td className="p-3.5 text-sm text-on-surface-variant tabular-nums">
                            {l.startDate} to {l.endDate} <br />
                            <small className="text-on-surface-variant">
                              Grace Period: {l.gracePeriodDays} days
                            </small>
                          </td>
                          <td className="p-3.5 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                              l.status === 'ACTIVE'
                                ? 'bg-secondary-container text-on-secondary-container'
                                : l.status === 'PENDING_VIRTUAL_ACCOUNT' || l.status === 'PENDING'
                                ? 'bg-warning-container text-on-warning-container'
                                : 'bg-error-container text-on-error-container'
                            }`}>
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
