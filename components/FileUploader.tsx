
import React from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from './ui/Button.tsx';

interface FileUploaderProps {
  title: string;
  filename: string;
  onFileUpload: (content: string, filename: string) => void;
  onClear: () => void;
}

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const FileUploader: React.FC<FileUploaderProps> = ({ title, filename, onFileUpload, onClear }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Security: Validate file size to prevent memory exhaustion
    if (file.size > MAX_FILE_SIZE) {
      alert(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      event.target.value = '';
      return;
    }

    // Security: Validate file type by checking both extension and MIME
    const allowedTypes = ['text/plain', 'text/markdown', 'text/x-markdown'];
    const allowedExtensions = ['.txt', '.md'];
    const hasValidExtension = allowedExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension || (!allowedTypes.includes(file.type) && file.type !== '')) {
      alert('Invalid file type. Please upload a .txt or .md file.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        onFileUpload(text, file.name);
      }
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  return (
    <div className="w-full max-w-md p-6 border-2 border-dashed rounded-lg border-border text-center bg-card">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {filename ? (
        <div className="flex items-center justify-between p-2 rounded-md bg-muted">
          <div className="flex items-center gap-2 truncate">
            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-foreground truncate" title={filename}>{filename}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={onClear} aria-label="Clear file">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">Upload a .txt or .md file</p>
          <label className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Select File
            <input type="file" className="hidden" accept=".txt,.md" onChange={handleFileChange} />
          </label>
        </>
      )}
    </div>
  );
};

export default FileUploader;
