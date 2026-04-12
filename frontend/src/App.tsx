import './App.css'
import { SnackbarProvider } from 'notistack'
import SettingsProvider from './hooks/SettingsProvider'
import AppRouter from './router/route'
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

function App() {
  return (
    <SettingsProvider>
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <SimpleBar style={{ height: '100vh' }} autoHide={true}>
          <AppRouter />
        </SimpleBar>
      </SnackbarProvider>
    </SettingsProvider>
  )
}

export default App
