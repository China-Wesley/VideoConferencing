/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable max-len */
import React, { useEffect, useState, useRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import ReactDOM from 'react-dom';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

const defaultConfig = {
  vertical: 'top',
  horizontal: 'center',
};

function Message(props: {
  message: string;
  config?: any;
  open?: boolean;
  wrap: any;
}) {
  const {
    message = '', config = {}, open = true, wrap,
  } = props;
  const [iopen, setIOpen] = useState(open);
  const curConfig = useRef({ ...defaultConfig, ...config });

  const handleClose = () => {
    setIOpen(false);
    setTimeout(() => {
      document.body.removeChild(wrap);
    }, 300);
  };

  const render = () => {
    const { vertical, horizontal, type } = curConfig.current;
    return (
      <div>
        <Snackbar
          anchorOrigin={{ vertical: (vertical as ('top' | 'bottom')), horizontal: (horizontal as ('center' | 'left' | 'right')) }}
          open={iopen}
          autoHideDuration={6000}
          onClose={handleClose}
          message={message}
          key={vertical + horizontal}
          {...curConfig.current}
        >
          <Alert onClose={handleClose} severity={type} sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
      </div>
    );
  };
  return render();
}

export default (message = '', config = {}, open = true) => {
  const dom = document.createElement('div');
  const id = `message_wrap${String(Math.random()).split('.')[1]}`;
  dom.id = id;
  document.body.appendChild(dom);
  ReactDOM.render(
    <Message
      message={message}
      config={config}
      open={open}
      wrap={dom}
    />,
    document.querySelector(`#${id}`) as any,
  );
};
