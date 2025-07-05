import React, { useState } from 'react';
import { Clock, Edit3, Plus, Trash2, Save, X } from 'lucide-react';

interface TimeSlot {
  id: number;
  time: string;
  color: string;
}

interface TimeSlotManagerProps {
  timeSlots: TimeSlot[];
  onUpdateTimeSlots: (timeSlots: TimeSlot[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const TimeSlotManager: React.FC<TimeSlotManagerProps> = ({
  timeSlots,
  onUpdateTimeSlots,
  isOpen,
  onClose
}) => {
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [editTime, setEditTime] = useState('');
  const [localTimeSlots, setLocalTimeSlots] = useState<TimeSlot[]>(timeSlots);

  const colors = [
    'border-l-primary',
    'border-l-emerald-600',
    'border-l-amber-500',
    'border-l-sky-500',
    'border-l-orange-500',
    'border-l-green-600',
    'border-l-purple-500',
    'border-l-pink-500'
  ];

  const handleEdit = (slot: TimeSlot) => {
    setEditingSlot(slot.id);
    setEditTime(slot.time);
  };

  const handleSave = (slotId: number) => {
    if (editTime.trim()) {
      const updatedSlots = localTimeSlots.map(slot =>
        slot.id === slotId ? { ...slot, time: editTime.trim() } : slot
      );
      setLocalTimeSlots(updatedSlots);
      onUpdateTimeSlots(updatedSlots);
    }
    setEditingSlot(null);
    setEditTime('');
  };

  const handleCancel = () => {
    setEditingSlot(null);
    setEditTime('');
  };

  const handleDelete = (slotId: number) => {
    const updatedSlots = localTimeSlots.filter(slot => slot.id !== slotId);
    setLocalTimeSlots(updatedSlots);
    onUpdateTimeSlots(updatedSlots);
  };

  const handleAdd = () => {
    const newId = Math.max(...localTimeSlots.map(s => s.id), 0) + 1;
    const newColor = colors[localTimeSlots.length % colors.length];
    const newSlot: TimeSlot = {
      id: newId,
      time: 'New Time Slot',
      color: newColor
    };
    const updatedSlots = [...localTimeSlots, newSlot];
    setLocalTimeSlots(updatedSlots);
    onUpdateTimeSlots(updatedSlots);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editingSlot) {
      handleSave(editingSlot);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Manage Time Slots
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          {localTimeSlots.map((slot) => (
            <div key={slot.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
              <div className={`w-4 h-4 rounded-full ${slot.color.replace('border-l-', 'bg-')}`} />
              
              {editingSlot === slot.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 border-2 border-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter time (e.g., 8:00 AM – 9:00 AM)"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave(slot.id)}
                    className="p-2 text-green-600 hover:text-green-800"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800">{slot.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(slot)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4" />
            Add Time Slot
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Close
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Use formats like "8:00 AM – 9:00 AM" or "14:00 – 15:30" for clear time display.
          </p>
        </div>
      </div>
    </div>
  );
}; 