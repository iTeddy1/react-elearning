import { ToastContainer } from 'react-toastify';
import Router from './routes';
import { AppProvider } from './provider';
import Header from '@/components/layout/header';

function App() {
  return (
    <AppProvider>
      <div className="App min-h-screen bg-gray-50">
        <Header />
        <Router />
      </div>
      <ToastContainer />
    </AppProvider>
  );
}

export default App;
