import React from 'react';

export default function VolumeRate(props: any) {
  const { style, animation = true } = props;
  return (
    <div
      className={`volume-rate-wrap ${animation ? 'volume-animation-play' : ''}`}
      style={{
        width: '16px',
        height: '16px',
        ...style,
      }}
    >
      <div className="volume-rate-block" />
      <div className="volume-rate-block" />
      <div className="volume-rate-block" />
    </div>
  );
}
