import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore'; // Ajusta la ruta a tu authStore
import type { Usuario } from '../../../types'; // Ajusta la ruta a tu tipo Usuario

interface UsuarioForm {
  nombre: string;
  apellido: string;
  usuario: string;
  email: string;
  telefono: string;
  dni: string;
  password?: string;
  nroLicencia: string;
  vencimientoLicencia: string;
}

export const MiPerfilPage: React.FC = () => {
  const { user, token, login } = useAuthStore();

  // Inicializamos el estado del formulario directamente desde el usuario autenticado
  const [formData, setFormData] = useState<UsuarioForm>(() => ({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    usuario: user?.usuario || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    dni: user?.dni || '',
    password: '',
    nroLicencia: user?.nroLicencia || '',
    vencimientoLicencia: user?.vencimientoLicencia ? user.vencimientoLicencia.split('T')[0] : '',
  }));

  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (!user || !token) {
      setMensaje({ tipo: 'error', texto: 'No se encontró la sesión del usuario' });
      return;
    }

    setGuardando(true);

    const payload: Partial<UsuarioForm> = { ...formData };

    if (!payload.password) {
      delete payload.password;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/usuario/me`, {
        method: 'PATCH', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Si Express responde 404 HTML u otro status fallido, se valida antes de res.json()
      if (!res.ok) {
        const errorText = await res.text();
        let errorJson;
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          throw new Error(`Error en el servidor (${res.status}): Ruta no encontrada o no válida.`);
        }
        throw new Error(errorJson.error || 'Error al actualizar el perfil');
      }

      const usuarioActualizadoServidor = await res.json();

      // Actualizamos Zustand y localStorage con la respuesta limpia del backend
      const usuarioActualizado = { ...user, ...usuarioActualizadoServidor };
      delete (usuarioActualizado as Partial<Usuario>).password;

      login(usuarioActualizado as Usuario, token);

      setMensaje({ tipo: 'exito', texto: '¡Perfil actualizado con éxito!' });
      setFormData((prev) => ({ ...prev, password: '' }));
    } catch (err: unknown) {
      const texto = err instanceof Error ? err.message : String(err);
      setMensaje({ tipo: 'error', texto });
    } finally {
      setGuardando(false);
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', textAlign: 'center', color: '#991b1b', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
        No hay sesión activa para mostrar el perfil.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Editar Mi Perfil</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Rol actual: <strong>{user.rol}</strong>
      </p>

      {mensaje && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: '6px', backgroundColor: mensaje.tipo === 'exito' ? '#dcfce7' : '#fee2e2', color: mensaje.tipo === 'exito' ? '#166534' : '#991b1b' }}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Nombre</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Apellido</label>
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Usuario</label>
            <input type="text" name="usuario" value={formData.usuario} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>DNI</label>
            <input type="text" name="dni" value={formData.dni} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Teléfono</label>
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
        </div>

        {user.rol === 'CHOFER' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>N° Licencia</label>
              <input type="text" name="nroLicencia" value={formData.nroLicencia} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Vencimiento Licencia</label>
              <input type="date" name="vencimientoLicencia" value={formData.vencimientoLicencia} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Nueva Contraseña (dejar en blanco para no cambiar)</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="******" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <button type="submit" disabled={guardando} style={{ padding: '0.75rem', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}>
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};