import './App.css'
import SettingsProvider from './hooks/SettingsProvider'
import AppRouter from './router/route'
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

function App() {

  return (
    <>
    <SimpleBar style={{ maxHeight: '100vh' }} autoHide={true}>
    <SettingsProvider>
      <AppRouter/>
      </SettingsProvider>
      </SimpleBar>
    </>
  )
}

export default App
