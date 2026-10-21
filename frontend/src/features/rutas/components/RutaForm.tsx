import { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rutaSchema, type RutaFormData } from '../schemas/rutaSchema';
import { rutaService } from '../api/rutaService';
import { puntoService } from '../../puntos/api/puntoService';
import type { Ruta, Punto } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Search, ChevronDown } from 'lucide-react';

interface RutaFormProps {
  rutaAEditar: Ruta | null;
  onCancelEdit: () => void;
  onSuccess: () => void;
}

export const RutaForm = ({
  rutaAEditar,
  onSuccess,
}: RutaFormProps) => {
  const [catalogoPuntos, setCatalogoPuntos] = useState<Punto[]>([]);
  const [cargandoPuntos, setCargandoPuntos] = useState(true);

  useEffect(() => {
    const obtenerCatalogo = async () => {
      try {
        const datos = await puntoService.obtenerTodos();
        setCatalogoPuntos(Array.isArray(datos) ? datos : []);
      } catch (error) {
        console.error('Error al cargar catálogo de puntos:', error);
      } finally {
        setCargandoPuntos(false);
      }
    };
    obtenerCatalogo();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RutaFormData>({
    resolver: zodResolver(rutaSchema) as unknown as Resolver<RutaFormData>,
    defaultValues: {
      nombre: '',
      puntos: [
        { idPunto: '', orden: 1 },
        { idPunto: '', orden: 2 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'puntos',
  });

  const puntosWatch = watch('puntos');

  useEffect(() => {
    if (rutaAEditar) {
      interface ObjetoPunto {
        idPunto?: string;
        id?: string;
      }

      interface ParadaBackend {
        orden?: number;
        idPunto?: string;
        puntoId?: string;
        id_punto?: string;
        id?: string;
        punto?: string | ObjetoPunto;
      }

      const rutaExt = rutaAEditar as Ruta & {
        puntosRuta?: ParadaBackend[];
        origen?: string | ObjetoPunto;
        destino?: string | ObjetoPunto;
      };

      let listaPuntos: ParadaBackend[] = rutaExt.puntos || rutaExt.puntosRuta || [];

      if (listaPuntos.length === 0 && (rutaExt.origen || rutaExt.destino)) {
        listaPuntos = [
          ...(rutaExt.origen ? [{ punto: rutaExt.origen, orden: 1 }] : []),
          ...(rutaExt.destino ? [{ punto: rutaExt.destino, orden: 2 }] : []),
        ];
      }

      const ordenados = [...listaPuntos].sort(
        (a: ParadaBackend, b: ParadaBackend) => (a.orden ?? 0) - (b.orden ?? 0)
      );

      const puntosFormateados = ordenados.map((p: ParadaBackend, index: number) => {
        const idPuntoExtraido = 
          typeof p.punto === 'object' && p.punto !== null
            ? p.punto.idPunto || p.punto.id || ''
            : '';

        const idEncontrado =
          p.idPunto ||
          p.puntoId ||
          p.id_punto ||
          p.id ||
          idPuntoExtraido;

        return {
          idPunto: idEncontrado,
          orden: p.orden ?? index + 1,
        };
      });

      reset({
        nombre: rutaAEditar.nombre || '',
        puntos:
          puntosFormateados.length > 0
            ? puntosFormateados
            : [
                { idPunto: '', orden: 1 },
                { idPunto: '', orden: 2 },
              ],
      });
    } else {
      reset({
        nombre: '',
        puntos: [
          { idPunto: '', orden: 1 },
          { idPunto: '', orden: 2 },
        ],
      });
    }
  }, [rutaAEditar, reset]);

  const onSubmit = async (data: RutaFormData) => {
    const datosConOrden = {
      ...data,
      puntos: data.puntos.map((item, index) => ({
        idPunto: item.idPunto,
        orden: index + 1,
      })),
    };

    if (rutaAEditar) {
      await rutaService.actualizar(rutaAEditar.idRuta, datosConOrden);
    } else {
      await rutaService.crear(datosConOrden);
    }
    reset();
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nombre de la Ruta"
        placeholder="Ej: Buenos Aires - Rosario"
        error={errors.nombre?.message}
        {...register('nombre')}
      />

      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-700">
            Paradas ({fields.length})
          </label>
          {fields.length < 10 && (
            <button
              type="button"
              onClick={() => append({ idPunto: '', orden: fields.length + 1 })}
              className="text-xs font-medium text-amber-600 hover:text-amber-700 transition cursor-pointer"
            >
              + Agregar Parada
            </button>
          )}
        </div>

        {cargandoPuntos ? (
          <p className="text-xs text-slate-400">Cargando puntos...</p>
        ) : (
          fields.map((field, index) => {
            const isOrigen = index === 0;
            const isDestino = index === fields.length - 1;

            let etiqueta = `Parada #${index + 1}`;
            if (isOrigen) etiqueta = '1. Origen';
            else if (isDestino) etiqueta = `${fields.length}. Destino`;

            return (
              <InputAutocompletarPunto
                key={field.id}
                index={index}
                etiqueta={etiqueta}
                catalogoPuntos={catalogoPuntos}
                valorActualId={puntosWatch?.[index]?.idPunto || ''}
                onSeleccionar={(idPuntoSeleccionado) => {
                  setValue(`puntos.${index}.idPunto`, idPuntoSeleccionado, { shouldValidate: true });
                }}
                onEliminar={fields.length > 2 ? () => remove(index) : undefined}
                error={errors.puntos?.[index]?.idPunto?.message}
              />
            );
          })
        )}
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        {rutaAEditar ? 'Guardar Cambios' : 'Crear Ruta'}
      </Button>
    </form>
  );
};

interface InputAutocompletarProps {
  index: number;
  etiqueta: string;
  catalogoPuntos: Punto[];
  valorActualId: string;
  onSeleccionar: (idPunto: string) => void;
  onEliminar?: () => void;
  error?: string;
}

const InputAutocompletarPunto = ({
  etiqueta,
  catalogoPuntos,
  valorActualId,
  onSeleccionar,
  onEliminar,
  error,
}: InputAutocompletarProps) => {
  const [textoInput, setTextoInput] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const puntoActual = catalogoPuntos.find(
    (p) => (p.idPunto || p.id) === valorActualId
  );

  const textoFormateado = puntoActual
    ? (puntoActual.nombre && puntoActual.direccion
        ? `${puntoActual.nombre} - ${puntoActual.direccion}`
        : puntoActual.nombre || puntoActual.direccion || '')
    : '';

  const busqueda = textoInput !== null ? textoInput : textoFormateado;

  const puntosFiltrados = catalogoPuntos.filter((p) => {
    const query = busqueda.toLowerCase().trim();
    const nombre = p.nombre?.toLowerCase() || '';
    const direccion = p.direccion?.toLowerCase() || '';
    return nombre.includes(query) || direccion.includes(query);
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
    <div className="relative flex items-start gap-2 bg-slate-50 p-3 rounded-md border border-slate-200" ref={contenedorRef}>
      <div className="flex-1">
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {etiqueta}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Escriba para buscar punto o dirección..."
            value={busqueda}
            onChange={(e) => {
              setTextoInput(e.target.value);
              setAbierto(true);
              if (!e.target.value) {
                onSeleccionar('');
              }
            }}
            onFocus={() => setAbierto(true)}
            className="w-full text-sm pl-9 pr-8 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>

          {abierto && puntosFiltrados.length > 0 && (
            <ul className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-52 overflow-y-auto text-sm divide-y divide-slate-100 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
              {puntosFiltrados.map((punto) => {
                const idPuntoReal = punto.idPunto || punto.id || '';

                return (
                  <li
                    key={idPuntoReal}
                    onClick={() => {
                      onSeleccionar(idPuntoReal);
                      setTextoInput(null); 
                      setAbierto(false);
                    }}
                    className="px-3 py-2.5 hover:bg-amber-50 cursor-pointer transition text-slate-700 text-xs"
                  >
                    <span className="font-semibold block text-slate-900">{punto.nombre || 'Punto'}</span>
                    <span className="text-slate-500">{punto.direccion}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {onEliminar && (
        <button
          type="button"
          onClick={onEliminar}
          className="mt-6 p-2 text-slate-400 hover:text-red-600 transition cursor-pointer"
          title="Eliminar parada"
        >
          🗑️
        </button>
      )}
    </div>
  );
};

export default RutaForm;