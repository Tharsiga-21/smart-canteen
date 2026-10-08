import React, { useState } from 'react';
import { PROJECT_FILES, ProjectSourceFile } from '../javaCodeFiles';
import { Copy, Check, Terminal, FileCode, Download } from 'lucide-react';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectSourceFile>(PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [unitFilter, setUnitFilter] = useState<string>('all');

  const filteredFiles = PROJECT_FILES.filter(file => {
    if (unitFilter === 'all') return true;
    return file.unit.toLowerCase().includes(unitFilter.toLowerCase());
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    PROJECT_FILES.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Compile & Run Quick Reference Card */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold tracking-tight text-white">
              Commands to Compile & Run the Pure Java Backend
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Requires JDK 11+ (No Maven / No external JARs)
          </span>
        </div>

        <div className="bg-black/50 rounded-lg p-3 font-mono text-xs text-emerald-400 space-y-1.5 border border-slate-800">
          <div><span className="text-slate-500"># 1. Compile all Java source files</span></div>
          <div className="text-white selection:bg-emerald-900">javac *.java</div>
          <div className="pt-1"><span className="text-slate-500"># 2. Run the Main server on port 8080</span></div>
          <div className="text-white selection:bg-emerald-900">java Main</div>
          <div className="pt-1"><span className="text-slate-500"># 3. Access in your browser</span></div>
          <div className="text-sky-300">Student Portal: http://localhost:8080/index.html</div>
          <div className="text-sky-300">Staff Portal:   http://localhost:8080/staff.html</div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: File List */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Unit Filter Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            {['all', 'Unit I', 'Unit II', 'Unit III', 'Unit IV', 'Frontend'].map(unit => (
              <button
                key={unit}
                onClick={() => setUnitFilter(unit)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  unitFilter === unit
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {unit === 'all' ? 'All Files' : unit}
              </button>
            ))}
          </div>

          {/* Files List */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {filteredFiles.map(file => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 flex items-start gap-2.5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-slate-100/80 font-medium' : 'hover:bg-slate-50'
                  }`}
                >
                  <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        {file.unit}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {file.purpose}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Download Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDownloadFile}
              className="flex-1 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download {selectedFile.name}
            </button>
            <button
              onClick={handleDownloadAll}
              className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              All Files
            </button>
          </div>
        </div>

        {/* Right Pane: Code Viewer */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-2xs">
          
          {/* Header Bar */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900">
                  {selectedFile.path}
                </span>
                <span className="text-[10px] text-slate-600 font-semibold bg-slate-200 px-1.5 py-0.5 rounded">
                  {selectedFile.unit}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedFile.purpose}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Body */}
          <div className="p-4 bg-slate-950 overflow-x-auto max-h-[620px] overflow-y-auto">
            <pre className="text-xs font-mono text-slate-200 leading-relaxed">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
};
