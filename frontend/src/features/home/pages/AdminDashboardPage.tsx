import { PageContainer } from '../../../components/layouts/PageContainer';

export function AdminDashboardPage() {
  return (
    <PageContainer
      title="Panel de Administración"
      subtitle="Bienvenido al sistema de gestión de traslados"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700">Gestionar Viajes</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configura horarios y trayectos disponibes.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700">Reservas Activas</h2>
          <p className="text-sm text-gray-500 mt-1">
            Revisa las reservas confirmadas por los usuarios.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700">Usuarios</h2>
          <p className="text-sm text-gray-500 mt-1">
            Administra clientes, choferes y operadores.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
