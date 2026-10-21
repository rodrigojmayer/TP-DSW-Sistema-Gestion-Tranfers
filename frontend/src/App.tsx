import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { GlobalModal } from './components/ui/GlobalModal'; 

function App() {
  return (
    <BrowserRouter>
      <GlobalModal />

      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;