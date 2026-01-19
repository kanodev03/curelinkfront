import { useState, useEffect } from 'react';
import API from '../../services/api';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import RoleGuard from '../../components/RoleGuard';

export default function DoctorNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    category: 'observation',
    patientId: '',
    isPrivate: false
  });

  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchNotes();
    fetchPatients();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notes');
      setNotes(res.data);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load notes' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await API.get('/records/doctor/my-patients');
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim() || !formData.patientId) {
      setAlert({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    };

    try {
      if (editingNote) {
        await API.put(`/notes/${editingNote._id}`, payload);
        setAlert({ type: 'success', message: 'Note updated successfully' });
      } else {
        await API.post('/notes', payload);
        setAlert({ type: 'success', message: 'Note created successfully' });
      }

      resetForm();
      setShowModal(false);
      fetchNotes();
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to save note' });
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
      category: note.category,
      patientId: note.patientId._id,
      isPrivate: note.isPrivate
    });
    setShowModal(true);
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await API.delete(`/notes/${noteId}`);
      setAlert({ type: 'success', message: 'Note deleted successfully' });
      fetchNotes();
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to delete note' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tags: '',
      category: 'observation',
      patientId: '',
      isPrivate: false
    });
    setEditingNote(null);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.patientId.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <RoleGuard allowedRoles={['doctor']}>
      <div className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen" style={{ backgroundColor: '#EEEEEE' }}>
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Notes</h1>
              <p className="text-xs text-gray-600 mt-1">Keep short clinical notes for your patients.</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-3 py-2 text-xs font-medium rounded text-white"
              style={{ backgroundColor: '#038474' }}
            >
              <span className="inline-flex items-center gap-1">
                <Plus size={16} /> New note
              </span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mb-4 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by title, content, or patient..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#038474]"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#038474]"
            >
              <option value="all">All Categories</option>
              <option value="diagnosis">Diagnosis</option>
              <option value="treatment">Treatment</option>
              <option value="follow-up">Follow-up</option>
              <option value="observation">Observation</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Notes Grid */}
          {loading ? (
            <LoadingSpinner />
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-10 bg-white rounded border border-gray-200">
              <p className="text-sm text-gray-600">No notes yet</p>
              <p className="text-xs text-gray-400 mt-1">Create a note to see it listed here.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map(note => (
                <div
                  key={note._id}
                  className="bg-white rounded border border-gray-200"
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">{note.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Patient: <span className="font-medium">{note.patientId.name}</span>
                        </p>
                      </div>
                      <span
                        className="px-2 py-1 text-[10px] font-semibold rounded"
                        style={{
                          backgroundColor: '#EEEEEE',
                          color: '#096187',
                          border: '1px solid #096187',
                        }}
                      >
                        {note.category}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-gray-700 text-xs mb-3 line-clamp-3">{note.content}</p>

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: '#EEEEEE',
                              color: '#038474',
                              border: '1px solid #038474'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex justify-between items-center text-[10px] text-gray-500 mb-3 pb-3 border-b border-gray-200">
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      {note.isPrivate && <span className="text-red-500">🔒 Private</span>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(note)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded text-white"
                        style={{ backgroundColor: '#038474' }}
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note._id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs rounded text-white"
                        style={{ backgroundColor: '#D32F2F' }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">
                  {editingNote ? 'Edit note' : 'New note'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Patient Select */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Patient *
                  </label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#038474]"
                    required
                  >
                    <option value="">Select a patient</option>
                    {patients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Follow-up on hypertension treatment"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#038474]"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Note Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your clinical notes here..."
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#038474] resize-none"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#038474]"
                  >
                    <option value="diagnosis">Diagnosis</option>
                    <option value="treatment">Treatment</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="observation">Observation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., urgent, follow-up, medication-review"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#038474]"
                  />
                </div>

                {/* Private Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPrivate" className="text-xs text-gray-700">
                    Private note (only visible to you)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 text-xs rounded text-white"
                    style={{ backgroundColor: '#038474' }}
                  >
                    {editingNote ? 'Update Note' : 'Create Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
