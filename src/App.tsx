import Router from './routes';
import { AppProvider } from './provider';
import Header from '@/components/layout/header';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <AppProvider>
      <div className="App min-h-screen bg-gray-50">
        <Header />
        <Router />
      </div>
      <Toaster />
    </AppProvider>
  );
}

export default App;
