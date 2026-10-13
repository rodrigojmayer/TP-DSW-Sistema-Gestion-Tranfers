import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes'; // O import { AppRoutes } from './routes/AppRoutes';
import { GlobalModal } from './components/ui/GlobalModal'; // Si utilizas el modal global

function App() {
  return (
    <BrowserRouter>
      {/* Componentes globales como Modales o Toasts */}
      <GlobalModal />

      {/* Tu árbol de rutas */}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;

// import { RouterProvider } from 'react-router-dom';
// import { router } from './routes/AppRoutes'; // Importamos el objeto que acabamos de crear

// function App() {
//   return <RouterProvider router={router} />;
// }

// export default App;
