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

const defaultValues = {
  url: FILE_URL,
  rows: 1,
}

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
  const [formErrors, setFormErrors] = useState(false);
  const [count, setCount] = useState(0);

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
      setIsDisabled(false);
    });

    socket.on('fileEnd', (rowsCount) => {
      socket.close();
      setCount(rowsCount);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fieldUrl = data.get('fieldUrl');
    const rows = data.get('rows');

    if (fieldUrl && rows) {
      setFormErrors(false);
      setUrl(fieldUrl);
      setRowsToShow(rows);

      if (!isDownloaded) {
        if (!isOpen) {
          socket = io.connect('http://localhost:3001');
        }
        socket.emit('loadFile', { url });
        setIsDisabled(true);
      } else {
        setIsReadyToDraw(true);
      }
    } else {
      setFormErrors(true);
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
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            error={formErrors}
            required
            name='fieldUrl'
            placeholder='URL..'
            margin='normal'
            fullWidth
            id='fieldUrl'
            label='Enter URL'
            autoComplete='fieldUrl'
            autoFocus
            defaultValue={defaultValues.url}
          />
          <TextField
            error={formErrors}
            name='rows'
            placeholder='Rows..'
            margin='normal'
            fullWidth
            id='rows'
            label='Enter rows to show'
            autoComplete='rows'
            autoFocus
            defaultValue={defaultValues.rows}
            required
          />
          <Button
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
            type='submit'
            disabled={isDisabled}
          >
            Show table
          </Button>
        </Box>
        <Typography component='h6'>Loaded {count} rows</Typography>
        {error ? <Typography h3>Some errors</Typography>
          : <Box>
            {isReadyToDraw && <FileTable headers={headers} fileData={fileData} count={rowsToShow} />}
          </Box>}
      </Box>
    </Container>
  );
}

export default App