import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chat from './components/Chat'

function App() {

  const SOCKET_ENDPOINT = import.meta.env.VITE_CABLE_URL_ENDPOINT;

  return (
    <>
      <Chat
        cableUrl= {SOCKET_ENDPOINT}
        channel="ChatroomChannel"
        room="public"
      />
    </>
  )
}

export default App
