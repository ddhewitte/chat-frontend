import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chat from './components/Chat'

function App() {

  return (
    <>
      <Chat
        cableUrl="ws://localhost:3001/cable"
        channel="ChatroomChannel"
        room="public"
        username="ddhewitte"
      />
    </>
  )
}

export default App
