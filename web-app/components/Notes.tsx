"use client";
import React, { useState } from 'react';
import { Plus, Folder, FileText, ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'folder';
  parentId?: string;
  children?: Note[];
  isExpanded?: boolean;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Welcome to Earth',
      content: 'Start organizing your thoughts here...',
      type: 'note'
    }
  ]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0]);
  const [isCreating, setIsCreating] = useState<'note' | 'folder' | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');

  const handleCreateItem = (type: 'note' | 'folder') => {
    if (newItemTitle.trim()) {
      const newItem: Note = {
        id: Date.now().toString(),
        title: newItemTitle,
        content: type === 'note' ? '' : '',
        type,
        children: type === 'folder' ? [] : undefined,
        isExpanded: type === 'folder' ? true : undefined
      };
      
      setNotes([...notes, newItem]);
      if (type === 'note') {
        setSelectedNote(newItem);
      }
      setNewItemTitle('');
      setIsCreating(null);
    }
  };

  const updateNoteContent = (content: string) => {
    if (selectedNote) {
      setNotes(notes.map(note => 
        note.id === selectedNote.id 
          ? { ...note, content }
          : note
      ));
      setSelectedNote({ ...selectedNote, content });
    }
  };

  const renderNoteTree = (noteList: Note[], level = 0) => {
    return noteList.map(note => (
      <div key={note.id} style={{ paddingLeft: `${level * 16}px` }}>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer",
            "hover:bg-muted/50 transition-colors duration-200",
            selectedNote?.id === note.id && "bg-primary/10 border border-primary/20"
          )}
          onClick={() => note.type === 'note' && setSelectedNote(note)}
        >
          {note.type === 'folder' ? (
            <>
              {note.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <Folder className="w-4 h-4 text-accent" />
            </>
          ) : (
            <FileText className="w-4 h-4 text-primary ml-4" />
          )}
          <span className="flex-1 text-sm font-medium">{note.title}</span>
          <MoreHorizontal className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
        </div>
        
        {note.type === 'folder' && note.isExpanded && note.children && (
          <div className="mt-1">
            {renderNoteTree(note.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Notes Sidebar */}
      <div className="w-80 border-r border-border bg-card/50 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Notes</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating('folder')}
                className="h-8 w-8 p-0 hover:bg-accent/20"
              >
                <Folder className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating('note')}
                className="h-8 w-8 p-0 hover:bg-primary/20"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {isCreating && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
              <Input
                placeholder={`${isCreating === 'note' ? 'Note' : 'Folder'} title...`}
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateItem(isCreating);
                  if (e.key === 'Escape') setIsCreating(null);
                }}
                className="mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleCreateItem(isCreating)}
                  className="h-7"
                >
                  Create
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(null)}
                  className="h-7"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {renderNoteTree(notes)}
          </div>
        </div>
      </div>

      {/* Note Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            <div className="p-6 border-b border-border bg-card/30 backdrop-blur-sm">
              <h1 className="text-2xl font-bold text-foreground">
                {selectedNote.title}
              </h1>
            </div>
            <div className="flex-1 p-6">
              <Card className="h-full p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <textarea
                  value={selectedNote.content}
                  onChange={(e) => updateNoteContent(e.target.value)}
                  placeholder="Start writing your thoughts..."
                  className="w-full h-full resize-none bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base leading-relaxed"
                />
              </Card>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Select a note to start writing
              </h3>
              <p className="text-muted-foreground">
                Choose a note from the sidebar or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default Notes
