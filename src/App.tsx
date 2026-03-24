import './App.css'
import SettingsProvider from './hooks/SettingsProvider'
import AppRouter from './router/route'

function App() {

  return (
    <>
    <SettingsProvider>
      <AppRouter/>
      </SettingsProvider>
    </>
  )
}

export default App
