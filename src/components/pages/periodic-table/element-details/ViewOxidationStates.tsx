import React from 'react';
import { useTranslation } from 'react-i18next';

interface ViewOxidationStatesProps {
  radius?: number;
  padding?: React.CSSProperties['padding'];
  spacing?: React.CSSProperties['margin'];
  textColor?: string;
  oxs: number[];
}

const ViewOxidationStates: React.FC<ViewOxidationStatesProps> = ({
  radius = 20.0,
  spacing = '0 2px 0 0',
  textColor = 'white',
  oxs
}) => {
  const { t } = useTranslation();

  const createView = () => {
    const idxOs = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const views = [];

    for (let i = 0; i < idxOs.length; i++) {
      const os_ = idxOs[i];
      let bgColor;
      let label;

      if (oxs.includes(os_)) {
        bgColor = os_ === 0 ? '#4ade80' : (os_ > 0 ? '#3b82f6' : '#ef4444'); // green, blue, red
        label = os_ === 0 ? "0" : (os_ > 0 ? `+${os_}` : `${os_}`);
      } else {
        bgColor = '#9ca3af'; // grey
        label = "-";
      }

      views.push(
        <div
          key={os_}
          style={{
            width: radius,
            height: radius,
            margin: spacing,
            backgroundColor: bgColor,
            borderRadius: radius / 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ color: textColor, fontSize: radius * 0.6 }}>
            {label}
          </span>
        </div>
      );
    }

    return views;
  };

  return (
    <div className='flex flex-wrap'>
        {createView()}
    </div>
  );
};

export default ViewOxidationStates;