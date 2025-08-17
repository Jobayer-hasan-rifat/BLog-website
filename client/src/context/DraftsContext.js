import React, { createContext, useState, useEffect } from 'react';

export const DraftsContext = createContext();

export const DraftsProvider = ({ children }) => {
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    const savedDrafts = JSON.parse(localStorage.getItem('miniblog_drafts') || '[]');
    setDrafts(savedDrafts);
  }, []);

  const addDraft = (draft) => {
    const newDraft = { ...draft, id: Date.now() };
    const updatedDrafts = [...drafts, newDraft];
    setDrafts(updatedDrafts);
    localStorage.setItem('miniblog_drafts', JSON.stringify(updatedDrafts));
  };

  const removeDraft = (draftId) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem('miniblog_drafts', JSON.stringify(updatedDrafts));
  };

  const updateDraft = (draftId, updatedDraft) => {
    const updatedDrafts = drafts.map(draft => 
      draft.id === draftId ? { ...draft, ...updatedDraft } : draft
    );
    setDrafts(updatedDrafts);
    localStorage.setItem('miniblog_drafts', JSON.stringify(updatedDrafts));
  };

  return (
    <DraftsContext.Provider value={{ drafts, addDraft, removeDraft, updateDraft }}>
      {children}
    </DraftsContext.Provider>
  );
};
