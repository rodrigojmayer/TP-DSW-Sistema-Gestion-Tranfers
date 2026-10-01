import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface SignUpForm {
  usuario: string;
  password: string;
  confirmarPassword: string;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono: string;
}

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignUpForm>({
    usuario: '',
    password: '',
    confirmarPassword: '',
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    telefono: '',
  });

  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas en frontend
    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);

    // Armamos el payload descartando confirmarPassword
    const payload = {
      usuario: formData.usuario,
      password: formData.password,
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      dni: formData.dni || undefined,
      telefono: formData.telefono || undefined,
      rol: 'CLIENTE', // Rol por defecto según tu backend schema
    };

    try {
      const res = await fetch('http://localhost:3000/api/usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detalle || data.error || 'Error al registrar la cuenta');
      }

      // Registro exitoso: redirigir al login
      navigate('/login', { state: { mensaje: '¡Cuenta creada con éxito! Por favor inicia sesión.' } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar la cuenta';
      setError(message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Crear una Cuenta</h2>
      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '1.5rem' }}>Regístrate para comenzar a usar Transfers App</p>

      {error && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#991b1b' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Nombre *</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Apellido *</label>
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Usuario *</label>
            <input type="text" name="usuario" value={formData.usuario} onChange={handleChange} required minLength={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Email *</label>
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

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Contraseña *</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="Mínimo 6 caracteres" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Confirmar Contraseña *</label>
          <input type="password" name="confirmarPassword" value={formData.confirmarPassword} onChange={handleChange} required minLength={6} placeholder="Repite tu contraseña" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <button type="submit" disabled={cargando} style={{ padding: '0.75rem', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
          {cargando ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" style={{ color: '#f59e0b', fontWeight: 'bold', textDecoration: 'none' }}>
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
};