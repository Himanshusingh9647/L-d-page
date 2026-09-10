import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import VideoPlayer from '../components/VideoPlayer';
import PdfViewer from '../components/PdfViewer';

export default function ModuleViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();

  const module = state.modules.find((m) => m.id === id);

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Module Not Found</h2>
        <p className="text-slate-500 mb-6">The requested training module could not be found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return module.type === 'video' ? (
    <VideoPlayer module={module} />
  ) : (
    <PdfViewer module={module} />
  );
}
