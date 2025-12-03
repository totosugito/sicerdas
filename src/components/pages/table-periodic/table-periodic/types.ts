export interface PeriodicElement {
  atomicId: number;
  idx: number;
  idy: number;
  atomicNumber: number;
  atomicGroup: string;
  atomicName: string;
  atomicSymbol: string;
}

interface ElementStyles {
  element: string;
  selected: string;
}

export const getElementStyle = (atomicGroup: string): ElementStyles => {
  const styleMap: Record<string, ElementStyles> = {
    headerEmpty: { 
      element: "bg-transparent text-foreground hover:bg-primary/10", 
      selected: "bg-primary/20 text-foreground border-2 border-primary dark:border-primary" 
    },
    empty: { 
      element: "bg-transparent text-foreground hover:bg-transparent", 
      selected: "bg-transparent text-foreground" 
    },
    header: { 
      element: "bg-black/30 dark:bg-black/40 text-white hover:bg-black/40 dark:hover:bg-black/50", 
      selected: "bg-black/30 dark:bg-black/40 text-white border-foreground dark:border-white" 
    },
    otherNonMetals: { 
      element: "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800", 
      selected: "bg-blue-600 dark:bg-blue-700 text-white border-foreground dark:border-white" 
    },
    nobleGases: { 
      element: "bg-purple-800 dark:bg-purple-950 text-white hover:bg-purple-900 dark:hover:bg-purple-900", 
      selected: "bg-purple-800 dark:bg-purple-950 text-white border-foreground dark:border-white" 
    },
    halogens: { 
      element: "bg-purple-600 dark:bg-purple-800 text-white hover:bg-purple-700 dark:hover:bg-purple-900", 
      selected: "bg-purple-600 dark:bg-purple-800 text-white border-foreground dark:border-white" 
    },
    metalloids: { 
      element: "bg-cyan-600 dark:bg-cyan-800 text-white hover:bg-cyan-700 dark:hover:bg-cyan-900", 
      selected: "bg-cyan-600 dark:bg-cyan-800 text-white border-foreground dark:border-white" 
    },
    postTransitionMetals: { 
      element: "bg-green-600 dark:bg-green-800 text-white hover:bg-green-700 dark:hover:bg-green-900", 
      selected: "bg-green-600 dark:bg-green-800 text-white border-foreground dark:border-white" 
    },
    transitionMetals: { 
      element: "bg-[#c68989] dark:bg-[#c68989]/80 text-white hover:bg-[#b57878] dark:hover:bg-[#b57878]", 
      selected: "bg-[#c68989] dark:bg-[#c68989]/80 text-white border-foreground dark:border-white" 
    },
    lanthanides: { 
      element: "bg-yellow-600 dark:bg-yellow-800 text-white hover:bg-yellow-700 dark:hover:bg-yellow-900", 
      selected: "bg-yellow-600 dark:bg-yellow-800 text-white border-foreground dark:border-white" 
    },
    actinides: { 
      element: "bg-[#b39ddb] dark:bg-[#b39ddb]/80 text-white hover:bg-[#9a7fcc] dark:hover:bg-[#9a7fcc]", 
      selected: "bg-[#b39ddb] dark:bg-[#b39ddb]/80 text-white border-foreground dark:border-white" 
    },
    alkalineEarthMetals: { 
      element: "bg-orange-500 dark:bg-orange-700 text-white hover:bg-orange-600 dark:hover:bg-orange-800", 
      selected: "bg-orange-500 dark:bg-orange-700 text-white border-foreground dark:border-white" 
    },
    alkaliMetals: { 
      element: "bg-red-500 dark:bg-red-800 text-white hover:bg-red-600 dark:hover:bg-red-900", 
      selected: "bg-red-500 dark:bg-red-800 text-white border-foreground dark:border-white" 
    },
  };

  return styleMap[atomicGroup] || { element: "bg-muted text-foreground hover:bg-muted/80", selected: "bg-muted text-foreground border-foreground dark:border-foreground" };
};