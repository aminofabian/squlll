import React, { useState } from 'react';
import { Coffee, Plus, Edit3, Trash2, Save, X, Clock } from 'lucide-react';

interface Break {
  id: string;
  name: string;
  type: 'lunch' | 'recess' | 'break' | 'assembly' | 'custom';
  color: string;
  icon: string;
}

interface BreakManagerProps {
  breaks: Break[];
  onUpdateBreaks: (breaks: Break[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const BreakManager: React.FC<BreakManagerProps> = ({
  breaks,
  onUpdateBreaks,
  isOpen,
  onClose
}) => {
  const [editingBreak, setEditingBreak] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<Break['type']>('break');
  const [localBreaks, setLocalBreaks] = useState<Break[]>(breaks);

  const breakTypes = [
    { value: 'lunch', label: 'Lunch', color: 'bg-orange-500', icon: '🍽️' },
    { value: 'recess', label: 'Recess', color: 'bg-green-500', icon: '🏃' },
    { value: 'break', label: 'Break', color: 'bg-blue-500', icon: '☕' },
    { value: 'assembly', label: 'Assembly', color: 'bg-purple-500', icon: '🎤' },
    { value: 'custom', label: 'Custom', color: 'bg-gray-500', icon: '📝' }
  ];

  const handleEdit = (breakItem: Break) => {
    setEditingBreak(breakItem.id);
    setEditName(breakItem.name);
    setEditType(breakItem.type);
  };

  const handleSave = (breakId: string) => {
    if (editName.trim()) {
      const breakType = breakTypes.find(t => t.value === editType);
      const updatedBreaks = localBreaks.map(breakItem =>
        breakItem.id === breakId ? {
          ...breakItem,
          name: editName.trim(),
          type: editType,
          color: breakType?.color || 'bg-gray-500',
          icon: breakType?.icon || '📝'
        } : breakItem
      );
      setLocalBreaks(updatedBreaks);
      onUpdateBreaks(updatedBreaks);
    }
    setEditingBreak(null);
    setEditName('');
    setEditType('break');
  };

  const handleCancel = () => {
    setEditingBreak(null);
    setEditName('');
    setEditType('break');
  };

  const handleDelete = (breakId: string) => {
    const updatedBreaks = localBreaks.filter(breakItem => breakItem.id !== breakId);
    setLocalBreaks(updatedBreaks);
    onUpdateBreaks(updatedBreaks);
  };

  const handleAdd = () => {
    const newId = `break-${Date.now()}`;
    const breakType = breakTypes.find(t => t.value === editType);
    const newBreak: Break = {
      id: newId,
      name: editName.trim() || 'New Break',
      type: editType,
      color: breakType?.color || 'bg-gray-500',
      icon: breakType?.icon || '📝'
    };
    const updatedBreaks = [...localBreaks, newBreak];
    setLocalBreaks(updatedBreaks);
    onUpdateBreaks(updatedBreaks);
    setEditName('');
    setEditType('break');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingBreak) {
        handleSave(editingBreak);
      } else {
        handleAdd();
      }
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
            <Coffee className="w-5 h-5 text-primary" />
            Manage Break Periods
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Add New Break */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Break</h4>
          <div className="flex gap-3">
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value as Break['type'])}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {breakTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Break name (e.g., Morning Recess)"
            />
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
        
        {/* Existing Breaks */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Existing Breaks</h4>
          {localBreaks.map((breakItem) => (
            <div key={breakItem.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
              <div className={`w-8 h-8 ${breakItem.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                {breakItem.icon}
              </div>
              
              {editingBreak === breakItem.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as Break['type'])}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {breakTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Break name"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave(breakItem.id)}
                    className="p-1 text-green-600 hover:text-green-800"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1 text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{breakItem.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{breakItem.type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(breakItem)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(breakItem.id)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {localBreaks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Coffee className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No break periods defined yet.</p>
              <p className="text-sm">Add breaks above to use them in your timetable.</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Close
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> After adding breaks, you can assign them to time slots in the timetable by typing the break name in any cell.
          </p>
        </div>
      </div>
    </div>
  );
}; 