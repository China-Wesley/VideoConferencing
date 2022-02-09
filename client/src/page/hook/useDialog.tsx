/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable max-len */
import React, {
  useEffect, useState, useRef, ReactChild,
} from 'react';
import {
  Dialog as MDialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from '@mui/material';
import ReactDOM from 'react-dom';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

function Dialog(props: {
  content: string;
  title?: string
  actions?: ReactChild;
  onConfirm?: () => void;
  onCancel?: () => void;
  config?: any;
  open?: boolean;
  wrap?: any;
}) {
  const {
    title = '', content = '', config = {}, open = true, wrap, actions, onConfirm, onCancel,
  } = props;
  const [iopen, setIOpen] = useState(open);

  const handleClose = () => {
    setIOpen(false);
    setTimeout(() => {
      document.body.removeChild(wrap);
    }, 300);
  };

  const render = () => (
    <div>
      <MDialog
        open={iopen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        {...config}
      >
        <DialogTitle>
          {title || ''}
        </DialogTitle>
        <DialogContent>
          {
                typeof content === 'string' ? (
                  <DialogContentText>
                    {content || ''}
                  </DialogContentText>
                ) : content
            }
        </DialogContent>
        <DialogActions>
          {
                actions || (
                <div>
                  <Button onClick={() => {
                    onCancel && onCancel();
                    handleClose();
                  }}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={() => {
                      onConfirm && onConfirm();
                      handleClose();
                    }}
                    autoFocus
                    variant="contained"
                  >
                    确认
                  </Button>
                </div>
                )
            }
        </DialogActions>
      </MDialog>
    </div>
  );
  return render();
}

export default (content = '', config: any = {}, open = true) => {
  const {
    title, actions, onConfirm, onCancel, ...others
  } = config;
  const dom = document.createElement('div');
  const id = `dialog_wrap${String(Math.random()).split('.')[1]}`;
  dom.id = id;
  document.body.appendChild(dom);
  ReactDOM.render(
    <Dialog
      content={content}
      config={others}
      title={title}
      onConfirm={onConfirm}
      onCancel={onCancel}
      actions={actions}
      open={open}
      wrap={dom}
    />,
    document.querySelector(`#${id}`) as any,
  );
};
