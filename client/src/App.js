import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { CssBaseline } from '@mui/material';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import io from 'socket.io-client';
import FileTable from './FileTable';

let socket = io.connect('http://localhost:3001');
const FILE_URL = 'https://www.stats.govt.nz/assets/Uploads/Annual-enterprise-survey/Annual-enterprise-survey-2021-financial-year-provisional/Download-data/annual-enterprise-survey-2021-financial-year-provisional-size-bands-csv.csv';

function App() {
  const [url, setUrl] = useState(FILE_URL);
  const [fileData, setFileData] = useState([]);
  const [error, setError] = useState('');
  const [rowsToShow, setRowsToShow] = useState(1);
  const [headers, setHeaders] = useState([]);
  const [isReadyToDraw, setIsReadyToDraw] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    socket.on('fileData', (row) => {
      setFileData((prevState) => {
        return [
          ...prevState,
          row,
        ]
      });
    });

    socket.on('headers', (headers) => {
      setHeaders(headers);
    });

    socket.on('fileError', (errorMessage) => {
      setError(errorMessage);
    });

    socket.on('fileCount', (count) => {
    });

    socket.on('fileEnd', (count) => {
      socket.close();
      setIsOpen(false);
      setIsDownloaded(true);
      setIsReadyToDraw(true);
      setIsDisabled(false);
    });

    return () => {
      socket.off('fileData');
      socket.off('headers');
      socket.off('fileEnd');
      socket.off('fileError');
    }
  }, []);

  const handleLoadFile = () => {
    if (!isDownloaded) {
      if (!isOpen) {
        socket = io.connect('http://localhost:3001');
      }
      socket.emit('loadFile', { url });
      setIsDisabled(true);
    } else {
      setIsReadyToDraw(true);
    }
  };

  return (
    <Container component='main' maxWidth='xs'>
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component='h1' variant='h5'>
          Enter file url
        </Typography>
        <Box sx={{ mt: 1 }}>
          <TextField
            placeholder='URL..'
            margin='normal'
            fullWidth
            id='url'
            label='Enter URL'
            name='url'
            autoComplete='url'
            autoFocus
            onChange={(e) => setUrl(e.target.value)}
            defaultValue={FILE_URL}
          />
          <TextField
            placeholder='Rows..'
            margin='normal'
            fullWidth
            id='rows'
            label='Enter rows to show'
            name='rows'
            autoComplete='rows'
            autoFocus
            defaultValue="1"
            required
            onChange={(e) => setRowsToShow(e.target.value)}
          />
          <Button
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLoadFile}
            disabled={isDisabled}
          >
            Show table
          </Button>
        </Box>
        {error ? <Typography h3>Some errors</Typography>
          : <Box>
            {isReadyToDraw && <FileTable headers={headers} fileData={fileData} count={rowsToShow} />}
          </Box>}
      </Box>
    </Container>
  );
}

export default App