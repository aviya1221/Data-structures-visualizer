import React, { useState } from 'react';
import { useAppStore } from '../app/store';
import { generateAvlInsertAnimations } from '../structures/avl/avlAnimationsNew';
import type { TreeNode } from '../structures/types';

export const ControlPanel: React.FC = () => {
  const { playback, setPlayback, nextStep, undo, enqueue, reset } = useAppStore();
  const [inputValue, setInputValue] = useState<string>('');
  
  // נצטרך גישה לעץ הנוכחי כדי להמשיך להוסיף עליו
  const { animationQueue, stepIndex } = useAppStore();
  const currentTree = (animationQueue[stepIndex]?.rootNode as TreeNode | null) || null;

  const isPlaying = playback === 'playing';

  const handleInsert = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;

    // כאן אנחנו מפעילים את מחולל האנימציות שלנו
    const newSteps = generateAvlInsertAnimations(currentTree as any, val);
    
    // שליחה ל-Store
    enqueue(newSteps);
    setInputValue('');
    setPlayback('playing');
  };

  return (
    <div className="bg-white border-t p-4 flex items-center justify-between shadow-md">
      <div className="flex gap-4 items-center">
        <input 
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isPlaying}
          placeholder="ערך..."
          className="border rounded px-3 py-1.5 w-24"
        />
        <button 
          onClick={handleInsert} 
          disabled={isPlaying}
          className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          הכנס
        </button>
      </div>

      <div className="flex gap-3 items-center">
        <button onClick={undo} className="bg-gray-200 px-4 py-1.5 rounded">ביטול</button>
        <button onClick={() => setPlayback(isPlaying ? 'paused' : 'playing')} className="bg-green-600 text-white px-4 py-1.5 rounded">
          {isPlaying ? 'השהה' : 'נגן'}
        </button>
        <button onClick={nextStep} className="bg-gray-200 px-4 py-1.5 rounded">צעד הבא</button>
        <button onClick={reset} className="bg-red-500 text-white px-4 py-1.5 rounded">איפוס</button>
      </div>
    </div>
  );
};