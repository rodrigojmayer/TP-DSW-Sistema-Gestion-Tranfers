import { useState, useEffect } from 'react';
import { buscarDireccionesOSM, type DireccionSugerida, type Coordenada } from '../../services/geoService';

interface Props {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (texto: string) => void;
  onSeleccionarCoordenada?: (coords: Coordenada) => void;
  error?: string;
}

export const InputAutocompleteGeo = ({
  label,
  placeholder,
  value,
  onChangeText,
  onSeleccionarCoordenada,
  error,
}: Props) => {
  const [sugerencias, setSugerencias] = useState<DireccionSugerida[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value && mostrarDropdown && value.length >= 3) {
        const resultados = await buscarDireccionesOSM(value);
        setSugerencias(resultados);
      } else {
        setSugerencias([]);
      }
    }, 400); 

    return () => clearTimeout(timer);
  }, [value, mostrarDropdown]);

  return (
    <div className="flex flex-col gap-1 relative">
      <label className="text-sm font-medium text-slate-700">{label}</label>

      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChangeText(e.target.value);
          setMostrarDropdown(true);
        }}
        onFocus={() => setMostrarDropdown(true)}
        placeholder={placeholder}
        className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
      />

      {mostrarDropdown && sugerencias.length > 0 && (
        <ul className="absolute z-50 top-[100%] left-0 w-full bg-white border border-slate-200 rounded-md mt-1 shadow-lg max-h-52 overflow-y-auto">
          {sugerencias.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                const nombreCorto = formatearDireccionCorta(item.nombre);
                onChangeText(nombreCorto);
                if (onSeleccionarCoordenada) {
                    onSeleccionarCoordenada(item.coords);
                }
                setMostrarDropdown(false);
              }}
              className="px-3 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-900 cursor-pointer transition-colors border-b last:border-b-0 border-slate-100"
            >
              {/* {item.nombre} */}
              {formatearDireccionCorta(item.nombre)}
            </li>
          ))}
        </ul>
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

const formatearDireccionCorta = (direccionLarga: string): string => {
  if (!direccionLarga) return '';

  const partes = direccionLarga.split(',').map((p) => p.trim());

  if (partes.length <= 2) return direccionLarga;

  const palabrasIgnorar = [
    'Distrito',
    'Municipio',
    'Gran',
    'Departamento',
    'Partido',
    'Provincia',
    'Argentina',
  ];

  const partesFiltradas = partes.filter(
    (parte) =>
      !/^\d{4,5}$/.test(parte) && 
      !/^S\d{4}/i.test(parte) && 
      !palabrasIgnorar.some((p) => parte.toLowerCase().includes(p.toLowerCase()))
  );

  const calleOAltura = partesFiltradas[0] || partes[0];
  const localidadOBarrio = partesFiltradas.length > 1 ? partesFiltradas[1] : partes[1];
  const ciudadPrincipal = partesFiltradas[partesFiltradas.length - 1] || '';

  if (calleOAltura.toLowerCase().includes(ciudadPrincipal.toLowerCase())) {
    return calleOAltura;
  }

  if (localidadOBarrio && !calleOAltura.toLowerCase().includes(localidadOBarrio.toLowerCase())) {
    return `${calleOAltura}, ${localidadOBarrio}, ${ciudadPrincipal}`;
  }

  return `${calleOAltura}, ${ciudadPrincipal}`;
};