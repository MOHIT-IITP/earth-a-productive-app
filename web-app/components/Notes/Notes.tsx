'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Edit, Save, X, Trash2 } from 'lucide-react'

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
      <div className="mt-20 flex justify-center">
        <div className="text-lg">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[80vh] mt-20 border rounded-lg overflow-hidden shadow-lg">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 bg-gray-100 text-black border-r p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-lg">Notes</span>
            <button
              className="p-1 rounded hover:bg-gray-200"
              title="Create new note"
              onClick={handleCreateNote}
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {notes.length === 0 ? (
              <div className="text-gray-500">No notes yet.</div>
            ) : (
              <ul>
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className={`p-2 rounded cursor-pointer mb-1 ${
                      selectedNoteId === note.id ? 'bg-blue-200 font-semibold' : 'hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedNoteId(note.id)}
                  >
                    {note.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 p-6 relative">
        <button
          className="absolute top-4 left-4 z-10 p-1 rounded bg-gray-100 border hover:bg-gray-200"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          {sidebarOpen ? '<' : '>'}
        </button>
        
        {selectedNote ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              {isEditing ? (
                <div className="flex-1">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-2xl font-bold bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full"
                  />
                </div>
              ) : (
                <h2 className="text-2xl font-bold">{selectedNote.title}</h2>
              )}
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveNote}
                      className="p-2 rounded bg-green-500 text-white hover:bg-green-600"
                      title="Save changes"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 rounded bg-gray-300 hover:bg-gray-400"
                      title="Cancel editing"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                      title="Edit note"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-2 rounded bg-red-500 text-white hover:bg-red-600"
                      title="Delete note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-96 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start editing notes..."
              />
            ) : (
              <div className="text-gray-700 whitespace-pre-wrap">
                {typeof selectedNote.content === 'string' 
                  ? selectedNote.content 
                  : JSON.stringify(selectedNote.content, null, 2)
                }
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                  <h3 className="text-lg font-bold mb-4">Delete Note</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete "{selectedNote.title}"? This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteNote}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500">Select a note to view its content.</div>
        )}
      </div>
    </div>
  )
}

export default Notes