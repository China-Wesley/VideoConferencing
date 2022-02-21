/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Box from '@mui/material/Box';

export default function TabPanel(props: any) {
  const {
    children, value, index, style, ...other
  } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      style={{
        overflowY: 'auto',
        paddingTop: '10px',
        ...style,
      }}
      {...other}
    >
      {value === index && (
      <Box>
          {children}
      </Box>
      )}
    </div>
  );
}
