import React, { useState } from 'react';

export default function TrackSelector({ onSelectNCERT, onUploadPDF, isGenerating }) {
  const [selectedClass, setSelectedClass] = useState('10');
  const [subject, setSubject] = useState('Science');
  const [chapter, setChapter] = useState('Chemical Reactions');
  const [file, setFile] = useState(null);

  const handlePdfSubmit = (e) => {
    e.preventDefault();
    if (file) onUploadPDF(file);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Track 1: NCERT Preloaded */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 text-xs font-bold bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-md">TRACK 1</span>
          <h2 className="text-xl font-bold text-white">Curriculum Quizzes (NCERT)</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-zinc-800 text-white rounded-lg p-2.5 border border-zinc-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
            <option value="11">Class 11</option>
          </select>

          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="bg-zinc-800 text-white rounded-lg p-2.5 border border-zinc-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="Science">Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="History">Social Science</option>
          </select>

          <select 
            value={chapter} 
            onChange={(e) => setChapter(e.target.value)}
            className="bg-zinc-800 text-white rounded-lg p-2.5 border border-zinc-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="Chemical Reactions">Chemical Reactions</option>
            <option value="Electricity">Electricity</option>
            <option value="Life Processes">Life Processes</option>
          </select>
        </div>

        <button 
          onClick={() => onSelectNCERT({ selectedClass, subject, chapter })}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          Launch NCERT Battle
        </button>
      </div>

      {/* Track 2: PDF Upload */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 text-xs font-bold bg-purple-950 text-purple-400 border border-purple-800 rounded-md">TRACK 2</span>
          <h2 className="text-xl font-bold text-white">AI Custom Battle (PDF)</h2>
        </div>

        <form onSubmit={handlePdfSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-zinc-700 hover:border-purple-500 rounded-xl p-6 text-center transition-colors">
            <input 
              type="file" 
              accept="application/pdf"
              id="pdf-upload"
              disabled={isGenerating}
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden" 
            />
            <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
              <span className="text-3xl mb-1">📄</span>
              <span className="text-sm font-medium text-zinc-200">
                {file ? file.name : "Select study notes or chapter PDF"}
              </span>
              <span className="text-xs text-zinc-400 mt-1">PDF up to 5MB</span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={!file || isGenerating}
            className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 text-white transition-all ${
              !file || isGenerating ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                AI Generating Quiz Questions...
              </>
            ) : (
              "Generate & Start Battle"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}