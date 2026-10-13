import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, Globe, ExternalLink, Briefcase, Search } from 'lucide-react';
import { api } from '../services/apiClient.ts';
import type { Company } from '../types/index.ts';

export const CompaniesDirectoryPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCompanies().then((res) => {
      if (res.success && res.data) {
        setCompanies(res.data);
      }
      setIsLoading(false);
    });
  }, []);

  const filtered = companies.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="border-b border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Enterprise Employers & Partners
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Discover leading cloud, AI, and distributed systems engineering organizations
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs max-w-xs w-full">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search companies or industry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs text-slate-800 focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((company) => (
            <div
              key={company.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-800 text-base border border-slate-200">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{company.name}</h3>
                      <div className="text-[11px] text-blue-600 font-semibold">{company.industry}</div>
                    </div>
                  </div>

                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                    Est. {company.foundedYear}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-3">
                  {company.description}
                </p>

                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {company.location}
                  </span>
                  <span>{company.size}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <span>Website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span />
                )}

                <Link
                  to={`/jobs?keyword=${encodeURIComponent(company.name)}`}
                  className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Briefcase className="h-3 w-3" />
                  <span>View Open Jobs</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
