
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ScannedDoc } from './types';
import { Scanner } from './components/Scanner';
import { analyzeDocument } from './services/geminiService';
import { SignaturePad } from './components/SignaturePad';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>('dashboard');
  const [docs, setDocs] = useState<ScannedDoc[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSignPad, setShowSignPad] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('scanflow_docs');
    if (saved) {
      setDocs(JSON.parse(saved));
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('scanflow_docs', JSON.stringify(docs));
  }, [docs]);

  const handleNewScan = () => {
    setView('camera');
  };

  const processScan = async (image: string) => {
    setView('dashboard');
    setIsProcessing(true);
    
    try {
      const analysis = await analyzeDocument(image);
      const newDoc: ScannedDoc = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        originalImage: image,
        title: analysis.title,
        category: analysis.category,
        extractedText: analysis.extractedText,
        summary: analysis.summary,
        status: 'ready'
      };
      setDocs(prev => [newDoc, ...prev]);
      setActiveDocId(newDoc.id);
      setView('review');
    } catch (err) {
      console.error("Processing failed:", err);
      alert("AI analysis failed. Please try again or check your API key.");
    } finally {
      setIsProcessing(false);
    }
  };

  const activeDoc = docs.find(d => d.id === activeDocId);

  const deleteDoc = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    if (activeDocId === id) {
      setView('dashboard');
      setActiveDocId(null);
    }
  };

  const handleAddSignature = (signature: string) => {
    setDocs(prev => prev.map(d => d.id === activeDocId ? { ...d, signature } : d));
    setShowSignPad(false);
  };

  const exportDoc = (doc: ScannedDoc) => {
    // Simple export: print as PDF
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between glass sticky top-0 z-40 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V5A3,3,0,0,0,19,2ZM5,4H19a1,1,0,0,1,1,1V13.58a3,3,0,0,0-1.28-.27,3,3,0,0,0-2.53,1.38l-2-2a1,1,0,0,0-1.41,0L10,15.41l-1.29-1.29a1,1,0,0,0-1.41,0L4,17.41V5A1,1,0,0,1,5,4ZM19,20H5a1,1,0,0,1-1-1v-.17l3.29-3.29L8.59,17a1,1,0,0,0,1.41,0L12.71,14.3l2,2A1,1,0,0,0,16,16.58a1,1,0,0,0,1.41-1.41l-.7-.7.29-.29H19a1,1,0,0,1,1,1V19A1,1,0,0,1,19,20Z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">ScanFlow AI</h1>
        </div>
        <button 
          onClick={() => setView('dashboard')}
          className="text-slate-400 hover:text-slate-600 p-2 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1,0,001 1h3m10-11l2 2m-2-2v10a1 1,0,01-1 1h-3m-6 0a1 1,0,001-1v-4a1 1,0,011-1h2a1 1,0,011 1v4a1 1,0,001 1m-6 0h6" /></svg>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-32">
        {view === 'dashboard' && (
          <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isProcessing && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="font-semibold text-blue-800">AI is analyzing your scan...</h3>
                <p className="text-sm text-blue-600 mt-1">Enhancing details and extracting text</p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">Recent Documents</h2>
              {docs.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1,0,01.707.293l5.414 5.414a1 1,0,01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p>Your workspace is empty.</p>
                  <button onClick={handleNewScan} className="mt-4 text-blue-600 font-medium">Start Scanning</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {docs.map(doc => (
                    <div 
                      key={doc.id}
                      onClick={() => { setActiveDocId(doc.id); setView('review'); }}
                      className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition cursor-pointer flex gap-4"
                    >
                      <div className="w-20 h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                        <img src={doc.originalImage} alt={doc.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 py-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition truncate max-w-[180px]">{doc.title}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">{doc.category}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{new Date(doc.timestamp).toLocaleDateString()}</p>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{doc.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-100">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h4 className="font-bold mb-1">Workflows</h4>
                <p className="text-xs text-white/80">Automate your document filing.</p>
              </div>
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg shadow-orange-100">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h4 className="font-bold mb-1">Security</h4>
                <p className="text-xs text-white/80">Vault for sensitive documents.</p>
              </div>
            </div>
          </div>
        )}

        {view === 'review' && activeDoc && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-slate-900 p-6 flex justify-center">
              <div className="relative w-full max-w-xs shadow-2xl rounded-lg overflow-hidden border border-white/10">
                <img src={activeDoc.originalImage} className="w-full h-auto" alt="Scan" />
                {activeDoc.signature && (
                  <img 
                    src={activeDoc.signature} 
                    className="absolute bottom-10 right-10 w-32 h-auto mix-blend-multiply filter contrast-200" 
                    alt="Signature" 
                  />
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{activeDoc.title}</h2>
                  <p className="text-slate-500">{activeDoc.category} &bull; {new Date(activeDoc.timestamp).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => deleteDoc(activeDoc.id)}
                  className="text-red-500 p-2 hover:bg-red-50 rounded-full transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1,0,00-1-1h-4a1 1,0,00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">AI Summary</h3>
                <p className="text-slate-700 leading-relaxed">{activeDoc.summary}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowSignPad(true)}
                    className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-slate-100 rounded-2xl font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 transition active:scale-95"
                  >
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Sign
                  </button>
                  <button 
                    onClick={() => exportDoc(activeDoc)}
                    className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-slate-100 rounded-2xl font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 transition active:scale-95"
                  >
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3,0,003 3h10a3 3,0,003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Extracted Text (OCR)</h3>
                <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 font-mono text-xs text-slate-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {activeDoc.extractedText}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Call to Action Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 p-6">
        <div className="bg-slate-900 rounded-full shadow-2xl p-2 flex items-center justify-between text-white border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex-1 py-3 rounded-full flex items-center justify-center transition-colors ${view === 'dashboard' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <button 
            onClick={handleNewScan}
            className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 -mt-8 border-4 border-slate-900 active:scale-90 transition-all"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>

          <button 
            onClick={() => setView('settings')}
            className={`flex-1 py-3 rounded-full flex items-center justify-center transition-colors ${view === 'settings' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3,0,11-6 0 3 3,0,016 0z" /></svg>
          </button>
        </div>
      </nav>

      {/* Modals */}
      {view === 'camera' && (
        <Scanner onCapture={processScan} onCancel={() => setView('dashboard')} />
      )}

      {showSignPad && (
        <SignaturePad 
          onSave={handleAddSignature} 
          onClose={() => setShowSignPad(false)} 
        />
      )}

      {view === 'settings' && (
        <div className="fixed inset-0 z-50 bg-white p-6 animate-in slide-in-from-bottom-full duration-300">
           <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Settings</h2>
            <button onClick={() => setView('dashboard')} className="p-2 bg-slate-100 rounded-full">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
           </div>
           
           <div className="space-y-4">
             <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-semibold">Automatic Upload</p>
                  <p className="text-xs text-slate-500">Sync with Google Drive</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-semibold">OCR Language</p>
                  <p className="text-xs text-slate-500">English (US)</p>
                </div>
                <span className="text-blue-600 font-medium">Change</span>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="font-semibold">Workflow Defaults</p>
                <div className="mt-2 space-y-2">
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Receipts &rarr; Expenses Folder</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>Contracts &rarr; Legal Folder</span>
                   </div>
                </div>
             </div>
           </div>

           <div className="mt-12 p-6 bg-blue-600 rounded-3xl text-white text-center">
              <h3 className="font-bold text-xl mb-2">Upgrade to Pro</h3>
              <p className="text-white/80 text-sm mb-6">Unlimited scans, multi-page PDFs, and advanced teamwork integrations.</p>
              <button className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg">Start Free Trial</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
