import { useState, useEffect, useCallback } from "react";
import {
  Check,
  MailOpen,
  Trash2,
  Search,
  Eye,
  Mail,
  Clock,
  Send,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal.jsx";

import {
  fetchAdminContactMessages,
  markMessageRead,
  deleteContactMessage,
} from "../../features/contact/contactAPI.js";

import "../../styles/adminpanel.css";
import "../../styles/admin-return.css";

const TABS = [
  { value: "", label: "All Messages" },
  { value: "false", label: "New / Unread" },
  { value: "true", label: "Read" },
];

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
  const [status, setStatus] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminContactMessages({
        page,
        pageSize: 10,
        search,
        isRead: status,
      });
      setMessages(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError("Failed to load contact messages.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

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
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)),
      );
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage((prev) => ({ ...prev, is_read: true }));
      }
      toast.success("Message marked as read.");
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
      toast.success("Message deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete message.");
      setConfirmOpen(false);
      setConfirmMessageId(null);
    }
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard!");
  };

  return (
    <div className="ar-artisan">
      <div className="ar-breadcrumb">
        Administration
        <span>/</span>
        Contact Messages
      </div>

      <h1 className="ar-title">Contact Messages</h1>
      <p className="ar-lead">
        Manage customer feedback, shipping queries, and return request
        correspondence.
      </p>

      {/* TOOLBAR */}
      <div className="ar-toolbar" style={{ justifyContent: "space-between" }}>
        <div className="ar-search-wrap" style={{ maxWidth: "450px" }}>
          <form onSubmit={handleSearchSubmit} className="ar-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
            {searchDraft && (
              <button
                type="button"
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "var(--ar-muted)",
                }}
                onClick={() => {
                  setSearchDraft("");
                  setSearch("");
                  setPage(1);
                }}
              >
                <X size={16} />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* TABS */}
      <ul className="ar-tabs">
        {TABS.map((tab) => (
          <li key={tab.value}>
            <button
              type="button"
              className={`ar-tab ${status === tab.value ? "ar-tab--active" : ""}`}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {error && <div className="ar-error">{error}</div>}

      {/* TABLE CONTAINER */}
      <div className="ar-card">
        {loading ? (
          <div className="ar-loading">Loading contact messages...</div>
        ) : messages.length === 0 ? (
          <div className="ar-loading">No messages found.</div>
        ) : (
          <table className="ar-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Sender</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Snippet</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr
                  key={msg.id}
                  style={{
                    cursor: "pointer",
                    backgroundColor: msg.is_read
                      ? "transparent"
                      : "rgba(75, 45, 29, 0.03)",
                  }}
                  onClick={() => setSelectedMessage(msg)}
                >
                  <td className="ar-date">
                    {new Date(msg.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </td>
                  <td>
                    <strong className="ar-customer-name">{msg.name}</strong>
                  </td>
                  <td>
                    <span
                      style={{
                        color: "var(--ar-brown)",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyEmail(msg.email);
                      }}
                      title="Click to copy email"
                    >
                      {msg.email}
                    </span>
                  </td>
                  <td>
                    <span
                      className="ar-reason-head"
                      style={{
                        fontWeight: msg.is_read ? "normal" : "600",
                        margin: 0,
                      }}
                    >
                      {msg.subject || "(No Subject)"}
                    </span>
                  </td>
                  <td>
                    <p
                      className="ar-reason-note"
                      style={{
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        maxWidth: "200px",
                      }}
                    >
                      {msg.message}
                    </p>
                  </td>
                  <td>
                    {msg.is_read ? (
                      <span className="ar-status-pill ar-status-pill--completed">
                        Read
                      </span>
                    ) : (
                      <span className="ar-status-pill ar-status-pill--pending">
                        New
                      </span>
                    )}
                  </td>
                  <td
                    onClick={(e) => e.stopPropagation()}
                    style={{ textAlign: "right" }}
                  >
                    <div
                      className="ar-actions"
                      style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}
                    >
                      <button
                        className="ar-btn-ghost ar-btn-sm"
                        onClick={() => setSelectedMessage(msg)}
                        title="View Full Message"
                      >
                        <Eye size={14} />
                      </button>
                      {!msg.is_read && (
                        <button
                          className="ar-btn-primary ar-btn-sm"
                          onClick={() => handleMarkAsRead(msg.id)}
                          title="Mark as Read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        className="ar-btn-outline ar-btn-sm"
                        onClick={() => requestDelete(msg.id)}
                        title="Delete Message"
                        style={{ borderColor: "#fee2e2", color: "#ef4444" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* FOOTER */}
        {!loading && totalPages > 1 && (
          <div className="ar-footer">
            <span>Showing {messages.length} messages</span>
            <div className="ar-pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="ar-page-btn"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`ar-page-btn ${page === pNum ? "ar-page-btn--active" : ""}`}
                  >
                    {pNum}
                  </button>
                ),
              )}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="ar-page-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        open={confirmOpen}
        titleId="delete-contact-message-title"
        title="Delete Message"
        hint="Are you sure you want to delete this message? This action is permanent."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmMessageId(null);
        }}
      />

      {/* MESSAGE DETAIL MODAL */}
      <Modal
        open={!!selectedMessage}
        onRequestClose={() => setSelectedMessage(null)}
        ariaLabelledBy="msg-detail-title"
      >
        {selectedMessage && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid var(--ar-line)",
                paddingBottom: "0.75rem",
              }}
            >
              <div>
                <span
                  className="ar-breadcrumb"
                  style={{ fontSize: "0.7rem", margin: 0 }}
                >
                  Message Details
                </span>
                <h2
                  id="msg-detail-title"
                  className="ar-title"
                  style={{ fontSize: "1.5rem", margin: "0.25rem 0 0" }}
                >
                  {selectedMessage.subject || "(No Subject)"}
                </h2>
              </div>
              <div>
                {selectedMessage.is_read ? (
                  <span className="ar-status-pill ar-status-pill--completed">
                    Read
                  </span>
                ) : (
                  <span className="ar-status-pill ar-status-pill--pending">
                    New
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "0.5rem 1rem",
                fontSize: "0.9rem",
                color: "var(--ar-ink)",
              }}
            >
              <strong>Sender:</strong>
              <span>{selectedMessage.name}</span>

              <strong>Email:</strong>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span>{selectedMessage.email}</span>
                <button
                  type="button"
                  className="ar-btn-ghost ar-btn-sm"
                  onClick={() => handleCopyEmail(selectedMessage.email)}
                  style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                >
                  Copy
                </button>
              </div>

              <strong>Date:</strong>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <Clock size={14} style={{ color: "var(--ar-muted)" }} />
                <span>
                  {new Date(selectedMessage.created_at).toLocaleString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#faf8f5",
                border: "1px solid var(--ar-line)",
                borderRadius: "8px",
                padding: "1rem",
                marginTop: "0.5rem",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  color: "var(--ar-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.5rem",
                }}
              >
                Message
              </strong>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.92rem",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  color: "var(--ar-ink)",
                  maxHeight: "250px",
                  overflowY: "auto",
                }}
              >
                {selectedMessage.message}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.65rem",
                borderTop: "1px solid var(--ar-line)",
                paddingTop: "1rem",
                marginTop: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="ar-btn-ghost"
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>

              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || "")}`}
                className="ar-btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  textDecoration: "none",
                  fontSize: "0.8rem",
                  padding: "0.5rem 0.95rem",
                  borderRadius: "10px",
                }}
              >
                <Send size={14} />
                Reply via Email
              </a>

              {!selectedMessage.is_read && (
                <button
                  type="button"
                  className="ar-btn-primary"
                  onClick={() => handleMarkAsRead(selectedMessage.id)}
                >
                  Mark Read
                </button>
              )}

              <button
                type="button"
                className="ar-btn-outline"
                style={{ borderColor: "#fee2e2", color: "#ef4444" }}
                onClick={() => {
                  const id = selectedMessage.id;
                  setSelectedMessage(null);
                  requestDelete(id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
