import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';

export default function SendMessage(props: any) {
  const { handleSendMessage } = props;
  const [value, setValue] = useState('');
  const [wrap, setWrap] = useState(false);
  return (
    <Paper
      component="div"
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        // position: 'absolute',
        // bottom: '0',
        height: '48px',
        width: '100%',
        background: '#fff',
        boxSizing: 'border-box',
        borderRadius: 1,
        backgroundColor: '#313131 !important',
      }}
    >
      <InputBase
        value={value}
        multiline
        onChange={(ev) => { setValue(ev.target.value); }}
        sx={{
          flex: 1, color: '#fff', fontSize: '14px',
        }}
        onKeyDown={(ev) => {
          const { key, keyCode } = ev;
          if (key === 'Shift' && keyCode === 16) {
            setWrap(true);
          }
        }}
        onKeyUp={(ev) => {
          console.log(ev);
          const { key, keyCode } = ev;
          if (keyCode === 13 && key === 'Enter' && value && !wrap) {
            handleSendMessage(value);
            setValue('');
          }
          if (key === 'Shift' && keyCode === 16) {
            setWrap(false);
          }
        }}
        placeholder="请输入，然后biu~"
        inputProps={{
          'aria-label': '请输入，然后biu~',
          style: {
            maxHeight: '30px',
            height: '20px',
            overflow: 'scroll',
          },
        }}
      />
      <IconButton
        type="submit"
        sx={{ p: '10px' }}
        aria-label="search"
        onClick={() => {
          if (value) {
            handleSendMessage(value);
            setValue('');
          }
        }}
      >
        <SendIcon sx={{ color: '#fff', fontSize: '16px' }} />
      </IconButton>
    </Paper>
  );
}
