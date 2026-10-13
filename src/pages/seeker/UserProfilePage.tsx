import React, { useState } from 'react';
import { User, Mail, MapPin, Phone, Briefcase, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/apiClient.ts';

export const UserProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [skillsStr, setSkillsStr] = useState(user?.skills?.join(', ') || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await api.updateProfile({
        name,
        headline,
        bio,
        location,
        phone,
        skills,
      });

      if (res.success) {
        await refreshUser();
        setSuccessMessage('Profile saved successfully to PostgreSQL database.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Profile & Engineering Credentials
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your verified professional details, candidate bio, and skills taxonomy
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Senior Full Stack & Cloud Architect"
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA (or Remote)"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 234-5678"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Skills Taxonomy (comma-separated)</label>
          <input
            type="text"
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Professional Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
