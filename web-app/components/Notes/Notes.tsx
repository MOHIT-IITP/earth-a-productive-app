'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Edit, Save, X, Trash2, Menu, FileText } from 'lucide-react'

interface Note {
  id: string;
  title: string;
  content: any;
  createdAt: string;
  updatedAt: string;
}

const Notes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  // Update edit form when selected note changes
  useEffect(() => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(typeof selectedNote.content === 'string' ? selectedNote.content : '');
    }
  }, [selectedNote]);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const notesData = await response.json();
        setNotes(notesData);
        if (notesData.length > 0 && !selectedNoteId) {
          setSelectedNoteId(notesData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Untitled',
          content: 'Start editing notes...',
        }),
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes(prev => [newNote, ...prev]);
        setSelectedNoteId(newNote.id);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;

    try {
      const response = await fetch(`/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(prev => prev.map(note => 
          note.id === selectedNote.id ? updatedNote : note
        ));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleCancelEdit = () => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(typeof selectedNote.content === 'string' ? selectedNote.content : '');
    }
    setIsEditing(false);
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;

    try {
      const response = await fetch(`/api/notes/${selectedNote.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove note from list
        const updatedNotes = notes.filter(note => note.id !== selectedNote.id);
        setNotes(updatedNotes);
        
        // Select next available note or clear selection
        if (updatedNotes.length > 0) {
          setSelectedNoteId(updatedNotes[0].id);
        } else {
          setSelectedNoteId(null);
        }
        
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-zinc-200 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="text-lg text-zinc-700 font-medium">Loading your notes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-300">
      <div className="flex h-screen mt-16">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-white/20 border-black/10 border-1 rounded-2xl backdrop-blur-xl ">
            <div className="p-6 border-b border-zinc-200/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-zinc-900 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-black to-zinc-700 bg-clip-text text-transparent">
                    Notes
                  </h1>
                </div>
                <button
                  onClick={handleCreateNote}
                  className="p-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  title="Create new note"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {notes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-zinc-500 text-sm">No notes yet</p>
                  <p className="text-zinc-400 text-xs mt-1">Create your first note to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedNoteId === note.id 
                          ? 'bg-zinc-900 text-white shadow-lg transform scale-105' 
                          : 'bg-white/60 hover:bg-zinc-100 hover:shadow-md border border-zinc-200/70'
                      }`}
                    >
                      <h3 className={`font-medium truncate ${
                        selectedNoteId === note.id ? 'text-white' : 'text-zinc-900'
                      }`}>
                        {note.title}
                      </h3>
                      <p className={`text-xs mt-1 truncate ${
                        selectedNoteId === note.id ? 'text-zinc-200' : 'text-zinc-500'
                      }`}>
                        {typeof note.content === 'string' ? note.content : 'Rich content'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1 relative">
          <div className="absolute top-2 left-2 z-10">
            <button
              onClick={() => setSidebarOpen((open) => !open)}
              className="p-2 bg-white/90 backdrop-blur-sm border border-zinc-200/70 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-zinc-100"
            >
              <Menu className="w-5 h-5 text-zinc-700" />
            </button>
          </div>
          
          <div className="h-full flex p-1 ">
            {selectedNote ? (
              <div className="w-full bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-200/70 p-8">
                <div className="flex items-center justify-between mb-6">
                  {isEditing ? (
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-3xl text-white font-bold  border-b-2 border-zinc-700 focus:border-black outline-none w-full "
                        placeholder="Note title..."
                      />
                    </div>
                  ) : (
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-black to-zinc-700 bg-clip-text text-white">
                      {selectedNote.title}
                    </h2>
                  )}
                  
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveNote}
                          className="p-3 bg-zinc-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          title="Save changes"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                          title="Cancel editing"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-3 bg-zinc-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          title="Edit note"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="p-3 bg-zinc-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          title="Delete note"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-96 p-6 border-2 border-zinc-200 rounded-xl resize-none focus:outline-none focus:ring-4 focus:ring-zinc-700/10 focus:border-zinc-700 text-black text-lg leading-relaxed bg-white/80"
                    placeholder="Start writing your notes here..."
                  />
                ) : (
                  <div className="prose prose-lg max-w-none">
                    <div className="text-white whitespace-pre-wrap leading-relaxed text-lg">
                      {typeof selectedNote.content === 'string' 
                        ? selectedNote.content 
                        : JSON.stringify(selectedNote.content, null, 2)
                      }
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <FileText className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">No Note Selected</h3>
                <p className="text-zinc-500">Choose a note from the sidebar to view its content</p>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 border border-zinc-200/70">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 text-center mb-4">Delete Note</h3>
                <p className="text-zinc-600 text-center mb-8">
                  Are you sure you want to delete <span className="font-semibold">"{selectedNote?.title}"</span>? 
                  This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-6 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-xl font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteNote}
                    className="flex-1 px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notes