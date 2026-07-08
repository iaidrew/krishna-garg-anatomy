import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FolderOpen, FileText, CheckCircle2, RefreshCw, X, HardDrive, Cpu } from "lucide-react";

interface UploadedFileState {
  id: string;
  name: string;
  size: string;
  progress: number;
  speed: string;
  eta: string;
  status: "uploading" | "completed" | "processing";
}

export default function UploadExperience() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset medical files for quick mock selection
  const presetFiles = [
    { name: "Cranial_Fossa_Specimen_3D.obj", size: "84.2 MB" },
    { name: "Coronary_Angiogram_Slices.dcm", size: "128.5 MB" },
    { name: "Dr_Garg_Lecture_4_AudioNote.mp3", size: "18.4 MB" }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFilesSelected(Array.from(e.target.files));
    }
  };

  const selectPreset = (name: string, size: string) => {
    const mockFileObj = { name, size };
    handleFilesSelected([mockFileObj] as any);
  };

  const handleFilesSelected = (files: File[]) => {
    files.forEach((file) => {
      const newFileId = "file_" + Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFileState = {
        id: newFileId,
        name: file.name,
        size: typeof file.size === "number" ? (file.size / (1024 * 1024)).toFixed(1) + " MB" : (file as any).size,
        progress: 0,
        speed: "0 MB/s",
        eta: "Calculating...",
        status: "uploading"
      };

      setUploadedFiles((prev) => [newFile, ...prev]);
      simulateUpload(newFileId);
    });
  };

  // Magical Upload and AI parsing simulation
  const simulateUpload = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...f, progress: 100, speed: "0 MB/s", eta: "Completed", status: "processing" }
              : f
          )
        );

        // Simulate AI indexing / parsing after successful upload
        setTimeout(() => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === id
                ? { ...f, status: "completed" }
                : f
            )
          );
        }, 1200);

      } else {
        // Calculate dynamic seed speed and ETA
        const speedNum = (Math.random() * 15 + 20).toFixed(1);
        const etaNum = Math.ceil((100 - progress) / parseFloat(speedNum));

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  ...f,
                  progress,
                  speed: `${speedNum} MB/s`,
                  eta: `${etaNum}s left`
                }
              : f
          )
        );
      }
    }, 300);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12 relative z-10">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-purple-600 uppercase bg-purple-50 px-3 py-1 rounded-full">
          GARG COGNITIVE INDEXER
        </span>
        <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-900 leading-none">
          Magical Dissection Upload
        </h2>
        <p className="text-xs text-slate-500 font-light">
          Synchronize your personal research, CT scans, audio diaries, or syllabi. Dr. Garg's AI indexes and processes documents directly into active dashboard insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* GIANT FLOATING GLASS DROP ZONE */}
        <div className="lg:col-span-7">
          <motion.div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            whileHover={{ scale: 1.005 }}
            className={`glass-panel rounded-3xl p-10 text-center relative border-2 border-dashed transition-all cursor-pointer h-96 flex flex-col items-center justify-center space-y-6 overflow-hidden ${
              isDragActive
                ? "border-purple-600 bg-purple-50/20 shadow-xl"
                : "border-purple-200 hover:border-purple-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />

            {/* Glowing background circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Animated Uploader Circle */}
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-18 h-18 rounded-full border border-purple-200 border-t-purple-600 border-r-purple-600 flex items-center justify-center absolute -inset-1"
              />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-100 to-purple-50 flex items-center justify-center text-purple-700 shadow-inner">
                <Upload className="w-6 h-6 animate-bounce" style={{ animationDuration: "3s" }} />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 font-display">
                Drag & Drop anatomical assets here
              </h4>
              <p className="text-xs text-slate-400 font-light max-w-xs mx-auto">
                Supports DICOM scans (.dcm), PDFs, 3D meshes (.obj, .gltf), medical journals, or MP3 clinical voice records.
              </p>
            </div>

            {/* Manual Browse Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider shadow cursor-pointer"
              >
                Choose File
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-white border border-purple-100 text-purple-950 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Folder Upload
              </button>
            </div>

            <span className="text-[9px] font-mono text-slate-400">
              Autosave active. Files secured server-side.
            </span>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: PRESETS AND ACTIVE UPLOAD INDICATORS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset files generator */}
          <div className="glass-panel-darker rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold font-mono text-purple-950 uppercase tracking-wider">
              SELECT PRESET SPECIMENS FOR TESTING
            </h3>
            <p className="text-[10px] text-slate-500 leading-normal font-light">
              No medical files handy? Instantly load one of our simulated anatomical specimens into the Garg AI pipeline:
            </p>

            <div className="space-y-2">
              {presetFiles.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => selectPreset(preset.name, preset.size)}
                  className="w-full text-left bg-white border border-purple-50 hover:border-purple-300 rounded-xl p-3 flex items-center justify-between transition-all hover:shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <div>
                      <h4 className="text-[11px] font-semibold text-slate-800 truncate max-w-[180px]">{preset.name}</h4>
                      <p className="text-[8px] text-slate-400 font-mono">{preset.size}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-purple-700 font-bold uppercase">INGEST →</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active upload stack */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono text-purple-900 uppercase tracking-widest">
              ACTIVE TRANSMISSION STATUS ({uploadedFiles.length})
            </h3>

            {uploadedFiles.length === 0 ? (
              <div className="glass-panel rounded-2xl p-6 text-center text-slate-400 italic text-xs leading-relaxed font-light">
                <HardDrive className="w-8 h-8 mx-auto text-purple-100 mb-2" />
                Transmitter idle. Drag files into portal to see live progress indices.
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {uploadedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white/80 border border-purple-50 rounded-2xl p-4 shadow-sm space-y-3 relative"
                    >
                      {/* File details row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700">
                            <FileText className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-bold text-slate-900 truncate max-w-[160px]">
                              {file.name}
                            </h4>
                            <span className="text-[9px] text-slate-400 font-mono">Size: {file.size}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Speed / Progress / Eta indicators */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                          {file.status === "uploading" && (
                            <>
                              <span>Uploading at {file.speed}</span>
                              <span className="font-bold text-purple-700">{file.progress}%</span>
                            </>
                          )}
                          {file.status === "processing" && (
                            <span className="text-amber-600 font-bold flex items-center gap-1">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                              AI CORE COGNITIVE PARSING...
                            </span>
                          )}
                          {file.status === "completed" && (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              INDEXED SUCCESSFULLY
                            </span>
                          )}
                          <span>{file.eta}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              file.status === "completed"
                                ? "bg-emerald-500"
                                : file.status === "processing"
                                ? "bg-amber-500"
                                : "bg-gradient-to-r from-purple-500 to-purple-700"
                            }`}
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Post-processing automated draft confirmation */}
                      {file.status === "completed" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-emerald-50/80 border border-emerald-100 rounded-lg p-2 flex items-start gap-1.5"
                        >
                          <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-[8px] text-emerald-800 leading-normal font-mono uppercase font-semibold">
                            Autosaved Draft. Garg AI Synapse matched 14 neuroanatomical tags with your cockpit.
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
