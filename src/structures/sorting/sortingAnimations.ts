import type { Step } from '../../app/store';

// Helper indexes for Heap (0-based mathematically mapped)
const left = (i: number) => 2 * i + 1;
const right = (i: number) => 2 * i + 2;

// 1. INSERTION SORT (מיון הכנסה)
export const generateInsertionSortAnimations = (arr: number[]): Step[] => {
  const steps: Step[] = [];
  const A = [...arr];
  const n = A.length;

  steps.push({
    id: `insert-start`,
    message: `מתחילים מיון הכנסה (Insertion Sort) במערך: [${A.join(', ')}]`,
    arrayState: [...A],
    highlightedIndices: [],
    sortedIndices: [0],
    stepType: 'compare',
  });

  for (let i = 1; i < n; i++) {
    const key = A[i];
    let j = i - 1;

    steps.push({
      id: `insert-pick-${i}`,
      message: `בוחרים את האיבר A[${i + 1}] = ${key} ומחפשים את מיקומו היחסי במקטע הממוין משמאל`,
      arrayState: [...A],
      highlightedIndices: [i],
      sortedIndices: Array.from({ length: i }, (_, k) => k),
      stepType: 'compare',
    });

    while (j >= 0 && A[j] > key) {
      steps.push({
        id: `insert-compare-${i}-${j}`,
        message: `משווים: האם A[${j + 1}] (${A[j]}) גדול מ- ${key}? כן! מזיזים את ${A[j]} ימינה`,
        arrayState: [...A],
        highlightedIndices: [j, j + 1],
        sortedIndices: Array.from({ length: i }, (_, k) => k),
        stepType: 'compare',
      });

      A[j + 1] = A[j];
      j--;

      steps.push({
        id: `insert-shift-${i}-${j}`,
        message: `הזזנו את האיבר ${A[j + 1]} ימינה לאינדקס ${j + 2}`,
        arrayState: [...A],
        highlightedIndices: [j + 1, j + 2],
        sortedIndices: Array.from({ length: i }, (_, k) => k),
        stepType: 'swap',
      });
    }

    if (j >= 0) {
      steps.push({
        id: `insert-compare-stop-${i}-${j}`,
        message: `משווים: האם A[${j + 1}] (${A[j]}) גדול מ- ${key}? לא! מצאנו את המיקום הנכון`,
        arrayState: [...A],
        highlightedIndices: [j, j + 1],
        sortedIndices: Array.from({ length: i }, (_, k) => k),
        stepType: 'compare',
      });
    }

    A[j + 1] = key;

    steps.push({
      id: `insert-place-${i}`,
      message: `מציבים את ${key} במיקום ${j + 2}. כעת המקטע מאינדקס 1 עד ${i + 1} ממוין`,
      arrayState: [...A],
      highlightedIndices: [j + 1],
      sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
      stepType: 'sorted',
    });
  }

  steps.push({
    id: `insert-complete`,
    message: `מיון הכנסה הושלם בהצלחה! כל המערך ממוין משמאל לימין: [${A.join(', ')}]`,
    arrayState: [...A],
    highlightedIndices: [],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    stepType: 'sorted',
  });

  return steps;
};

// 2. HEAP SORT (מיון ערמה)
const maxHeapify = (
  A: number[],
  i: number,
  heapSize: number,
  steps: Step[],
  sortedIndices: number[]
) => {
  const l = left(i);
  const r = right(i);
  let largest = i;

  if (l < heapSize) {
    steps.push({
      id: `heapify-compare-left-${i}-${l}-${Date.now()}`,
      message: `Max-Heapify בצומת ${i + 1}: משווים בין האב (A[${i + 1}] = ${A[i]}) לבן השמאלי (A[${l + 1}] = ${A[l]})`,
      arrayState: [...A],
      highlightedIndices: [i, l],
      sortedIndices: [...sortedIndices],
      stepType: 'compare',
    });
    if (A[l] > A[i]) {
      largest = l;
    }
  }

  if (r < heapSize) {
    steps.push({
      id: `heapify-compare-right-${i}-${r}-${Date.now()}`,
      message: `משווים בין הגדול ביותר שנמצא (A[${largest + 1}] = ${A[largest]}) לבן הימני (A[${r + 1}] = ${A[r]})`,
      arrayState: [...A],
      highlightedIndices: [largest, r],
      sortedIndices: [...sortedIndices],
      stepType: 'compare',
    });
    if (A[r] > A[largest]) {
      largest = r;
    }
  }

  if (largest !== i) {
    steps.push({
      id: `heapify-swap-${i}-${largest}-${Date.now()}`,
      message: `הפרה של תנאי ערימת מקסימום: מחליפים בין A[${i + 1}] (${A[i]}) לבין A[${largest + 1}] (${A[largest]})`,
      arrayState: [...A],
      highlightedIndices: [i, largest],
      sortedIndices: [...sortedIndices],
      stepType: 'swap',
    });

    const temp = A[i];
    A[i] = A[largest];
    A[largest] = temp;

    steps.push({
      id: `heapify-swapped-${i}-${largest}-${Date.now()}`,
      message: `ההחלפה בוצעה. כעת ממשיכים רקורסיבית בתיקון מטה מצומת ${largest + 1}`,
      arrayState: [...A],
      highlightedIndices: [i, largest],
      sortedIndices: [...sortedIndices],
      stepType: 'swap',
    });

    maxHeapify(A, largest, heapSize, steps, sortedIndices);
  }
};

const buildMaxHeap = (A: number[], steps: Step[]) => {
  const n = A.length;
  steps.push({
    id: `build-heap-start`,
    message: `שלב א' בסיכום (Build-Max-Heap): הפיכת המערך לערימה. עוברים על הצמתים הפנימיים מאינדקס ${Math.floor(n / 2)} ומטה`,
    arrayState: [...A],
    highlightedIndices: [],
    sortedIndices: [],
    stepType: 'compare',
  });

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    steps.push({
      id: `build-heap-node-${i}`,
      message: `מפעילים Max-Heapify על צומת פנימי באינדקס ${i + 1} (ערך: ${A[i]})`,
      arrayState: [...A],
      highlightedIndices: [i],
      sortedIndices: [],
      stepType: 'compare',
    });
    maxHeapify(A, i, n, steps, []);
  }

  steps.push({
    id: `build-heap-complete`,
    message: `ערימת המקסימום נבנתה בהצלחה! כעת עוברים לשלב ב' של המיון`,
    arrayState: [...A],
    highlightedIndices: [],
    sortedIndices: [],
    stepType: 'sorted',
  });
};

export const generateHeapSortAnimations = (arr: number[]): Step[] => {
  const steps: Step[] = [];
  const A = [...arr];
  const n = A.length;
  const sorted: number[] = [];

  // Build Max Heap
  buildMaxHeap(A, steps);

  // Sorting phase
  for (let i = n - 1; i >= 1; i--) {
    steps.push({
      id: `heapsort-swap-root-${i}`,
      message: `מעבירים את האיבר המקסימלי בשורש (A[1] = ${A[0]}) לסוף המערך הפעיל ע"י החלפה עם A[${i + 1}] (${A[i]})`,
      arrayState: [...A],
      highlightedIndices: [0, i],
      sortedIndices: [...sorted],
      stepType: 'swap',
    });

    const temp = A[0];
    A[0] = A[i];
    A[i] = temp;

    sorted.push(i);

    steps.push({
      id: `heapsort-swapped-root-${i}`,
      message: `האיבר ${temp} מוקם במיקומו הסופי הממוין (מסומן בירוק). מקטינים את גודל הערמה הפעילה.`,
      arrayState: [...A],
      highlightedIndices: [0, i],
      sortedIndices: [...sorted],
      stepType: 'sorted',
    });

    steps.push({
      id: `heapsort-heapify-root-${i}`,
      message: `מפעילים Max-Heapify(A, 1) כדי להחזיר את תכונת ערימת המקסימום לשאר האיברים בערמה`,
      arrayState: [...A],
      highlightedIndices: [0],
      sortedIndices: [...sorted],
      stepType: 'compare',
    });

    maxHeapify(A, 0, i, steps, sorted);
  }

  sorted.push(0);

  steps.push({
    id: `heapsort-complete`,
    message: `מיון ערימה הושלם בהצלחה! כל המערך ממוין משמאל לימין: [${A.join(', ')}]`,
    arrayState: [...A],
    highlightedIndices: [],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    stepType: 'sorted',
  });

  return steps;
};

// 3. QUICK SORT (מיון מהיר)
export const generateQuickSortAnimations = (arr: number[]): Step[] => {
  const steps: Step[] = [];
  const A = [...arr];
  const n = A.length;
  const sorted: number[] = [];

  const quickSort = (low: number, high: number) => {
    if (low < high) {
      steps.push({
        id: `quick-divide-${low}-${high}-${Date.now()}`,
        message: `שלב חלוקה: מתחילים מיון מהיר על תת-מערך מאינדקס ${low + 1} עד ${high + 1}`,
        arrayState: [...A],
        highlightedIndices: Array.from({ length: high - low + 1 }, (_, k) => low + k),
        sortedIndices: [...sorted],
        stepType: 'compare',
      });

      const p = partition(low, high);
      quickSort(low, p - 1);
      quickSort(p + 1, high);
    } else if (low === high) {
      if (!sorted.includes(low)) sorted.push(low);
    }
  };

  const partition = (low: number, high: number): number => {
    const pivot = A[high];
    
    steps.push({
      id: `quick-pivot-${low}-${high}`,
      message: `בוחרים איבר ציר (Pivot) להיות האיבר האחרון בתת-המערך: A[${high + 1}] = ${pivot}`,
      arrayState: [...A],
      highlightedIndices: [],
      sortedIndices: [...sorted],
      pivotIndex: high,
      stepType: 'pivot',
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      steps.push({
        id: `quick-compare-${j}-${high}`,
        message: `משווים: האם A[${j + 1}] (${A[j]}) קטן או שווה לציר (${pivot})?`,
        arrayState: [...A],
        highlightedIndices: [j, high],
        sortedIndices: [...sorted],
        pivotIndex: high,
        stepType: 'compare',
      });

      if (A[j] <= pivot) {
        i++;
        if (i !== j) {
          steps.push({
            id: `quick-swap-${i}-${j}`,
            message: `כן! מגדילים את גבול הקטנים ומחליפים בין A[${i + 1}] (${A[i]}) לבין A[${j + 1}] (${A[j]})`,
            arrayState: [...A],
            highlightedIndices: [i, j],
            sortedIndices: [...sorted],
            pivotIndex: high,
            stepType: 'swap',
          });

          const temp = A[i];
          A[i] = A[j];
          A[j] = temp;

          steps.push({
            id: `quick-swapped-${i}-${j}`,
            message: `ההחלפה בוצעה.`,
            arrayState: [...A],
            highlightedIndices: [i, j],
            sortedIndices: [...sorted],
            pivotIndex: high,
            stepType: 'swap',
          });
        }
      }
    }

    steps.push({
      id: `quick-swap-pivot-${i + 1}-${high}`,
      message: `מציבים את הציר (${pivot}) במיקומו הסופי ע"י החלפה עם A[${i + 2}] (${A[i + 1]})`,
      arrayState: [...A],
      highlightedIndices: [i + 1, high],
      sortedIndices: [...sorted],
      pivotIndex: high,
      stepType: 'swap',
    });

    const temp = A[i + 1];
    A[i + 1] = A[high];
    A[high] = temp;

    if (!sorted.includes(i + 1)) sorted.push(i + 1);

    steps.push({
      id: `quick-placed-pivot-${i + 1}`,
      message: `הציר ${pivot} ממוקם כעת באינדקס ${i + 2} ומצבו סופי וממוין`,
      arrayState: [...A],
      highlightedIndices: [i + 1],
      sortedIndices: [...sorted],
      stepType: 'sorted',
    });

    return i + 1;
  };

  quickSort(0, n - 1);

  steps.push({
    id: `quick-complete`,
    message: `מיון מהיר הושלם בהצלחה! כל המערך ממוין משמאל לימין: [${A.join(', ')}]`,
    arrayState: [...A],
    highlightedIndices: [],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    stepType: 'sorted',
  });

  return steps;
};

// 4. MERGE SORT (מיון מיזוג)
export const generateMergeSortAnimations = (arr: number[]): Step[] => {
  const steps: Step[] = [];
  const A = [...arr];
  const n = A.length;
  const sorted: number[] = [];

  const merge = (low: number, mid: number, high: number) => {
    const leftArr = A.slice(low, mid + 1);
    const rightArr = A.slice(mid + 1, high + 1);

    steps.push({
      id: `merge-split-${low}-${high}`,
      message: `שלב מיזוג (Merge): משלבים את החלקים [${leftArr.join(', ')}] (אינדקסים ${low + 1}-${mid + 1}) ו-[${rightArr.join(', ')}] (אינדקסים ${mid + 2}-${high + 1})`,
      arrayState: [...A],
      highlightedIndices: Array.from({ length: high - low + 1 }, (_, k) => low + k),
      sortedIndices: [...sorted],
      stepType: 'compare',
    });

    let i = 0, j = 0, k = low;

    while (i < leftArr.length && j < rightArr.length) {
      steps.push({
        id: `merge-compare-${k}`,
        message: `משווים: האם האיבר השמאלי (${leftArr[i]}) קטן או שווה לימני (${rightArr[j]})?`,
        arrayState: [...A],
        highlightedIndices: [low + i, mid + 1 + j],
        sortedIndices: [...sorted],
        stepType: 'compare',
      });

      if (leftArr[i] <= rightArr[j]) {
        steps.push({
          id: `merge-pick-left-${k}`,
          message: `בוחרים את ${leftArr[i]} ומציבים אותו במיקום ${k + 1}`,
          arrayState: [...A],
          highlightedIndices: [k, low + i],
          sortedIndices: [...sorted],
          stepType: 'swap',
        });
        A[k] = leftArr[i];
        i++;
      } else {
        steps.push({
          id: `merge-pick-right-${k}`,
          message: `בוחרים את ${rightArr[j]} ומציבים אותו במיקום ${k + 1}`,
          arrayState: [...A],
          highlightedIndices: [k, mid + 1 + j],
          sortedIndices: [...sorted],
          stepType: 'swap',
        });
        A[k] = rightArr[j];
        j++;
      }
      k++;
    }

    while (i < leftArr.length) {
      steps.push({
        id: `merge-leftover-left-${k}`,
        message: `מעתיקים איבר שנשאר מהצד השמאלי: ${leftArr[i]} למיקום ${k + 1}`,
        arrayState: [...A],
        highlightedIndices: [k],
        sortedIndices: [...sorted],
        stepType: 'swap',
      });
      A[k] = leftArr[i];
      i++;
      k++;
    }

    while (j < rightArr.length) {
      steps.push({
        id: `merge-leftover-right-${k}`,
        message: `מעתיקים איבר שנשאר מהצד הימני: ${rightArr[j]} למיקום ${k + 1}`,
        arrayState: [...A],
        highlightedIndices: [k],
        sortedIndices: [...sorted],
        stepType: 'swap',
      });
      A[k] = rightArr[j];
      j++;
      k++;
    }

    steps.push({
      id: `merge-merged-${low}-${high}`,
      message: `מיזוג המקטע מאינדקס ${low + 1} עד ${high + 1} הושלם ל: [${A.slice(low, high + 1).join(', ')}]`,
      arrayState: [...A],
      highlightedIndices: Array.from({ length: high - low + 1 }, (_, k) => low + k),
      sortedIndices: [...sorted],
      stepType: 'compare',
    });
  };

  const mergeSort = (low: number, high: number) => {
    if (low < high) {
      const mid = Math.floor((low + high) / 2);
      
      steps.push({
        id: `merge-divide-${low}-${high}-${Date.now()}`,
        message: `שלב חלוקה: מפצלים את המקטע מאינדקס ${low + 1} עד ${high + 1} לשני חצאים (אינדקסים ${low + 1}-${mid + 1} ואינדקסים ${mid + 2}-${high + 1})`,
        arrayState: [...A],
        highlightedIndices: Array.from({ length: high - low + 1 }, (_, k) => low + k),
        sortedIndices: [...sorted],
        stepType: 'compare',
      });

      mergeSort(low, mid);
      mergeSort(mid + 1, high);
      merge(low, mid, high);
    }
  };

  mergeSort(0, n - 1);

  steps.push({
    id: `merge-complete`,
    message: `מיון מיזוג הושלם בהצלחה! כל המערך ממוין משמאל לימין: [${A.join(', ')}]`,
    arrayState: [...A],
    highlightedIndices: [],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    stepType: 'sorted',
  });

  return steps;
};

// 5. COUNTING SORT (מיון מנייה)
export const generateCountingSortAnimations = (arr: number[]): Step[] => {
  const steps: Step[] = [];
  const A = [...arr];
  const n = A.length;
  
  const max = Math.max(...A, 0);
  const C = new Array(max + 1).fill(0);
  const B = new Array(n).fill(-1);

  steps.push({
    id: 'counting-start',
    message: `מתחילים מיון מנייה (Counting Sort). טווח הערכים הוא [0, ${max}]. יוצרים מערך מונים (C) בגודל ${max + 1}`,
    arrayState: [...A],
    countArrayState: [...C],
    outputArrayState: [...B],
    stepType: 'compare',
  });

  // Frequency Count Phase
  for (let j = 0; j < n; j++) {
    const val = A[j];
    C[val]++;
    steps.push({
      id: `counting-freq-${j}`,
      message: `סופרים את A[${j + 1}] = ${val}. מעדכנים את מערך המונים: C[${val}] = ${C[val]}`,
      arrayState: [...A],
      countArrayState: [...C],
      outputArrayState: [...B],
      highlightedIndices: [j],
      stepType: 'compare',
    });
  }

  // Accumulate Phase
  steps.push({
    id: 'counting-accumulate-start',
    message: `מבצעים סכימה מצטברת במערך המונים (C) כדי לקבוע את מיקומי האיברים במערך המוצא`,
    arrayState: [...A],
    countArrayState: [...C],
    outputArrayState: [...B],
    stepType: 'compare',
  });

  for (let i = 1; i <= max; i++) {
    const prev = C[i - 1];
    const curr = C[i];
    C[i] += C[i - 1];
    steps.push({
      id: `counting-accumulate-${i}`,
      message: `סוכמים: C[${i}] = C[${i}] + C[${i - 1}] (${curr} + ${prev} = ${C[i]})`,
      arrayState: [...A],
      countArrayState: [...C],
      outputArrayState: [...B],
      stepType: 'compare',
    });
  }

  // Placement Phase (Iterate backward for stability)
  for (let j = n - 1; j >= 0; j--) {
    const val = A[j];
    const targetIdx = C[val] - 1;
    B[targetIdx] = val;
    C[val]--;

    steps.push({
      id: `counting-place-${j}`,
      message: `מציבים את A[${j + 1}] (${val}) במערך המוצא באינדקס C[${val}] = ${targetIdx + 1}, ומקטינים את המונה C[${val}] ל-${C[val]}`,
      arrayState: [...A],
      countArrayState: [...C],
      outputArrayState: [...B],
      highlightedIndices: [j],
      sortedIndices: [targetIdx],
      stepType: 'swap',
    });
  }

  steps.push({
    id: 'counting-complete',
    message: `מיון מנייה הושלם בהצלחה! כל המערך ממוין משמאל לימין: [${B.join(', ')}]`,
    arrayState: [...B],
    countArrayState: [...C],
    outputArrayState: [...B],
    highlightedIndices: [],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    stepType: 'sorted',
  });

  return steps;
};

// 6. RADIX SORT (מיון בסיס)
export const generateRadixSortAnimations = (arr: number[]): Step[] => {
  const steps: Step[] = [];
  let A = [...arr];
  const n = A.length;
  const max = Math.max(...A, 0);

  steps.push({
    id: 'radix-start',
    message: `מתחילים מיון בסיס (Radix Sort) במערך: [${A.join(', ')}]`,
    arrayState: [...A],
    highlightedIndices: [],
    sortedIndices: [],
    stepType: 'compare',
  });

  // Sort digit by digit from LSD (least significant digit) to MSD
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const digitLabel = exp === 1 ? 'האחדות' : exp === 10 ? 'העשרות' : exp === 100 ? 'המאות' : `ה-${exp}`;
    
    steps.push({
      id: `radix-pass-${exp}`,
      message: `סבב מיון יציב לפי ספרת ${digitLabel} (בסיס 10)`,
      arrayState: [...A],
      highlightedIndices: [],
      sortedIndices: [],
      pivotIndex: exp, // pass active digit divisor in pivotIndex
      stepType: 'pivot',
    });

    // Stable insertion sort pass by active digit
    for (let i = 1; i < n; i++) {
      const key = A[i];
      const keyDigit = Math.floor(key / exp) % 10;
      let j = i - 1;

      while (j >= 0 && (Math.floor(A[j] / exp) % 10) > keyDigit) {
        steps.push({
          id: `radix-compare-${exp}-${i}-${j}`,
          message: `ספרת ${digitLabel}: האם ספרת ה-${digitLabel} של A[${j + 1}] (${Math.floor(A[j] / exp) % 10}) גדולה מזו של A[${i + 1}] (${keyDigit})? כן, מזיזים ימינה`,
          arrayState: [...A],
          highlightedIndices: [j, j + 1],
          sortedIndices: [],
          pivotIndex: exp,
          stepType: 'compare',
        });

        A[j + 1] = A[j];
        j--;
      }

      A[j + 1] = key;
      steps.push({
        id: `radix-place-${exp}-${i}`,
        message: `מציבים את ${key} במיקום ${j + 2} לפי ספרת ${digitLabel}`,
        arrayState: [...A],
        highlightedIndices: [j + 1],
        sortedIndices: [],
        pivotIndex: exp,
        stepType: 'swap',
      });
    }
  }

  steps.push({
    id: 'radix-complete',
    message: `מיון בסיס הושלם בהצלחה! המערך ממוין לחלוטין משמאל לימין: [${A.join(', ')}]`,
    arrayState: [...A],
    highlightedIndices: [],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    stepType: 'sorted',
  });

  return steps;
};
