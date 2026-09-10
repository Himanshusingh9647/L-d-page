import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, CheckSquare, Square, FileCheck } from 'lucide-react';

const POLICY_TEXT = `
CORPORATE POLICY DOCUMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 1 — PURPOSE AND SCOPE

1.1  This policy establishes the standards of conduct and compliance requirements for all employees, contractors, and representatives of the organization. It applies globally across all departments, subsidiaries, and affiliated entities.

1.2  The purpose of this document is to ensure that all personnel understand their responsibilities regarding ethical behavior, data protection, workplace safety, and regulatory compliance.

1.3  Failure to comply with the provisions outlined herein may result in disciplinary action, up to and including termination of employment and legal proceedings.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 2 — ETHICAL STANDARDS

2.1  All employees shall conduct themselves with integrity, honesty, and fairness in every business interaction. Ethical behavior is not merely encouraged — it is a condition of employment.

2.2  Conflicts of interest must be disclosed immediately to the employee's direct supervisor and the Compliance Department. This includes, but is not limited to:
    a) Financial interests in competing organizations
    b) Personal relationships with vendors or suppliers
    c) Outside employment that may interfere with duties
    d) Acceptance of gifts exceeding the nominal value threshold ($50 USD)

2.3  Insider trading and the use of material, non-public information for personal gain is strictly prohibited and constitutes a criminal offense.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 3 — DATA PROTECTION AND PRIVACY

3.1  The organization is committed to protecting the privacy of personal data in compliance with applicable data protection laws, including but not limited to GDPR, CCPA, and HIPAA.

3.2  Employees must:
    a) Only access data necessary for their role
    b) Never share login credentials or access tokens
    c) Report suspected data breaches within 24 hours
    d) Use approved encryption methods for sensitive data transmission
    e) Dispose of confidential documents via secure shredding

3.3  Personal data shall be collected and processed only with valid legal basis. Consent must be freely given, specific, informed, and unambiguous.

3.4  Data retention periods must comply with the organization's Data Retention Schedule (Document Ref: DRS-2024-01).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 4 — WORKPLACE CONDUCT

4.1  The organization maintains a zero-tolerance policy toward harassment, discrimination, and bullying in any form. This includes verbal, physical, visual, and electronic forms of misconduct.

4.2  All employees have the right to a safe, respectful workplace. Reports of misconduct will be investigated promptly and confidentially.

4.3  Retaliation against individuals who report concerns in good faith is strictly prohibited and will result in disciplinary action.

4.4  The organization supports diversity, equity, and inclusion as core values. Decisions regarding hiring, promotion, and compensation must be based solely on merit, qualifications, and business needs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 5 — HEALTH AND SAFETY

5.1  The organization is committed to providing a safe and healthy work environment in compliance with OSHA standards and local regulations.

5.2  Employees must:
    a) Report unsafe conditions immediately
    b) Use personal protective equipment as required
    c) Complete mandatory safety training programs
    d) Participate in emergency drills and exercises
    e) Maintain ergonomic workstation configurations

5.3  Incidents, injuries, and near-misses must be reported within 24 hours using the Incident Reporting System (IRS-Portal).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 6 — INTELLECTUAL PROPERTY

6.1  All intellectual property created during the course of employment is the sole property of the organization, unless otherwise specified in a written agreement.

6.2  Employees must respect third-party intellectual property rights, including copyrights, trademarks, patents, and trade secrets.

6.3  Unauthorized use, reproduction, or distribution of proprietary materials is strictly prohibited.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 7 — ACKNOWLEDGMENT AND AGREEMENT

By consenting below, you acknowledge that you have read, understood, and agree to comply with all provisions of this policy document. You further acknowledge that violations may result in disciplinary action, including termination and potential legal consequences.

Document Version: 3.2.1
Effective Date: January 1, 2025
Review Date: December 31, 2025
Classification: CONFIDENTIAL — INTERNAL USE ONLY
`;

export default function PdfViewer({ module }) {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Allow a small buffer of 5px for subpixel rendering issues
    if (scrollHeight - scrollTop <= clientHeight + 5) {
      setHasScrolledToBottom(true);
    }
  };

  const handleSubmit = () => {
    if (!agreed) return;
    setSubmitted(true);
    dispatch({
      type: 'MARK_COMPLETE',
      payload: { userId: state.currentUserId, moduleId: module.id },
    });
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message: `✅ "${module.title}" consent recorded.`, toastType: 'success' },
    });
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Title */}
      <h2 className="text-xl font-semibold text-slate-900 mb-2">{module.title}</h2>
      <p className="text-sm text-slate-600 mb-6">{module.description}</p>

      {/* Document viewer */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
          <FileCheck className="w-5 h-5 text-slate-500" />
          <span className="text-sm font-semibold text-slate-800">Policy Document</span>
          <span className="ml-auto text-xs text-slate-500 font-mono">v3.2.1 • Confidential</span>
        </div>

        {/* Scrollable content */}
        <div 
          className="h-[500px] overflow-y-auto p-8 font-mono text-sm text-slate-700 leading-relaxed whitespace-pre-wrap custom-scrollbar bg-white"
          onScroll={handleScroll}
        >
          {POLICY_TEXT}
        </div>

        {/* Consent footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-5">
          <label
            className={`flex items-start gap-3 cursor-pointer select-none ${
              submitted ? 'pointer-events-none opacity-80' : ''
            }`}
          >
            <button
              onClick={() => {
                if (!submitted && hasScrolledToBottom) setAgreed(!agreed);
              }}
              className="mt-0.5 flex-shrink-0"
              disabled={submitted || !hasScrolledToBottom}
              type="button"
            >
              {agreed ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
            </button>
            <span className="text-sm text-slate-800 leading-relaxed font-medium">
              I have read and agree to the policies above. I understand that non-compliance may
              result in disciplinary action as outlined in this document.
            </span>
          </label>

          <div className="mt-5 flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={!agreed || submitted}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
                agreed && !submitted
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : submitted
                  ? 'bg-green-100 text-green-800 cursor-default'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              {submitted ? '✓ Consent Recorded' : 'Submit Consent'}
            </button>
            {!hasScrolledToBottom && !submitted ? (
              <span className="text-sm text-amber-600 font-medium">
                Please scroll to the end of the document to consent.
              </span>
            ) : !agreed && !submitted ? (
              <span className="text-sm text-slate-500">
                Acknowledge the policy above to submit.
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
