import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Award, MoreVertical, Download, ShieldCheck } from 'lucide-react';
import { mockCertificates } from '../../mock/certificates';

export default function Certificates() {
  return (
    <Card variant="compact" className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/30 pb-4">
        <CardTitle className="text-text font-semibold flex items-center gap-2">
          <Award size={18} className="text-primary" /> Credentials
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-1">
        <div className="space-y-4">
          {mockCertificates.map((cert) => (
            <div key={cert.id} className="group relative border border-slate-200/50 rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all bg-white cursor-default">
              
              {/* Header: Title & Menu */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-4">
                  <h4 className="font-semibold text-text text-[15px] mb-1">{cert.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="font-medium text-text">{cert.provider}</span>
                    <span>•</span>
                    <span>Issued {new Date(cert.issueDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                
                {/* Progressive Disclosure Menu */}
                <div className="relative">
                  <button className="text-text-secondary hover:text-text p-1 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <MoreVertical size={16} />
                  </button>
                  {/* Pseudo-menu for hover demonstration */}
                  <div className="absolute right-0 top-full mt-1 w-32 bg-surface border border-slate-200 shadow-md rounded-lg p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 translate-y-1 group-hover:translate-y-0">
                    <button className="w-full text-left px-3 py-1.5 text-xs font-medium text-text hover:bg-slate-50 rounded flex items-center gap-2">
                      <Download size={12} /> Download PDF
                    </button>
                    <button className="w-full text-left px-3 py-1.5 text-xs font-medium text-text hover:bg-slate-50 rounded flex items-center gap-2">
                      <ShieldCheck size={12} /> Verify Credential
                    </button>
                  </div>
                </div>
              </div>

              {/* Skill Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {cert.skills?.map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-slate-50 text-text-secondary border border-slate-200 text-[11px] font-medium rounded-full">
                    {skill}
                  </span>
                )) || (
                  // Fallback tags if mock doesn't have them
                  <>
                    <span className="px-2 py-0.5 bg-slate-50 text-text-secondary border border-slate-200 text-[11px] font-medium rounded-full">Security</span>
                    <span className="px-2 py-0.5 bg-slate-50 text-text-secondary border border-slate-200 text-[11px] font-medium rounded-full">Compliance</span>
                  </>
                )}
              </div>
              
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
