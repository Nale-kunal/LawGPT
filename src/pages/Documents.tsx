import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  File,
  FileText,
  Image,
  Video,
  Music,
  Download,
  Search,
  Eye,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { useLegalData } from '@/contexts/LegalDataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ApiFile { _id: string; name: string; mimetype: string; size: number; url: string; createdAt: string; folderId?: string; tags?: string[] }
interface ApiFolder { _id: string; name: string; parentId?: string }

type DocType = 'pdf' | 'doc' | 'docx' | 'image' | 'video' | 'audio' | 'other';

const Documents = () => {
  const { cases } = useLegalData();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [caseFilter, setCaseFilter] = useState('all');
  const { toast } = useToast();

  const [folders, setFolders] = useState<ApiFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [files, setFiles] = useState<ApiFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const backendUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

  const detectType = (mimetype: string): DocType => {
    if (mimetype.includes('pdf')) return 'pdf';
    if (mimetype.includes('image')) return 'image';
    if (mimetype.includes('video')) return 'video';
    if (mimetype.includes('audio')) return 'audio';
    if (mimetype.includes('msword')) return 'doc';
    if (mimetype.includes('officedocument.wordprocessingml')) return 'docx';
    return 'other';
  };

  const getFileIcon = (type: DocType) => {
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-destructive" />;
      case 'image':
        return <Image className="h-8 w-8 text-primary" />;
      case 'video':
        return <Video className="h-8 w-8 text-secondary" />;
      case 'audio':
        return <Music className="h-8 w-8 text-accent" />;
      default:
        return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || detectType(f.mimetype) === typeFilter;
      const matchesCase = caseFilter === 'all';
      return matchesSearch && matchesType && matchesCase;
    });
  }, [files, searchTerm, typeFilter, caseFilter]);

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mp3';

    input.onchange = async (event) => {
      const f = (event.target as HTMLInputElement).files;
      if (!f || f.length === 0) return;
      const form = new FormData();
      Array.from(f).forEach(file => form.append('files', file));
      if (currentFolderId) form.append('folderId', currentFolderId);
      try {
        setIsLoading(true);
        const res = await fetch('/api/documents/upload', { method: 'POST', credentials: 'include', body: form });
        if (!res.ok) throw new Error('Upload failed');
        await loadFiles();
        toast({ title: 'Files uploaded successfully' });
      } catch {
        toast({ title: 'Upload failed', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    input.click();
  };

  const fileUrl = (doc: ApiFile) => `${backendUrl}${doc.url}`;

  const handleDownload = (doc: ApiFile) => {
    const a = document.createElement('a');
    a.href = fileUrl(doc);
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async (doc: ApiFile) => {
    if (!confirm(`Delete ${doc.name}?`)) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/documents/files/${doc._id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Delete failed');
      await loadFiles();
      toast({ title: 'Document deleted' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const printDocument = (doc: ApiFile) => {
    const url = fileUrl(doc);
    const type = detectType(doc.mimetype);
    const w = window.open('', '_blank');
    if (!w) return;
    const safeUrl = url;
    const content = type === 'image'
      ? `<img src="${safeUrl}" style="max-width:100%;" onload="window.print();window.close();" />`
      : `<iframe src="${safeUrl}" style="width:100%;height:100vh;border:0;" onload="setTimeout(()=>{window.print();window.close();},300);"></iframe>`;
    w.document.write(`<html><head><title>${doc.name}</title></head><body style="margin:0">${content}</body></html>`);
    w.document.close();
  };

  const loadFolders = async () => {
    const res = await fetch('/api/documents/folders', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setFolders(data.folders);
    }
  };

  const loadFiles = async () => {
    if (!currentFolderId) { setFiles([]); return; }
    const q = `?folderId=${currentFolderId}`;
    const res = await fetch(`/api/documents/files${q}`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setFiles(data.files);
    }
  };

  useEffect(() => { loadFolders(); }, []);
  useEffect(() => { loadFiles(); }, [currentFolderId]);

  const createFolder = async () => {
    const name = prompt('Folder name');
    if (!name) return;
    const res = await fetch('/api/documents/folders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ name, parentId: currentFolderId })
    });
    if (res.ok) { await loadFolders(); toast({ title: 'Folder created' }); }
  };

  const renameFolder = async (folder: ApiFolder) => {
    const name = prompt('New folder name', folder.name);
    if (!name) return;
    const res = await fetch(`/api/documents/folders/${folder._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ name })
    });
    if (res.ok) { await loadFolders(); toast({ title: 'Folder renamed' }); }
  };

  const deleteFolder = async (folder: ApiFolder) => {
    if (!confirm(`Delete folder "${folder.name}" and its files?`)) return;
    const res = await fetch(`/api/documents/folders/${folder._id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) { if (currentFolderId === folder._id) setCurrentFolderId(undefined); await loadFolders(); await loadFiles(); toast({ title: 'Folder deleted' }); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">Secure storage for all legal documents</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleFileUpload} disabled={isLoading}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Documents
          </Button>
          <Button onClick={createFolder} disabled={isLoading}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Create Folder
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
            <p className="text-xs text-muted-foreground">{Math.round(files.reduce((s, f) => s + f.size, 0) / 1048576)} MB used</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
            <Image className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.filter(f => detectType(f.mimetype) === 'image').length}</div>
            <p className="text-xs text-muted-foreground">Image files</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PDF/Docs</CardTitle>
            <FileText className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.filter(f => ['pdf','doc','docx'].includes(detectType(f.mimetype))).length}</div>
            <p className="text-xs text-muted-foreground">Documents</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
            <Video className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.filter(f => detectType(f.mimetype) === 'video').length}</div>
            <p className="text-xs text-muted-foreground">Video files</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search & Filter Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64" />
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="doc">DOC</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>

            <Select value={caseFilter} onValueChange={setCaseFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Case" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                {cases.map(case_ => (
                  <SelectItem key={case_.id} value={case_.id}>
                    {case_.caseNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {folders.map((f) => (
          <Card key={f._id} className={"shadow-card-custom hover:shadow-elevated transition cursor-pointer " + (currentFolderId === f._id ? 'ring-2 ring-primary' : '')} onClick={() => setCurrentFolderId(f._id)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{f.name}</span>
                <span className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); renameFolder(f); }} title="Rename">✎</Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteFolder(f); }} title="Delete">🗑</Button>
                </span>
              </CardTitle>
              <CardDescription>Select to view documents</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredFiles.map((doc) => {
          const type = detectType(doc.mimetype);
          return (
            <Card key={doc._id} className="shadow-card-custom hover:shadow-elevated transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getFileIcon(type)}
                    <div className="flex-1">
                      <CardTitle className="text-sm line-clamp-2">{doc.name}</CardTitle>
                      <CardDescription>{formatFileSize(doc.size)}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    Uploaded: {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>

                 <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t">
                  <Button size="sm" variant="outline" onClick={() => window.open(fileUrl(doc), '_blank', 'noopener') || undefined}>
                    <Eye className="mr-2 h-3 w-3" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownload(doc)}>
                    <Download className="mr-2 h-3 w-3" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => printDocument(doc)}>Print</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(doc)}>
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFiles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <File className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter !== 'all' ? 'No documents match your current filters.' : 'Start by uploading your first document.'}
            </p>
            <Button onClick={handleFileUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card className="shadow-card-custom border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
        <CardContent className="text-center py-8">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Drop files here to upload</h3>
          <p className="text-muted-foreground mb-4">Supports PDF, DOC, DOCX, images, videos, and audio files</p>
          <Button onClick={handleFileUpload}>Choose Files to Upload</Button>
          <p className="text-xs text-muted-foreground mt-2">Maximum file size: 50MB per file</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;