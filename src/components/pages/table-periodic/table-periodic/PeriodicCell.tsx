import React from 'react';
import { PeriodicElement, PeriodicStyle } from './types';

interface PeriodicCellProps {
  styles: PeriodicStyle;
  atom: PeriodicElement;
  width: number;
  height: number;
  onCellClicked: (atom: PeriodicElement) => void;
}

const PeriodicCell: React.FC<PeriodicCellProps> = ({ 
  styles, 
  atom, 
  width, 
  height, 
  onCellClicked 
}) => {
  const atomicNumber = atom.atomicNumber < 0 ? "" : atom.atomicNumber.toString();
  const atomicSymbol = atom.atomicSymbol;
  const atomicName = atom.atomicName;

  // Set atom for La or Ac atom (special handling for lanthanides and actinides)
  const displayAtomicNumber = atom.atomicNumber > 1000 ? atom.atomicName : atomicNumber;
  const displayAtomicSymbol = atom.atomicNumber > 1000 ? "" : atomicSymbol;
  const displayAtomicName = atom.atomicNumber > 1000 ? atom.atomicSymbol : atomicName;

  const createCellView = () => {
    if(displayAtomicNumber < 0) {
        return(null);
    }
    return (
      <div
        className="flex flex-col justify-between p-1 rounded border border-gray-300"
        style={{ 
          backgroundColor: styles.getColorBg(atom.atomicGroup),
          width: width - styles.cellSpacing * 2,
          height: height - styles.cellSpacing * 2,
        }}
      >
        <span className="text-xs font-bold">{displayAtomicNumber}</span>
        <span className="text-lg font-bold self-center">{displayAtomicSymbol}</span>
        <span className="text-xs text-center truncate">{displayAtomicName}</span>
      </div>
    );
  };

  return (
    <div
      onClick={() => onCellClicked(atom)}
      style={{ width, height }}
      className="cursor-pointer"
    >
      {createCellView()}
    </div>
  );
};

export default PeriodicCell;