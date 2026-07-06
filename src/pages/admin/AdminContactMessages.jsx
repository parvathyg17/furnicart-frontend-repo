import { useState, useEffect, useCallback } from "react";
import { Check, MailOpen, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import {
  fetchAdminContactMessages,
  markMessageRead,
  deleteContactMessage,
} from "../../features/contact/contactAPI.js";

import "../../styles/adminpanel.css";

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessageId, setConfirmMessageId] = useState(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminContactMessages({ page, pageSize: 10, search });
      setMessages(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError("Failed to load contact messages.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchDraft);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markMessageRead(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    } catch (err) {
      toast.error("Failed to mark message as read.");
    }
  };

  const requestDelete = (id) => {
    setConfirmMessageId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmMessageId) return;
    try {
      await deleteContactMessage(confirmMessageId);
      loadMessages();
      setConfirmOpen(false);
      setConfirmMessageId(null);
    } catch (err) {
      toast.error("Failed to delete message.");
      setConfirmOpen(false);
      setConfirmMessageId(null);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Contact Messages</h1>
        <p className="admin-page-subtitle">View and manage messages from the contact page</p>
      </div>

      <div className="admin-controls-row">
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            className="admin-input"
            placeholder="Search messages..."
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
          />
          <button type="submit" className="admin-btn-secondary">
            Search
          </button>
        </form>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading-state">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="admin-empty-state">No messages found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} style={{ opacity: msg.is_read ? 0.7 : 1, backgroundColor: msg.is_read ? "transparent" : "#f0f7ff" }}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(msg.created_at).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', hour12: false
                    })}
                  </td>
                  <td><strong>{msg.name}</strong></td>
                  <td><a href={`mailto:${msg.email}`}>{msg.email}</a></td>
                  <td>{msg.subject || "-"}</td>
                  <td>
                    <div style={{ maxHeight: "80px", overflowY: "auto", maxWidth: "300px", fontSize: "0.9rem" }}>
                      {msg.message}
                    </div>
                  </td>
                  <td>
                    {msg.is_read ? (
                      <span className="admin-badge admin-badge-success">Read</span>
                    ) : (
                      <span className="admin-badge admin-badge-warning">New</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      {!msg.is_read && (
                        <button
                          className="admin-action-btn"
                          onClick={() => handleMarkAsRead(msg.id)}
                          title="Mark as Read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        className="admin-action-btn delete"
                        onClick={() => requestDelete(msg.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="admin-pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="admin-btn-secondary"
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="admin-btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        titleId="delete-contact-message-title"
        title="Delete Message"
        hint="Are you sure you want to delete this message?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmMessageId(null);
        }}
      />
    </div>
  );
}
