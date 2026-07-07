"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getProperty, getUnits } from '@/lib/api/properties';
import { useAuthStore } from '@/store/authStore';
import { clearSession } from '@/lib/auth/session';
import { UnitResponse } from '@/types/api';

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  
  const user = useAuthStore(s => s.user);

  const { data: property, isLoading: isPropertyLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getProperty(propertyId)
  });

  const { data: unitsData, isLoading: isUnitsLoading } = useQuery({
    queryKey: ['units'],
    queryFn: () => getUnits()
  });

  const propertyUnits: UnitResponse[] = (unitsData || []).filter(
    (u: any) => u.propertyId === propertyId
  );

  const isLoading = isPropertyLoading || isUnitsLoading;

  if (isLoading) {
    return (
      <ProtectedRoute allowedRole="ROLE_LANDLORD">
        <DashboardShell
          sidebarTitle="RentFlow"
          userLabel="Connected Landlord"
          userEmail={user?.email}
          navItems={[{ id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }, { id: 'properties', label: 'Properties', icon: 'domain' }, { id: 'units', label: 'Units', icon: 'grid_view' }, { id: 'leases', label: 'Leases', icon: 'description' }]}
          activeItem="properties"
          onNavChange={(id) => { if (id === 'dashboard') router.push('/landlord/dashboard'); }}
          onSignOut={() => { clearSession(); router.replace('/login'); }}
        >
          <div className="flex items-center justify-center h-64">
            <p className="text-on-surface-variant font-body-md">Loading property details...</p>
          </div>
        </DashboardShell>
      </ProtectedRoute>
    );
  }

  if (!property) {
    return (
      <ProtectedRoute allowedRole="ROLE_LANDLORD">
        <DashboardShell
          sidebarTitle="RentFlow"
          userLabel="Connected Landlord"
          userEmail={user?.email}
          navItems={[{ id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }, { id: 'properties', label: 'Properties', icon: 'domain' }, { id: 'units', label: 'Units', icon: 'grid_view' }, { id: 'leases', label: 'Leases', icon: 'description' }]}
          activeItem="properties"
          onNavChange={(id) => { if (id === 'dashboard') router.push('/landlord/dashboard'); }}
          onSignOut={() => { clearSession(); router.replace('/login'); }}
        >
          <div className="flex items-center justify-center h-64">
            <p className="text-error font-body-md">Property not found.</p>
          </div>
        </DashboardShell>
      </ProtectedRoute>
    );
  }

  const occupiedUnitsCount = propertyUnits.filter((u) => u.status === 'OCCUPIED').length;
  const vacantUnitsCount = propertyUnits.filter((u) => u.status === 'VACANT').length;

  return (
    <ProtectedRoute allowedRole="ROLE_LANDLORD">
      <DashboardShell
        sidebarTitle="RentFlow"
        userLabel="Connected Landlord"
        userEmail={user?.email}
        navItems={[
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'properties', label: 'Properties', icon: 'domain' },
          { id: 'units', label: 'Units', icon: 'grid_view' },
          { id: 'leases', label: 'Leases', icon: 'description' },
        ]}
        activeItem="properties"
        onNavChange={(id) => {
          if (id === 'dashboard') router.push('/landlord/dashboard');
          else if (id === 'properties') router.push('/landlord/dashboard');
          else if (id === 'units') router.push('/landlord/dashboard'); // Or dedicated units page if exists
          else if (id === 'leases') router.push('/landlord/dashboard'); // Or dedicated leases page
        }}
        onSignOut={() => {
          clearSession();
          router.replace('/login');
        }}
      >
        <div className="flex flex-col gap-6 max-w-5xl mx-auto mt-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-variant pb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </button>
              <div>
                <h1 className="font-display-md text-headline-md font-bold text-on-surface tracking-tight">
                  {property.name}
                </h1>
                <p className="text-on-surface-variant font-code-md mt-1">Code: {property.propertyCode}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => router.push(`/landlord/properties/${property.id}/edit`)} variant="ghost" leadingIcon={<span className="material-symbols-outlined text-[18px]">edit</span>}>
                Edit Property
              </Button>
              <Button onClick={() => router.push(`/landlord/properties/${property.id}/units/new`)} variant="primary" leadingIcon={<span className="material-symbols-outlined text-[18px]">add</span>}>
                Add Unit
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Details */}
            <div className="md:col-span-1 flex flex-col gap-6">
              
              {/* Location Card */}
              <div className="bg-surface rounded-lg border border-outline-variant p-6">
                <h3 className="font-label-lg text-title-md font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                  Location
                </h3>
                <div className="flex flex-col gap-2">
                  <p className="font-body-md text-on-surface">{property.streetAddress}</p>
                  <p className="font-body-md text-on-surface">{property.city}, {property.state} {property.zipCode}</p>
                </div>
              </div>

              {/* Characteristics Card */}
              <div className="bg-surface rounded-lg border border-outline-variant p-6">
                <h3 className="font-label-lg text-title-md font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                  Details
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-body-md">Type</span>
                    <span className="font-body-md text-on-surface capitalize">{property.propertyType?.replace('_', ' ').toLowerCase() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-body-md">Total Capacity</span>
                    <span className="font-body-md text-on-surface">{property.totalUnits || 0} Units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-body-md">Occupied</span>
                    <span className="font-body-md text-secondary">{occupiedUnitsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-body-md">Vacant</span>
                    <span className="font-body-md text-error">{vacantUnitsCount}</span>
                  </div>
                </div>
              </div>

              {/* Operations Card */}
              <div className="bg-surface rounded-lg border border-outline-variant p-6">
                <h3 className="font-label-lg text-title-md font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">support_agent</span>
                  Operations
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-on-surface-variant font-label-sm uppercase tracking-wider">Property Manager</span>
                    <span className="font-body-md text-on-surface">{property.propertyManagerName || 'Not assigned'}</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-on-surface-variant font-label-sm uppercase tracking-wider">Emergency Contact</span>
                    <span className="font-body-md text-on-surface">{property.emergencyContactNumber || 'Not assigned'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Units List */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <div className="bg-surface rounded-lg border border-outline-variant flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-outline-variant bg-surface-container-low/30">
                  <h2 className="font-headline-md text-title-lg font-bold text-on-surface">Units in {property.name}</h2>
                  <p className="text-on-surface-variant text-body-md mt-1">
                    Showing {propertyUnits.length} of {property.totalUnits || 0} available units
                  </p>
                </div>

                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-lowest">
                        <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/50">Unit</th>
                        <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/50">Details</th>
                        <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/50">Base Rent</th>
                        <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/50">Status</th>
                        <th className="px-6 py-4 text-on-surface-variant font-label-md text-label-md border-b border-outline-variant/50 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/50">
                      {propertyUnits.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center font-body-md text-on-surface-variant">
                            No units have been added to this property yet.
                          </td>
                        </tr>
                      ) : (
                        propertyUnits.map((u) => (
                          <tr key={u.id} className="hover:bg-surface-container-low/20 transition-colors group">
                            <td className="px-6 py-4 font-semibold text-on-surface font-body-md">{u.unitNumber}</td>
                            <td className="px-6 py-4 text-on-surface-variant font-body-md text-sm">
                              {u.bedrooms} Bed, {u.bathrooms} Bath • {u.squareFootage} sqft
                            </td>
                            <td className="px-6 py-4 font-code-md text-on-surface">
                              ₦ {Number(u.baseRent).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={u.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                disabled={u.status !== 'VACANT'}
                                onClick={() => router.push(`/landlord/units/${u.id}/edit`)}
                              >
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
