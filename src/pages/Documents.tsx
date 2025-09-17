import { useState } from 'react';
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
  Filter,
  Eye,
  Trash2,
  FolderOpen,
  Plus
} from 'lucide-react';
import { useLegalData } from '@/contexts/LegalDataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'image' | 'video' | 'audio' | 'other' | 'folder';
  size: number;
  uploadDate: Date;
  caseId?: string;
  clientId?: string;
  category: string;
  tags?: string[];
  url?: string;
}

const Documents = () => {
  const { cases, clients } = useLegalData();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [caseFilter, setCaseFilter] = useState('all');
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { toast } = useToast();

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Contract Agreement.pdf',
      type: 'pdf',
      size: 2048000, // 2MB
      uploadDate: new Date('2024-11-15'),
      caseId: '1',
      category: 'contract',
      tags: ['contract', 'agreement', 'signed'],
      url: '#'
    },
    {
      id: '2',
      name: 'Evidence Photo 1.jpg',
      type: 'image',
      size: 1536000, // 1.5MB
      uploadDate: new Date('2024-11-20'),
      caseId: '1',
      category: 'evidence',
      tags: ['evidence', 'photo', 'accident'],
      url: '#'
    },
    {
      id: '3',
      name: 'Court Order.pdf',
      type: 'pdf',
      size: 512000, // 512KB
      uploadDate: new Date('2024-12-01'),
      caseId: '2',
      category: 'court-order',
      tags: ['court', 'order', 'judgment'],
      url: '#'
    },
    {
      id: '4',
      name: 'Client Correspondence.docx',
      type: 'docx',
      size: 256000, // 256KB
      uploadDate: new Date('2024-12-05'),
      clientId: '1',
      category: 'correspondence',
      tags: ['client', 'letter', 'communication'],
      url: '#'
    }
  ]);

  const getFileIcon = (type: Document['type']) => {
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

  const getCategoryColor = (category: Document['category']) => {
    switch (category) {
      case 'evidence': return 'destructive';
      case 'contract': return 'default';
      case 'court-order': return 'secondary';
      case 'correspondence': return 'outline';
      default: return 'outline';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesCase = caseFilter === 'all' || doc.caseId === caseFilter;
    
    return matchesSearch && matchesType && matchesCategory && matchesCase;
  });

  const handleFileUpload = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mp3';
    
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        Array.from(files).forEach(file => {
          toast({
            title: "File Uploaded",
            description: `${file.name} (${formatFileSize(file.size)}) has been uploaded successfully.`,
          });
        });
      }
    };
    
    input.click();
  };

  const handleDownload = (doc: Document) => {
    toast({
      title: "Download Started",
      description: `Downloading ${doc.name}...`,
    });
  };

  const handleDelete = (doc: Document) => {
    if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      toast({
        title: "Document Deleted",
        description: `${doc.name} has been removed.`,
        variant: "destructive",
      });
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      });
      return;
    }

    // Create folder logic here
    toast({
      title: "Folder Created",
      description: `Folder "${newFolderName}" has been created successfully.`,
    });
    
    setNewFolderName('');
    setCreateFolderOpen(false);
  };

  // Group documents by category
  const documentsByCategory = {
    evidence: filteredDocuments.filter(d => d.category === 'evidence'),
    contract: filteredDocuments.filter(d => d.category === 'contract'),
    'court-order': filteredDocuments.filter(d => d.category === 'court-order'),
    correspondence: filteredDocuments.filter(d => d.category === 'correspondence'),
    other: filteredDocuments.filter(d => d.category === 'other')
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
            Document Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Secure storage for all legal documents
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleFileUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Documents
          </Button>
          <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button>
                <FolderOpen className="mr-2 h-4 w-4" />
                Create Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    placeholder="Enter folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateFolder} className="flex-1">
                    Create Folder
                  </Button>
                  <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(documents.reduce((sum, doc) => sum + doc.size, 0) / 1048576)} MB used
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evidence Files</CardTitle>
            <Image className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsByCategory.evidence.length}</div>
            <p className="text-xs text-muted-foreground">Case evidence</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contracts</CardTitle>
            <FileText className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsByCategory.contract.length}</div>
            <p className="text-xs text-muted-foreground">Legal agreements</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Court Orders</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsByCategory['court-order'].length}</div>
            <p className="text-xs text-muted-foreground">Judicial orders</p>
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
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents by name or tags..."
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

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="evidence">Evidence</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="court-order">Court Order</SelectItem>
                <SelectItem value="correspondence">Correspondence</SelectItem>
                <SelectItem value="other">Other</SelectItem>
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

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => {
          const associatedCase = doc.caseId ? cases.find(c => c.id === doc.caseId) : null;
          const associatedClient = doc.clientId ? clients.find(c => c.id === doc.clientId) : null;
          
          return (
            <Card key={doc.id} className="shadow-card-custom hover:shadow-elevated transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getFileIcon(doc.type)}
                    <div className="flex-1">
                      <CardTitle className="text-sm line-clamp-2">{doc.name}</CardTitle>
                      <CardDescription>{formatFileSize(doc.size)}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={getCategoryColor(doc.category)}>
                    {doc.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    Uploaded: {doc.uploadDate.toLocaleDateString('en-IN')}
                  </div>

                  {associatedCase && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Case: </span>
                      <span className="font-medium">{associatedCase.caseNumber}</span>
                    </div>
                  )}

                  {associatedClient && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Client: </span>
                      <span className="font-medium">{associatedClient.name}</span>
                    </div>
                  )}

                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-1 mt-4 pt-3 border-t">
                  <Button size="sm" variant="outline">
                    <Eye className="mr-2 h-3 w-3" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="mr-2 h-3 w-3" />
                    Download
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(doc)}
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <File className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' 
                ? 'No documents match your current filters.' 
                : 'Start by uploading your first document.'
              }
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
          <p className="text-muted-foreground mb-4">
            Supports PDF, DOC, DOCX, images, videos, and audio files
          </p>
          <Button onClick={handleFileUpload}>
            Choose Files to Upload
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Maximum file size: 50MB per file
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;