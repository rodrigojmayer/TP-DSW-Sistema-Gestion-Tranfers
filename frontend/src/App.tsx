import { RouterProvider } from 'react-router-dom';
import { router } from './routes/AppRoutes'; // Importamos el objeto que acabamos de crear

function App() {
  return <RouterProvider router={router} />;
}

export default App;
