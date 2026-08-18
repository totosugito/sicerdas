import { ElementStyles } from "../types/types";

export const getElementStyle = (atomicGroup: string, theme: string = 'theme1'): ElementStyles => {
  switch (theme) {
    case 'theme2':
      return getElementTheme2Style(atomicGroup); // Border-focused theme
    case 'theme3':
      return getElementTheme3Style(atomicGroup);
    case 'theme4':
      return getElementTheme4Style(atomicGroup);
    default:
      return getElementTheme1Style(atomicGroup);
  }
}

export const getElementTheme1Style = (atomicGroup: string): ElementStyles => {
  const styleMap: Record<string, ElementStyles> = {
    headerEmpty: {
      element: "bg-transparent text-foreground hover:bg-primary/10",
      selected: "bg-primary/20 text-foreground border-2 border-primary dark:border-primary",
      atomColor: '#00000000'
    },
    empty: {
      element: "bg-transparent text-foreground hover:bg-transparent",
      selected: "bg-transparent text-foreground",
      atomColor: '#00000000'
    },
    header: {
      element: "bg-black/30 dark:bg-black/40 text-white hover:bg-black/40 dark:hover:bg-black/50",
      selected: "bg-black/30 dark:bg-black/40 text-white border-foreground dark:border-white",
      atomColor: '#0000004D'
    },
    othernonmetals: {
      element: "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800",
      selected: "bg-blue-600 dark:bg-blue-700 text-white border-foreground dark:border-white",
      atomColor: '#2563EB'
    },
    noble_gases: {
      element: "bg-purple-800 dark:bg-purple-950 text-white hover:bg-purple-900 dark:hover:bg-purple-900",
      selected: "bg-purple-800 dark:bg-purple-950 text-white border-foreground dark:border-white",
      atomColor: '#7E22CE'
    },
    halogens: {
      element: "bg-purple-600 dark:bg-purple-800 text-white hover:bg-purple-700 dark:hover:bg-purple-900",
      selected: "bg-purple-600 dark:bg-purple-800 text-white border-foreground dark:border-white",
      atomColor: '#9333EA'
    },
    metalloids: {
      element: "bg-cyan-600 dark:bg-cyan-800 text-white hover:bg-cyan-700 dark:hover:bg-cyan-900",
      selected: "bg-cyan-600 dark:bg-cyan-800 text-white border-foreground dark:border-white",
      atomColor: '#0891B2'
    },
    post_transition_metals: {
      element: "bg-green-600 dark:bg-green-800 text-white hover:bg-green-700 dark:hover:bg-green-900",
      selected: "bg-green-600 dark:bg-green-800 text-white border-foreground dark:border-white",
      atomColor: '#16A34A'
    },
    transition_metals: {
      element: "bg-[#c68989] dark:bg-[#c68989]/80 text-white hover:bg-[#b57878] dark:hover:bg-[#b57878]",
      selected: "bg-[#c68989] dark:bg-[#c68989]/80 text-white border-foreground dark:border-white",
      atomColor: '#C68989'
    },
    lanthanoids: {
      element: "bg-yellow-600 dark:bg-yellow-800 text-white hover:bg-yellow-700 dark:hover:bg-yellow-900",
      selected: "bg-yellow-600 dark:bg-yellow-800 text-white border-foreground dark:border-white",
      atomColor: '#CA8A04'
    },
    actinoids: {
      element: "bg-[#b39ddb] dark:bg-[#b39ddb]/80 text-white hover:bg-[#9a7fcc] dark:hover:bg-[#9a7fcc]",
      selected: "bg-[#b39ddb] dark:bg-[#b39ddb]/80 text-white border-foreground dark:border-white",
      atomColor: '#B39DDB'
    },
    alkaline_earth_metals: {
      element: "bg-orange-500 dark:bg-orange-700 text-white hover:bg-orange-600 dark:hover:bg-orange-800",
      selected: "bg-orange-500 dark:bg-orange-700 text-white border-foreground dark:border-white",
      atomColor: '#F97316'
    },
    alkali_metals: {
      element: "bg-red-500 dark:bg-red-800 text-white hover:bg-red-600 dark:hover:bg-red-900",
      selected: "bg-red-500 dark:bg-red-800 text-white border-foreground dark:border-white",
      atomColor: '#EF4444'
    },
  };

  return styleMap[atomicGroup] || { element: "bg-muted text-foreground hover:bg-muted/80", selected: "bg-muted text-foreground border-foreground dark:border-foreground", atomColor: '#8B8B8B' };
};

export const getElementTheme2Style = (atomicGroup: string): ElementStyles => {
  const styleMap: Record<string, ElementStyles> = {
    headerEmpty: {
      element: "bg-transparent text-foreground border border-dashed border-muted-foreground/30",
      selected: "bg-primary/10 text-foreground border-2 border-primary dark:border-primary",
      atomColor: '#00000000'
    },
    empty: {
      element: "bg-transparent text-foreground",
      selected: "bg-transparent text-foreground",
      atomColor: '#00000000'
    },
    header: {
      element: "bg-background text-foreground border border-foreground/30",
      selected: "bg-background text-foreground border-2 border-foreground dark:border-white font-bold",
      atomColor: '#FFFFFF'
    },
    othernonmetals: {
      element: "bg-background text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400",
      selected: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400",
      atomColor: '#2563EB'
    },
    noble_gases: {
      element: "bg-background text-purple-800 dark:text-purple-300 border border-purple-800 dark:border-purple-300",
      selected: "bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border-2 border-purple-800 dark:border-purple-300",
      atomColor: '#7E22CE'
    },
    halogens: {
      element: "bg-background text-purple-600 dark:text-purple-400 border border-purple-600 dark:border-purple-400",
      selected: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-400",
      atomColor: '#9333EA'
    },
    metalloids: {
      element: "bg-background text-cyan-600 dark:text-cyan-400 border border-cyan-600 dark:border-cyan-400",
      selected: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border-2 border-cyan-600 dark:border-cyan-400",
      atomColor: '#0891B2'
    },
    post_transition_metals: {
      element: "bg-background text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400",
      selected: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-2 border-green-600 dark:border-green-400",
      atomColor: '#16A34A'
    },
    transition_metals: {
      element: "bg-background text-[#c68989] dark:text-[#c68989] border border-[#c68989] dark:border-[#c68989]",
      selected: "bg-[#c68989]/10 dark:bg-[#c68989]/20 text-[#c68989] dark:text-[#c68989] border-2 border-[#c68989] dark:border-[#c68989]",
      atomColor: '#C68989'
    },
    lanthanoids: {
      element: "bg-background text-yellow-600 dark:text-yellow-400 border border-yellow-600 dark:border-yellow-400",
      selected: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-2 border-yellow-600 dark:border-yellow-400",
      atomColor: '#CA8A04'
    },
    actinoids: {
      element: "bg-background text-[#b39ddb] dark:text-[#b39ddb] border border-[#b39ddb] dark:border-[#b39ddb]",
      selected: "bg-[#b39ddb]/10 dark:bg-[#b39ddb]/20 text-[#b39ddb] dark:text-[#b39ddb] border-2 border-[#b39ddb] dark:border-[#b39ddb]",
      atomColor: '#B39DDB'
    },
    alkaline_earth_metals: {
      element: "bg-background text-orange-500 dark:text-orange-400 border border-orange-500 dark:border-orange-400",
      selected: "bg-orange-50 dark:bg-orange-950/30 text-orange-500 dark:text-orange-400 border-2 border-orange-500 dark:border-orange-400",
      atomColor: '#F97316'
    },
    alkali_metals: {
      element: "bg-background text-red-500 dark:text-red-400 border border-red-500 dark:border-red-400",
      selected: "bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 border-2 border-red-500 dark:border-red-400",
      atomColor: '#EF4444'
    },
  };

  return styleMap[atomicGroup] || { element: "bg-background text-foreground border border-muted-foreground", selected: "bg-background text-foreground border-2 border-foreground", atomColor: '#FFFFFF' };
};

export const getElementTheme3Style = (atomicGroup: string): ElementStyles => {
  const styleMap: Record<string, ElementStyles> = {
    alkali_metals: {
      element:
        "bg-[#A58BFF] bg-gradient-to-b from-[#A58BFF] to-[#8C6CFF] dark:from-[#5d3ccd] dark:to-[#3a1c82] text-white",
      selected:
        "bg-gradient-to-b from-[#A58BFF] to-[#8C6CFF] dark:from-[#5d3ccd] dark:to-[#3a1c82] text-white border-white",
      atomColor: '#A58BFF',
    },

    alkaline_earth_metals: {
      element:
        "bg-[#8C2BFF] bg-gradient-to-b from-[#8C2BFF] to-[#6C1FD1] dark:from-[#5a1bb3] dark:to-[#2f0a6d] text-white",
      selected:
        "bg-gradient-to-b from-[#8C2BFF] to-[#6C1FD1] dark:from-[#5a1bb3] dark:to-[#2f0a6d] text-white border-white",
      atomColor: '#8C2BFF',
    },

    transition_metals: {
      element:
        "bg-[#FF7DAF] bg-gradient-to-b from-[#FF7DAF] to-[#FF5F95] dark:from-[#b44d7b] dark:to-[#6a2545] text-white",
      selected:
        "bg-gradient-to-b from-[#FF7DAF] to-[#FF5F95] dark:from-[#b44d7b] dark:to-[#6a2545] text-white border-white",
      atomColor: '#FF7DAF',
    },

    post_transition_metals: {
      element:
        "bg-[#26AADC] bg-gradient-to-b from-[#26AADC] to-[#1A8EB8] dark:from-[#0c6f8f] dark:to-[#063c4f] text-white",
      selected:
        "bg-gradient-to-b from-[#26AADC] to-[#1A8EB8] dark:from-[#0c6f8f] dark:to-[#063c4f] text-white border-white",
      atomColor: '#26AADC',
    },

    nonmetals: {
      element:
        "bg-[#FFB300] bg-gradient-to-b from-[#FFB300] to-[#FF9800] dark:from-[#b37a00] dark:to-[#5a3e00] text-white",
      selected:
        "bg-gradient-to-b from-[#FFB300] to-[#FF9800] dark:from-[#b37a00] dark:to-[#5a3e00] text-white border-white",
      atomColor: '#FFB300',
    },

    metalloids: {
      element:
        "bg-[#2082FF] bg-gradient-to-b from-[#2082FF] to-[#0066e9] dark:from-[#0f4a99] dark:to-[#062454] text-white",
      selected:
        "bg-gradient-to-b from-[#2082FF] to-[#0066e9] dark:from-[#0f4a99] dark:to-[#062454] text-white border-white",
      atomColor: '#2082FF',
    },

    noble_gases: {
      element:
        "bg-[#FF5A79] bg-gradient-to-b from-[#FF5A79] to-[#FF3B5D] dark:from-[#b23245] dark:to-[#611a25] text-white",
      selected:
        "bg-gradient-to-b from-[#FF5A79] to-[#FF3B5D] dark:from-[#b23245] dark:to-[#611a25] text-white border-white",
      atomColor: '#FF5A79',
    },

    lanthanoids: {
      element:
        "bg-[#10DCD5] bg-gradient-to-b from-[#10DCD5] to-[#0fb9b3] dark:from-[#0a8a86] dark:to-[#054342] text-white",
      selected:
        "bg-gradient-to-b from-[#10DCD5] to-[#0fb9b3] dark:from-[#0a8a86] dark:to-[#054342] text-white border-white",
      atomColor: '#10DCD5',
    },

    actinoids: {
      element:
        "bg-[#41D500] bg-gradient-to-b from-[#41D500] to-[#2eb000] dark:from-[#1a7f00] dark:to-[#073600] text-white",
      selected:
        "bg-gradient-to-b from-[#41D500] to-[#2eb000] dark:from-[#1a7f00] dark:to-[#073600] text-white border-white",
      atomColor: '#41D500',
    },

    othernonmetals: {
      element:
        "bg-[#26AADC] bg-gradient-to-b from-[#26AADC] to-[#1A8EB8] dark:from-[#0c6f8f] dark:to-[#063c4f] text-white",
      selected:
        "bg-gradient-to-b from-[#26AADC] to-[#1A8EB8] dark:from-[#0c6f8f] dark:to-[#063c4f] text-white border-white",
      atomColor: '#26AADC',
    },
  };

  return (
    styleMap[atomicGroup] || {
      element: "bg-muted text-foreground",
      selected: "bg-muted text-foreground border-foreground",
      atomColor: '#8B8B8B',
    }
  );
};

export const getElementTheme4Style = (atomicGroup: string): ElementStyles => {
  const styleMap: Record<string, ElementStyles> = {
    alkali_metals: {
      element:
        "bg-background text-[#A58BFF] border border-[#A58BFF]",
      selected:
        "bg-[#A58BFF]/10 text-[#A58BFF] border-2 border-[#A58BFF]",
      atomColor: '#A58BFF',
    },

    alkaline_earth_metals: {
      element:
        "bg-background text-[#8C2BFF] border border-[#8C2BFF]",
      selected:
        "bg-[#8C2BFF]/10 text-[#8C2BFF] border-2 border-[#8C2BFF]",
      atomColor: '#8C2BFF',
    },

    transition_metals: {
      element:
        "bg-background text-[#FF7DAF] border border-[#FF7DAF]",
      selected:
        "bg-[#FF7DAF]/10 text-[#FF7DAF] border-2 border-[#FF7DAF]",
      atomColor: '#FF7DAF',
    },

    post_transition_metals: {
      element:
        "bg-background text-[#26AADC] border border-[#26AADC]",
      selected:
        "bg-[#26AADC]/10 text-[#26AADC] border-2 border-[#26AADC]",
      atomColor: '#26AADC',
    },

    nonmetals: {
      element:
        "bg-background text-[#FFB300] border border-[#FFB300]",
      selected:
        "bg-[#FFB300]/10 text-[#FFB300] border-2 border-[#FFB300]",
      atomColor: '#FFB300',
    },

    metalloids: {
      element:
        "bg-background text-[#2082FF] border border-[#2082FF]",
      selected:
        "bg-[#2082FF]/10 text-[#2082FF] border-2 border-[#2082FF]",
      atomColor: '#2082FF',
    },

    noble_gases: {
      element:
        "bg-background text-[#FF5A79] border border-[#FF5A79]",
      selected:
        "bg-[#FF5A79]/10 text-[#FF5A79] border-2 border-[#FF5A79]",
      atomColor: '#FF5A79',
    },

    lanthanoids: {
      element:
        "bg-background text-[#10DCD5] border border-[#10DCD5]",
      selected:
        "bg-[#10DCD5]/10 text-[#10DCD5] border-2 border-[#10DCD5]",
      atomColor: '#10DCD5',
    },

    actinoids: {
      element:
        "bg-background text-[#41D500] border border-[#41D500]",
      selected:
        "bg-[#41D500]/10 text-[#41D500] border-2 border-[#41D500]",
      atomColor: '#41D500',
    },

    othernonmetals: {
      element:
        "bg-background text-[#26AADC] border border-[#26AADC]",
      selected:
        "bg-[#26AADC]/10 text-[#26AADC] border-2 border-[#26AADC]",
      atomColor: '#26AADC',
    },
  };

  // For other element types, fall back to theme2 styles which are already border-focused
  const fallbackStyle = getElementTheme2Style(atomicGroup);

  return (
    styleMap[atomicGroup] || fallbackStyle || {
      element: "bg-background text-foreground border border-muted-foreground",
      selected: "bg-background text-foreground border-2 border-foreground",
      atomColor: '#FFFFFF',
    }
  );
};