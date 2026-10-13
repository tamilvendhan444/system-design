import React, { useState, useEffect } from 'react';
import { Building, Globe, MapPin, Users, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../services/apiClient.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Company } from '../../types/index.ts';

export const CompanyProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const companyId = user?.companyId || 'comp-1';

  const [company, setCompany] = useState<Company | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.getCompany(companyId).then((res) => {
      if (res.success && res.data) {
        const c = res.data;
        setCompany(c);
        setName(c.name);
        setDescription(c.description);
        setIndustry(c.industry);
        setWebsite(c.website);
        setLocation(c.location);
        setSize(c.size);
      }
    });
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);

    try {
      const res = await api.updateCompany(companyId, {
        name,
        description,
        industry,
        website,
        location,
        size,
      });

      if (res.success) {
        setSuccess(true);
        await refreshUser();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Company Profile & Brand
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your enterprise employer branding, public description, and headquarters location
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Company profile updated successfully</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Website URL</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Size Band</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
            >
              <option value="10 - 50 employees">10 - 50 employees</option>
              <option value="50 - 250 employees">50 - 250 employees</option>
              <option value="250 - 500 employees">250 - 500 employees</option>
              <option value="500 - 1,000 employees">500 - 1,000 employees</option>
              <option value="1,000 - 5,000 employees">1,000 - 5,000 employees</option>
              <option value="5,000+ employees">5,000+ employees</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Company Overview & Culture</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors shadow-xs disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Save Company Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
