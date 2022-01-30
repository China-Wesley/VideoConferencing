/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Box from '@mui/material/Box';

export default function TabPanel(props: any) {
  const {
    children, value, index, ...other
  } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      style={{
        overflowY: 'scroll',
        paddingTop: '10px',
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
