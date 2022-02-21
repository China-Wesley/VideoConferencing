import React from 'react';
import Avatar from '@mui/material/Avatar';

function stringToColor(string: string) {
  if (!string) return '';
  let hash = 0;
  let i;
  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.substr(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function getName(name: string) {
  if (!name) return '';
  return name.slice(name.length - 3, name.length);
}

export default function CAvatar(props: any) {
  const { sx, name } = props;
  return (
    <Avatar
      sx={{
        ...sx,
        bgcolor: stringToColor(name),
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        wordBreak: 'break-all',
      }}
    >
      {getName(name)}
    </Avatar>
  );
}
