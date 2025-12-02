import React from 'react';
import { PeriodicElement, PeriodicStyle } from './types';

interface PeriodicHeaderProps {
  styles: PeriodicStyle;
  atom: PeriodicElement;
  width: number;
  height: number;
}

const PeriodicHeader: React.FC<PeriodicHeaderProps> = ({ 
  styles, 
  atom, 
  width, 
  height 
}) => {
  return (
    <div
      style={{ 
        width, 
        height,
        backgroundColor: styles.getColorBg(atom.atomicGroup),
      }}
      className="flex items-center justify-center text-xs"
    >
      {atom.atomicSymbol}
    </div>
  );
};

export default PeriodicHeader;