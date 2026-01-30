"use client";

import { useCallback, useRef } from "react";
import { motion, Reorder } from "framer-motion";
import { Upload, File, X, GripVertical, Plus } from "lucide-react";

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  allowReorder?: boolean;
}

export function FileUploader({
  files,
  onFilesChange,
  accept = ".pdf",
  multiple = false,
  allowReorder = false,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (multiple) {
        onFilesChange([...files, ...droppedFiles]);
      } else {
        onFilesChange([droppedFiles[0]]);
      }
    },
    [files, multiple, onFilesChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (multiple) {
      onFilesChange([...files, ...selectedFiles]);
    } else {
      onFilesChange([selectedFiles[0]]);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const renderFileList = () => {
    if (allowReorder && files.length > 1) {
      return (
        <Reorder.Group
          axis="y"
          values={files}
          onReorder={onFilesChange}
          className="space-y-2"
        >
          {files.map((file, index) => (
            <Reorder.Item
              key={file.name + index}
              value={file}
              className="group flex cursor-grab items-center gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100 active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-white">
                <File className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="rounded-lg p-2 text-gray-400 opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-100 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      );
    }

    return (
      <div className="space-y-2">
        {files.map((file, index) => (
          <motion.div
            key={file.name + index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex items-center gap-3 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-white">
              <File className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-400">
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              onClick={() => removeFile(index)}
              className="rounded-lg p-2 text-gray-400 opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-100 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        id="file-upload"
      />

      {files.length === 0 ? (
        <label
          htmlFor="file-upload"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-12 transition-all duration-300 hover:border-black hover:bg-gray-50"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 transition-all group-hover:bg-black group-hover:text-white">
            <Upload className="h-8 w-8" />
          </div>
          <p className="mb-2 text-lg font-semibold">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-gray-400">
            {multiple ? "Select one or more files" : "Select a file"}
          </p>
        </label>
      ) : (
        <div>
          {renderFileList()}

          {multiple && (
            <label
              htmlFor="file-upload"
              className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-4 text-gray-500 transition-all hover:border-black hover:bg-gray-50 hover:text-black"
            >
              <Plus className="h-5 w-5" />
              Add more files
            </label>
          )}
        </div>
      )}
    </div>
  );
}
