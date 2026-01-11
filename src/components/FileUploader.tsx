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
                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-grab active:cursor-grabbing group hover:bg-gray-100 transition-colors"
                        >
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center flex-shrink-0">
                                <File className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-sm">{file.name}</p>
                                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <X className="w-4 h-4" />
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
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center flex-shrink-0">
                            <File className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-sm">{file.name}</p>
                            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                            onClick={() => removeFile(index)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X className="w-4 h-4" />
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
                    className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-black hover:bg-gray-50 transition-all duration-300 group"
                >
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-all">
                        <Upload className="w-8 h-8" />
                    </div>
                    <p className="font-semibold text-lg mb-2">Drop files here or click to upload</p>
                    <p className="text-gray-400 text-sm">
                        {multiple ? "Select one or more files" : "Select a file"}
                    </p>
                </label>
            ) : (
                <div>
                    {renderFileList()}

                    {multiple && (
                        <label
                            htmlFor="file-upload"
                            className="flex items-center justify-center gap-2 mt-4 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-black hover:bg-gray-50 transition-all text-gray-500 hover:text-black"
                        >
                            <Plus className="w-5 h-5" />
                            Add more files
                        </label>
                    )}
                </div>
            )}
        </div>
    );
}
