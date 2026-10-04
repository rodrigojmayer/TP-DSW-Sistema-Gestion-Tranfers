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
    }, 400); // Debounce de 400ms para cuidar el límite de solicitudes de OSM

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

  // 1. Separar la dirección por comas
  const partes = direccionLarga.split(',').map((p) => p.trim());

  // Si tiene pocos elementos, devolver tal cual
  if (partes.length <= 3) return direccionLarga;

  // 2. Extraer el Lugar/Lugar de interés + Calle y Altura (las primeras partes)
//   const lugarOCalle = partes[0];
//   const alturaOCalle = partes[1];

  // 3. Buscar la Localidad/Ciudad (habitualmente antes de la provincia o Departamento)
  // Palabras a ignorar que suelen ensuciar la dirección
  const palabrasIgnorar = [
    'Distrito',
    'Municipio',
    'Gran',
    'Departamento',
    'Partido',
    'Provincia',
    'Argentina',
    'S2000',
    'S2002',
  ];

  // Filtramos las partes eliminando códigos postales, países y regiones administrativas repetitivas
  const partesRelevantes = partes.filter(
    (parte) =>
      !/^\d{4,5}$/.test(parte) && // Códigos postales numéricos
      !/^S\d{4}/i.test(parte) && // Códigos postales tipo Argentina (S2002)
      !palabrasIgnorar.some((p) => parte.toLowerCase().includes(p.toLowerCase()))
  );

  // Reconstruimos prendiendo el lugar inicial y la ciudad final
  const primerTramo = partes[0];
  const segundoTramo = partes[1] && !partesRelevantes.includes(partes[1]) ? partes[1] : '';
  const ciudad = partesRelevantes[partesRelevantes.length - 1] || '';

  // Evitar duplicados si el primer tramo ya contiene la ciudad
  if (primerTramo.toLowerCase().includes(ciudad.toLowerCase())) {
    return segundoTramo ? `${primerTramo}, ${segundoTramo}` : primerTramo;
  }

  return `${primerTramo}${segundoTramo ? ', ' + segundoTramo : ''}, ${ciudad}`;
};