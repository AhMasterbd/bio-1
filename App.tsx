
import React, { useState, useEffect, useMemo } from 'react';
import { User, Note, SidebarTab } from './types';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { storageService } from './services/storageService';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import NoteList from './components/NoteList';
import AuthOverlay from './components/AuthOverlay';
import BottomNav from './components/BottomNav';
import FAB from './components/FAB';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState<SidebarTab>(SidebarTab.NOTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = storageService.subscribeToNotes(user.id, (fetchedNotes) => {
      setNotes(fetchedNotes);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (error) { console.error(error); }
  };

  const addNote = async (title: string, content: string, color: string) => {
    if (!user) return;
    await storageService.addNote(user.id, {
      title,
      content,
      color,
      isPinned: false,
      status: 'active'
    });
    setIsEditorOpen(false);
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    await storageService.updateNote(id, updates);
  };

  const deleteNote = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note?.status === 'deleted') {
      await storageService.deleteNote(id);
    } else {
      await updateNote(id, { status: 'deleted' });
    }
  };

  const duplicateNote = async (id: string) => {
    if (!user) return;
    await storageService.duplicateNote(user.id, id);
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesTab = note.status === (activeTab === SidebarTab.NOTES ? 'active' : activeTab === SidebarTab.ARCHIVE ? 'archived' : 'deleted');
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           note.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [notes, activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  // FIX: Removed onLogin prop as AuthOverlay component doesn't accept any props
  if (!user) return <AuthOverlay />;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f1f3f4] overflow-hidden">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onSearch={setSearchQuery} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => { setActiveTab(tab); if(isMobile) setIsSidebarOpen(false); }} 
          isOpen={isSidebarOpen} 
          isMobile={isMobile}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide pb-32">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            {!isMobile && activeTab === SidebarTab.NOTES && (
              <NoteEditor onSave={addNote} />
            )}
            
            <NoteList 
              notes={filteredNotes} 
              onUpdate={updateNote} 
              onDelete={deleteNote} 
              onDuplicate={duplicateNote}
              tab={activeTab}
            />
          </div>
        </main>
      </div>

      {isMobile && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
      
      {activeTab === SidebarTab.NOTES && (
        <FAB onClick={() => setIsEditorOpen(true)} />
      )}

      {isEditorOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl animate-in zoom-in-95 duration-200">
             <NoteEditor onSave={addNote} isModal onCancel={() => setIsEditorOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
