/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useImperativeHandle, useEffect } from 'react';
import Box from '@mui/material/Box';
import {
  MicOffSharp as MicOffSharpIcon,
  VideocamOff as VideocamOffIcon,
} from '@mui/icons-material';
import VolumeRate from './VolumeRate';

const { forwardRef } = React;

const Videox = forwardRef((props: any, ref) => {
  const {
    volumeRating = true,
    micOpen = false,
    camOpen = false,
    // user = {},
    width = '100%',
    height,
    style = {},
    stream = null,
  } = props;
  const { wrap: wrapStyle, video: videoStyle } = style;
  const videoRef: any = useRef(null);

  useImperativeHandle(ref, () => ({
    current: videoRef.current,
  }));

  useEffect(() => {
    console.log(stream, 'stream--->');
    if (stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        ...wrapStyle,
      }}
    >
      <video
        style={{
          width,
          height,
          maxHeight: '500px',
          backgroundColor: '#000',
          ...videoStyle,
        }}
        poster=""
        autoPlay
        ref={videoRef}
      />
      {/* {micOpen}
      {volumeRate}
      {user} */}
      <Box
        sx={{
          position: 'absolute',
          left: '10px',
          bottom: '10px',
        }}
      >
        {/* <Rating
          name="customized-color"
          defaultValue={2}
          getLabelText={(value: number) => `${value} Heart${value !== 1 ? 's' : ''}`}
          precision={0.5}
          icon={<FavoriteIcon fontSize="inherit" />}
          emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
        /> */}
        { !micOpen ? (
          <MicOffSharpIcon sx={{
            width: '16px',
            height: '16px',
            color: '#dd2c00',
            display: 'flex',
            alignItems: 'center',
          }}
          />
        ) : (
          <VolumeRate animation={volumeRating} />
        )}
        {
          !camOpen && (
          <VideocamOffIcon
            sx={{
              width: '16px',
              height: '16px',
              color: '#dd2c00',
              display: 'flex',
              alignItems: 'center',
              marginTop: '5px',
            }}
          />
          )
        }
      </Box>
    </Box>
  );
});

export default Videox;
