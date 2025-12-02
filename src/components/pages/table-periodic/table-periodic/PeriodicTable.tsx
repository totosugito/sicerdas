import React, { useState, useEffect } from 'react';
import PeriodicCell from './PeriodicCell';
import PeriodicHeader from './PeriodicHeader';
import { PeriodicElement, PeriodicStyle } from './types';

interface PeriodicTableProps {
  layouts: PeriodicElement[];
  minCellSize?: number;
  maxCellSize?: number;
  headerSize?: number;
  onCellClicked: (atom: PeriodicElement) => void;
}

// Define color mapping for element groups
const getElementColor = (group: string): string => {
  const colorMap: Record<string, string> = {
    'header': '#e0e0e0',
    'headerEmpty': '#f5f5f5',
    'empty': '#ffffff',
    'alkaliMetals': '#ffcccc',
    'alkalineEarthMetals': '#ff9999',
    'transitionMetals': '#ffc0c0',
    'postTransitionMetals': '#ccccff',
    'metalloids': '#ccffcc',
    'otherNonMetals': '#ffffcc',
    'halogens': '#ccffff',
    'nobleGases': '#ffccff',
    'lanthanides': '#ff99cc',
    'actinides': '#ff6699',
  };
  
  return colorMap[group] || '#ffffff';
};

const defaultStyles: PeriodicStyle = {
  theme: 'default',
  cellSpacing: 2,
  getColorBg: getElementColor,
};

const PeriodicTable: React.FC<PeriodicTableProps> = ({ 
  layouts, 
  minCellSize = 75,
  maxCellSize = 90,
  headerSize = 25,
  onCellClicked 
}) => {
  const groupCount = 19; // column count
  const periodCount = 11; // row count
  
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate cell size based on available space
  const calculateCellSize = () => {
    const pad = 5;
    const availableHeight = Math.max(dimensions.width, dimensions.height) - 100; // Approximate header/padding
    const sizeWithoutCell = 2 * (pad + headerSize);
    const cellSize = dimensions.width > dimensions.height
      ? Math.floor((availableHeight - sizeWithoutCell) / (groupCount - 1))
      : Math.floor((availableHeight - sizeWithoutCell) / (periodCount - 1));
    
    return Math.min(Math.max(cellSize, minCellSize), maxCellSize);
  };

  const cellSize = calculateCellSize();

  const createElementItem = (atom: PeriodicElement, width: number, height: number) => {
    if (atom.atomicGroup === 'header' || atom.atomicGroup === 'headerEmpty') {
      return (
        <PeriodicHeader
          styles={defaultStyles}
          atom={atom}
          width={width}
          height={height}
        />
      );
    } else {
      return (
        <PeriodicCell
          styles={defaultStyles}
          atom={atom}
          width={width}
          height={height}
          onCellClicked={onCellClicked}
        />
      );
    }
  };

  return (
    <div className="p-1 w-full h-full overflow-auto">
      <div className="flex flex-col h-full">
        {/* Periodic HEADER GROUP (Column Header) */}
        <div style={{ height: headerSize }} className="flex">
          {createElementItem(layouts[0], headerSize, headerSize)}
          <div className="flex-1 overflow-x-auto">
            <div className="flex">
              {Array.from({ length: groupCount - 1 }).map((_, index) => (
                <div key={index}>
                  {createElementItem(layouts[index + 1], cellSize, headerSize)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Periodic Contents */}
        <div className="flex-1 flex">
          {/* Periodic HEADER PERIOD (Row Header) */}
          <div style={{ width: headerSize }} className="overflow-y-auto">
            {Array.from({ length: periodCount - 1 }).map((_, index) => {
              const idx = (index + 1) * groupCount;
              return (
                <div key={index}>
                  {createElementItem(layouts[idx], headerSize, cellSize)}
                </div>
              );
            })}
          </div>

          {/* Periodic ATOMS */}
          <div className="flex-1 overflow-auto">
            <div style={{ width: (groupCount - 1) * cellSize }}>
              {Array.from({ length: periodCount - 1 }).map((_, y) => (
                <div key={y} className="flex">
                  {Array.from({ length: groupCount - 1 }).map((_, x) => {
                    const idx = (y + 1) * groupCount + (x + 1);
                    return (
                      <div key={`${y}-${x}`}>
                        {createElementItem(layouts[idx], cellSize, cellSize)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodicTable;