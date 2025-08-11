import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { deletePost, updatePost } from '../services/posts';
import Modal from './Modal';
import { ToastContext } from '../context/ToastContext';

const PostMenu = ({ post }) => {
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({ title: post.title, content: post.content });

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const canManage = user && (user.role === 'admin' || user.id === (post.author?._id || post.author?.id));
  if (!canManage) return null;

  return (
    <div ref={ref} style={{ position: 'absolute', top: 8, right: 8 }}>
      <button className="btn btn--secondary" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>⋯</button>
      {open && (
        <div className="card" role="menu" style={{ position: 'absolute', right: 0, marginTop: 8, padding: 8, display: 'grid', gap: 8 }}>
          <button className="btn" onClick={() => { setEditOpen(true); setOpen(false); }}>Edit</button>
          <button className="btn btn--secondary" onClick={() => { setConfirmOpen(true); setOpen(false); }}>Delete</button>
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <h3 style={{ marginTop: 0 }}>Edit post</h3>
        <div className="stack">
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="input" rows="6" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <div className="row">
            <button className="btn" onClick={async () => {
              const updated = await updatePost(post._id, form);
              addToast('Post updated','success');
              // Update the post inline without reload by dispatching a custom event
              window.dispatchEvent(new CustomEvent('post:updated', { detail: { id: post._id, post: updated } }));
              setEditOpen(false);
            }}>Save</button>
            <button className="btn btn--secondary" onClick={() => setEditOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h3 style={{ marginTop: 0 }}>Delete post?</h3>
        <p>This action cannot be undone.</p>
        <div className="row">
          <button className="btn" onClick={async () => { await deletePost(post._id); addToast('Post deleted','success'); window.location.reload(); }}>Delete</button>
          <button className="btn btn--secondary" onClick={() => setConfirmOpen(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default PostMenu;


