import { useEffect, useState, useRef } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { viajeSchema, type ViajeFormData } from '../schemas/viajeSchema';
import { viajeService } from '../api/viajeService';
import type { Viaje, Ruta, Usuario } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Search, ChevronDown, Calendar } from 'lucide-react';

interface ViajeFormProps {
  idEditando: string | null;
  viajeAEditar: Viaje | null;
  rutasDisponibles: Ruta[];
  choferesDisponibles: Usuario[];
  onSuccess: () => void;
  onCancelar: () => void;
}

export const ViajeForm = ({
  idEditando,
  viajeAEditar,
  rutasDisponibles,
  choferesDisponibles,
  onSuccess,
}: ViajeFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ViajeFormData>({
    resolver: zodResolver(viajeSchema) as unknown as Resolver<ViajeFormData>,
    defaultValues: {
      idRuta: '',
      idChofer: '',
      fechaHoraInicio: '',
      fechaHoraFin: '',
      capacidadPasajeros: 4,
      capacidadValijas: 4,
      precio: 0,
    },
  });

  const idRutaActual = watch('idRuta');
  const idChoferActual = watch('idChofer');
  const fechaInicioActual = watch('fechaHoraInicio');

  useEffect(() => {
    if (viajeAEditar) {
      setValue('idRuta', viajeAEditar.idRuta || '');
      setValue('idChofer', viajeAEditar.idChofer || '');
      setValue('tipo', viajeAEditar.tipo || 'COMPARTIDO');
      setValue(
        'fechaHoraInicio',
        viajeAEditar.fechaHoraInicio
          ? new Date(viajeAEditar.fechaHoraInicio).toISOString().slice(0, 16)
          : '',
      );
      setValue(
        'fechaHoraFin',
        viajeAEditar.fechaHoraFin
          ? new Date(viajeAEditar.fechaHoraFin).toISOString().slice(0, 16)
          : '',
      );
      setValue('capacidadPasajeros', viajeAEditar.capacidadPasajeros ?? 4);
      setValue('capacidadValijas', viajeAEditar.capacidadValijas ?? 4);
      setValue('precio', viajeAEditar.precio);
    } else {
      reset({
        idRuta: '',
        idChofer: '',
        fechaHoraInicio: '',
        fechaHoraFin: '',
        capacidadPasajeros: 4,
        capacidadValijas: 4,
        precio: 0,
      });
    }
  }, [viajeAEditar, setValue, reset]);

  const onSubmit = async (data: ViajeFormData) => {
    try {
      if (idEditando) {
        await viajeService.actualizar(idEditando, data);
      } else {
        await viajeService.crear(data);
      }
      onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar');
    }
  };

  const prevenirNegativos = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const obtenerFechaHoraActualLocal = () => {
    const ahora = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const anio = ahora.getFullYear();
    const mes = pad(ahora.getMonth() + 1);
    const dia = pad(ahora.getDate());
    const hora = pad(ahora.getHours());
    const minuto = pad(ahora.getMinutes());
    return `${anio}-${mes}-${dia}T${hora}:${minuto}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputAutocompletarRuta
        etiqueta="Ruta Asignada"
        rutas={rutasDisponibles}
        valorActualId={idRutaActual || ''}
        onSeleccionar={(id) => setValue('idRuta', id, { shouldValidate: true })}
        error={errors.idRuta?.message}
      />

      <InputAutocompletarChofer
        etiqueta="Chofer Responsable"
        choferes={choferesDisponibles}
        valorActualId={idChoferActual || ''}
        onSeleccionar={(id) => setValue('idChofer', id, { shouldValidate: true })}
        error={errors.idChofer?.message}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-slate-700">Fecha/Hora Salida</label>
          <div className="relative flex items-center w-full">
            {(() => {
              const { ref: regRef, ...rest } = register('fechaHoraInicio');
              return (
                <>
                  <input
                    type="datetime-local"
                    min={obtenerFechaHoraActualLocal()}
                    max={watch('fechaHoraFin') || ''}
                    className="w-full text-sm pl-3 pr-10 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700 cursor-pointer"
                    {...rest}
                    ref={(e) => {
                      regRef(e);
                      // @ts-expect-error referencia local para el picker
                      window.inputSalidaRef = e;
                    }}
                  />
                  <div
                    onClick={() => {
                      // @ts-expect-error abrir calendario al hacer click en el icono
                      window.inputSalidaRef?.showPicker?.();
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition"
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                </>
              );
            })()}
          </div>
          {errors.fechaHoraInicio?.message && (
            <span className="text-xs text-red-500 font-medium">{errors.fechaHoraInicio.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-slate-700">Fecha/Hora Llegada</label>
          <div className="relative flex items-center w-full">
            {(() => {
              const { ref: regRefFin, ...restFin } = register('fechaHoraFin');
              return (
                <>
                  <input
                    type="datetime-local"
                    min={fechaInicioActual || ''}
                    className="w-full text-sm pl-3 pr-10 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700 cursor-pointer"
                    {...restFin}
                    ref={(e) => {
                      regRefFin(e);
                      // @ts-expect-error referencia local para el picker
                      window.inputLlegadaRef = e;
                    }}
                  />
                  <div
                    onClick={() => {
                      // @ts-expect-error abrir calendario al hacer click en el icono
                      window.inputLlegadaRef?.showPicker?.();
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition"
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                </>
              );
            })()}
          </div>
          {errors.fechaHoraFin?.message && (
            <span className="text-xs text-red-500 font-medium">{errors.fechaHoraFin.message}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          label="Cupo Pasajeros"
          min={0}
          onKeyDown={prevenirNegativos}
          className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
          error={errors.capacidadPasajeros?.message}
          {...register('capacidadPasajeros')}
        />
        <Input
          type="number"
          label="Cupo Valijas"
          min={0}
          onKeyDown={prevenirNegativos}
          className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
          error={errors.capacidadValijas?.message}
          {...register('capacidadValijas')}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">
          Precio del Pasaje
        </label>
        <div className="relative flex items-center w-full h-10 border border-slate-300 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-amber-400">
          <span className="pl-3 pr-1.5 text-sm font-semibold text-slate-400 select-none">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min={0}
            onKeyDown={prevenirNegativos}
            {...register('precio', { valueAsNumber: true })}
            className="w-full h-full pr-3 py-2 bg-transparent text-sm text-slate-800 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
          />
        </div>
        {errors.precio?.message && (
          <span className="text-xs text-red-500 font-medium">
            {errors.precio.message}
          </span>
        )}
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        {idEditando ? 'Guardar Cambios' : 'Programar Servicio'}
      </Button>
    </form>
  );
};

interface InputAutocompletarRutaProps {
  etiqueta: string;
  rutas: Ruta[];
  valorActualId: string | undefined;
  onSeleccionar: (id: string) => void;
  error?: string;
}

const InputAutocompletarRuta = ({
  etiqueta,
  rutas,
  valorActualId,
  onSeleccionar,
  error,
}: InputAutocompletarRutaProps) => {
  const [textoInput, setTextoInput] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const rutaActual = rutas.find((r) => r.idRuta === valorActualId);
  const textoFormateado = rutaActual ? rutaActual.nombre : '';
  const busqueda = textoInput !== null ? textoInput : textoFormateado;

  const rutasFiltradas = rutas.filter((r) => {
    const query = busqueda.toLowerCase().trim();
    return r.nombre?.toLowerCase().includes(query);
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col gap-1" ref={contenedorRef}>
      <label className="text-sm font-medium text-slate-700">{etiqueta}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Escriba para buscar ruta..."
          value={busqueda}
          onChange={(e) => {
            setTextoInput(e.target.value);
            setAbierto(true);
            if (!e.target.value) onSeleccionar('');
          }}
          onFocus={() => setAbierto(true)}
          className="w-full text-sm pl-9 pr-8 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>

        {abierto && rutasFiltradas.length > 0 && (
          <ul className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-52 overflow-y-auto text-sm divide-y divide-slate-100">
            {rutasFiltradas.map((r) => (
              <li
                key={r.idRuta}
                onClick={() => {
                  onSeleccionar(r.idRuta);
                  setTextoInput(null);
                  setAbierto(false);
                }}
                className="px-3 py-2.5 hover:bg-amber-50 cursor-pointer transition text-slate-700 text-xs font-medium"
              >
                {r.nombre}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};

interface InputAutocompletarChoferProps {
  etiqueta: string;
  choferes: Usuario[];
  valorActualId: string | undefined;
  onSeleccionar: (id: string) => void;
  error?: string;
}

const InputAutocompletarChofer = ({
  etiqueta,
  choferes,
  valorActualId,
  onSeleccionar,
  error,
}: InputAutocompletarChoferProps) => {
  const [textoInput, setTextoInput] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const choferActual = choferes.find((c) => c.idUsuario === valorActualId);
  const textoFormateado = choferActual ? `${choferActual.nombre} ${choferActual.apellido} (Lic: ${choferActual.nroLicencia})` : '';
  const busqueda = textoInput !== null ? textoInput : textoFormateado;

  const choferesFiltrados = choferes.filter((c) => {
    const query = busqueda.toLowerCase().trim();
    const nombreCompleto = `${c.nombre} ${c.apellido} ${c.nroLicencia}`.toLowerCase();
    return nombreCompleto.includes(query);
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col gap-1" ref={contenedorRef}>
      <label className="text-sm font-medium text-slate-700">{etiqueta}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Escriba para buscar chofer o licencia..."
          value={busqueda}
          onChange={(e) => {
            setTextoInput(e.target.value);
            setAbierto(true);
            if (!e.target.value) onSeleccionar('');
          }}
          onFocus={() => setAbierto(true)}
          className="w-full text-sm pl-9 pr-8 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>

        {abierto && choferesFiltrados.length > 0 && (
          <ul className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-52 overflow-y-auto text-sm divide-y divide-slate-100">
            {choferesFiltrados.map((c) => (
              <li
                key={c.idUsuario}
                onClick={() => {
                  onSeleccionar(c.idUsuario);
                  setTextoInput(null);
                  setAbierto(false);
                }}
                className="px-3 py-2.5 hover:bg-amber-50 cursor-pointer transition text-slate-700 text-xs"
              >
                <span className="font-semibold block text-slate-900">{c.nombre} {c.apellido}</span>
                <span className="text-slate-500">Licencia: {c.nroLicencia}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};

export default ViajeForm;