"use client";
import { useEffect, useState } from "react";
import { MapPin, NavigationArrow, Recycle, Leaf, Package, Drop, Trash } from "@phosphor-icons/react";
import MusicButton from "@/components/MusicButton";
import BottomNav from "@/components/BottomNav";

// ── Tipos ─────────────────────────────────────────────────────────────────
type Ecopunto = {
  name: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  accepts: string[];
  source: "osm" | "curated";
};

// ── Fallback curado Lima ──────────────────────────────────────────────────
const CURADOS: Ecopunto[] = [
  { name: "Ecopunto Miraflores – Parque Kennedy",  address: "Av. Larco s/n",          district: "Miraflores",       lat: -12.1191, lng: -77.0292, accepts: ["plastico","vidrio","metal","carton","papel"], source: "curated" },
  { name: "Ecopunto San Isidro – Centro Cívico",   address: "Av. Jorge Basadre 150",   district: "San Isidro",       lat: -12.0944, lng: -77.0456, accepts: ["plastico","vidrio","metal","carton","papel"], source: "curated" },
  { name: "Ecopunto Surco – Municipalidad",         address: "Av. Ayacucho 230",        district: "Santiago de Surco",lat: -12.1480, lng: -77.0008, accepts: ["plastico","vidrio","metal","carton","papel","organico"], source: "curated" },
  { name: "Ecopunto San Borja – Municipalidad",     address: "Av. San Borja Norte 722", district: "San Borja",        lat: -12.1006, lng: -77.0022, accepts: ["plastico","vidrio","metal","carton","papel"], source: "curated" },
  { name: "Ecopunto Barranco – Plaza de Armas",     address: "Jr. Lima 301",            district: "Barranco",         lat: -12.1458, lng: -77.0215, accepts: ["plastico","vidrio","metal","carton"],          source: "curated" },
  { name: "Ecopunto La Molina – Municipalidad",     address: "Av. La Fontana 690",      district: "La Molina",        lat: -12.0833, lng: -76.9438, accepts: ["plastico","vidrio","metal","carton"],          source: "curated" },
  { name: "Ecopunto Magdalena – Parque Castilla",   address: "Av. Brasil s/n",          district: "Magdalena del Mar",lat: -12.0922, lng: -77.0706, accepts: ["plastico","vidrio","metal"],                   source: "curated" },
  { name: "Wong Miraflores – contenedor reciclaje", address: "Av. Benavides 487",       district: "Miraflores",       lat: -12.1305, lng: -77.0144, accepts: ["plastico","vidrio","metal"],                   source: "curated" },
  { name: "Ecopunto Jesús María – Campo de Marte",  address: "Av. Cuba s/n",            district: "Jesús María",      lat: -12.0758, lng: -77.0453, accepts: ["plastico","vidrio","metal","carton"],          source: "curated" },
];

// ── Materiales ────────────────────────────────────────────────────────────
const M_LABEL: Record<string, string> = { plastico:"Plástico", vidrio:"Vidrio", metal:"Metal/Lata", carton:"Cartón", papel:"Papel", organico:"Orgánico" };
const M_COLOR: Record<string, string> = { plastico:"#1c7a4a", vidrio:"#1c7a4a", metal:"#1c7a4a", carton:"#9a6b2c", papel:"#9a6b2c", organico:"#2b2b2b" };
const M_ICON:  Record<string, React.ReactNode> = {
  plastico:<Drop size={10}/>, vidrio:<Drop size={10} weight="fill"/>,
  metal:<Package size={10}/>, carton:<Package size={10} weight="fill"/>,
  papel:<Leaf size={10}/>,    organico:<Leaf size={10} weight="fill"/>,
};

const TIPS = [
  { key:"plastico", text:"Enjuaga las botellas PET antes de llevarlas — el residuo de líquido contamina el lote y puede rechazarlo.",            icon:<Drop size={16}/> },
  { key:"vidrio",   text:"Los frascos de vidrio son 100% reciclables infinitas veces. Quítales la tapa metálica antes de depositarlos.",         icon:<Drop size={16} weight="fill"/> },
  { key:"metal",    text:"Aplasta las latas de aluminio para ahorrar espacio. El aluminio reciclado ahorra un 95% de energía.",                   icon:<Package size={16}/> },
  { key:"carton",   text:"Las cajas Tetra Pak van en el punto de cartón. Aplástales bien para reducir volumen.",                                  icon:<Package size={16} weight="fill"/> },
  { key:"organico", text:"Los restos orgánicos (cáscaras, verduras) pueden ir al compostaje doméstico o puntos de orgánicos de tu municipio.",   icon:<Leaf size={16}/> },
  { key:"general",  text:"Los empaques con interior metalizado (bolsas de snacks) no son reciclables — van a la bolsa negra de residuos.",       icon:<Trash size={16}/> },
];

// ── Helpers ───────────────────────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371, toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad, dLng = (lng2 - lng1) * toRad;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*toRad)*Math.cos(lat2*toRad)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function fmtDist(km: number) {
  return km < 1 ? `${Math.round(km*1000)} m` : `${km.toFixed(1)} km`;
}

async function fetchOSM(lat: number, lng: number): Promise<Ecopunto[]> {
  const query = `[out:json][timeout:10];
node["amenity"="recycling"](around:5000,${lat},${lng});
out body;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", { method:"POST", body:query });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.elements ?? [])
    .filter((el: Record<string,unknown>) => el.lat && el.lon)
    .map((el: Record<string,unknown>) => {
      const t = (el.tags ?? {}) as Record<string,string>;
      const accepts = (["plastico","vidrio","metal","carton"] as const).filter(m => {
        if (m==="plastico") return t["recycling:plastic"]==="yes" || t["recycling:plastic_bottles"]==="yes";
        if (m==="vidrio")   return t["recycling:glass"]==="yes"   || t["recycling:glass_bottles"]==="yes";
        if (m==="metal")    return t["recycling:cans"]==="yes"    || t["recycling:scrap_metal"]==="yes";
        if (m==="carton")   return t["recycling:paper"]==="yes"   || t["recycling:cardboard"]==="yes";
        return false;
      });
      return {
        name:     t.name || "Punto de reciclaje",
        address:  t["addr:street"] ? `${t["addr:street"]} ${t["addr:housenumber"]??""}`  .trim() : "",
        district: t["addr:suburb"] || t["addr:city"] || "",
        lat: el.lat as number, lng: el.lon as number,
        accepts: accepts.length > 0 ? accepts : ["plastico","vidrio","metal"],
        source: "osm" as const,
      };
    });
}

function pickTop3(list: (Ecopunto & {dist:number})[], mat: string|null) {
  const pool = mat ? list.filter(e => e.accepts.includes(mat)) : list;
  for (const r of [3, 4, 5, Infinity]) {
    const hits = pool.filter(e => e.dist <= r);
    if (hits.length) return hits.slice(0, 3);
  }
  return [];
}

// ── Componente ─────────────────────────────────────────────────────────────
export default function EcopuntosPage() {
  const [loc,     setLoc]     = useState<{lat:number;lng:number}|null>(null);
  const [locErr,  setLocErr]  = useState(false);
  const [points,  setPoints]  = useState<(Ecopunto&{dist:number})[]>([]);
  const [osm,     setOsm]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [mat,     setMat]     = useState<string|null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setLocErr(true),
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!loc) return;
    setLoading(true);
    fetchOSM(loc.lat, loc.lng)
      .then(osmPts => {
        const base = osmPts.length > 0 ? osmPts : CURADOS;
        setOsm(osmPts.length > 0);
        const withDist = base.map(e => ({ ...e, dist: haversine(loc.lat, loc.lng, e.lat, e.lng) }));
        withDist.sort((a,b) => a.dist - b.dist);
        setPoints(withDist);
      })
      .catch(() => {
        const withDist = CURADOS.map(e => ({ ...e, dist: haversine(loc.lat, loc.lng, e.lat, e.lng) }));
        withDist.sort((a,b) => a.dist - b.dist);
        setPoints(withDist);
      })
      .finally(() => setLoading(false));
  }, [loc]);

  // Sin ubicación: mostrar los 3 primeros curados sin distancia
  const shown = loc
    ? pickTop3(points, mat)
    : CURADOS.filter(e => !mat || e.accepts.includes(mat)).slice(0,3).map(e => ({ ...e, dist:0 }));

  const FILTERS = [
    {key:"plastico",label:"Plástico"},{key:"vidrio",label:"Vidrio"},
    {key:"metal",label:"Metal"},{key:"carton",label:"Cartón"},
  ];

  const Label = ({children}:{children:React.ReactNode}) => (
    <p style={{fontFamily:"var(--font-body)",fontSize:10,fontWeight:700,color:"var(--ink-3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>
      {children}
    </p>
  );

  return (
    <div style={{paddingBottom:96}}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-10 relative overflow-hidden px-5 pt-12 pb-12" style={{background:"var(--gradient-header)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
          <h1 style={{fontFamily:"var(--font-display)",fontSize:32,fontWeight:300,color:"#fff",letterSpacing:"-0.3px",lineHeight:1}}>
            Eco<em style={{fontStyle:"italic",color:"rgba(255,255,255,0.75)"}}>Puntos</em>
          </h1>
          <MusicButton />
        </div>
        <p style={{fontFamily:"var(--font-body)",fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:3,letterSpacing:"0.06em"}}>
          {loading       ? "Buscando puntos cercanos…"
          : loc          ? `Ordenados por distancia · ${osm ? "OpenStreetMap" : "lista curada Lima"}`
          : locErr       ? "Activa tu ubicación para ordenar"
          :                "Obteniendo ubicación…"}
        </p>
        <div className="flex gap-1.5 mt-4 overflow-x-auto pb-0.5" style={{scrollbarWidth:"none"}}>
          <button onClick={()=>setMat(null)}
            style={{flexShrink:0,fontFamily:"var(--font-body)",fontSize:11,fontWeight:600,padding:"5px 14px",borderRadius:99,border:"none",cursor:"pointer",
              color:mat===null?"var(--brand)":"rgba(255,255,255,0.7)",background:mat===null?"#fff":"rgba(255,255,255,0.13)"}}>
            Todos
          </button>
          {FILTERS.map(f=>(
            <button key={f.key} onClick={()=>setMat(mat===f.key?null:f.key)}
              style={{flexShrink:0,fontFamily:"var(--font-body)",fontSize:11,fontWeight:600,padding:"5px 14px",borderRadius:99,border:"none",cursor:"pointer",
                color:mat===f.key?"var(--brand)":"rgba(255,255,255,0.7)",background:mat===f.key?"#fff":"rgba(255,255,255,0.13)"}}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{position:"absolute",bottom:-2,left:0,right:0,height:28,background:"var(--bg)",borderRadius:"50% 50% 0 0 / 24px 24px 0 0"}}/>
      </div>

      <div style={{padding:"16px 16px 0"}}>

        {/* ══════════════════════════════
            SECCIÓN 1 – Ecopuntos cercanos
        ══════════════════════════════ */}
        <Label>Ecopuntos cercanos</Label>

        {loading ? (
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
            {[0,1,2].map(i=>(
              <div key={i} className="anim-card" style={{height:110,background:"var(--surface)",border:"1px solid var(--border-lo)",borderRadius:20,animationDelay:`${i*60}ms`,opacity:0.6}}/>
            ))}
          </div>
        ) : shown.length===0 ? (
          <div style={{textAlign:"center",paddingTop:32,paddingBottom:24}}>
            <Recycle size={32} style={{color:"var(--ink-3)",marginBottom:10}}/>
            <p style={{fontFamily:"var(--font-body)",fontSize:13,color:"var(--ink-3)"}}>Sin ecopuntos encontrados cerca de ti</p>
          </div>
        ) : (
          <div style={{marginBottom:24}}>
            {shown.map((e,i)=>(
              <div key={`${e.lat}-${e.lng}`} className="anim-card"
                style={{background:"var(--surface)",border:"1px solid var(--border-lo)",borderRadius:20,padding:16,marginBottom:10,boxShadow:"var(--shadow-card)",animationDelay:`${Math.min(i*40,200)}ms`}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <MapPin size={12} weight="fill" style={{color:"var(--brand)",flexShrink:0}}/>
                      <span style={{fontFamily:"var(--font-body)",fontWeight:700,fontSize:13,color:"var(--ink-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {e.name}
                      </span>
                    </div>
                    {(e.address||e.district) && (
                      <p style={{fontFamily:"var(--font-body)",fontSize:11,color:"var(--ink-3)",marginLeft:18}}>
                        {[e.address,e.district].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  {loc && e.dist>0 && (
                    <span style={{flexShrink:0,fontFamily:"var(--font-display)",fontSize:20,fontWeight:400,color:"var(--brand-mid)",lineHeight:1}}>
                      {fmtDist(e.dist)}
                    </span>
                  )}
                </div>
                {e.accepts.length>0 && (
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:10}}>
                    {[...new Set(e.accepts)].map(m=>(
                      <span key={m} style={{display:"flex",alignItems:"center",gap:4,fontFamily:"var(--font-body)",fontSize:10,fontWeight:600,
                        color:M_COLOR[m]||"var(--ink-3)",background:"var(--bg)",borderRadius:99,padding:"3px 8px",border:`1px solid ${(M_COLOR[m]||"#ccc")}33`}}>
                        {M_ICON[m]}{M_LABEL[m]||m}
                      </span>
                    ))}
                  </div>
                )}
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:10,paddingTop:10,borderTop:"1px solid var(--border-lo)",
                    fontFamily:"var(--font-body)",fontSize:11,fontWeight:700,color:"var(--brand)",textDecoration:"none"}}>
                  <NavigationArrow size={12} weight="fill"/> Cómo llegar
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════
            SECCIÓN 2 – Guía por material
        ══════════════════════════════ */}
        <Label>Guía por material</Label>
        {TIPS.map(t=>(
          <div key={t.key} style={{background:"var(--surface)",border:"1px solid var(--border-lo)",borderRadius:14,padding:"10px 12px",marginBottom:8,display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{width:28,height:28,borderRadius:8,background:"var(--brand-bg)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--brand)",flexShrink:0}}>
              {t.icon}
            </div>
            <p style={{fontFamily:"var(--font-body)",fontSize:12,color:"var(--ink-2)",lineHeight:1.5}}>{t.text}</p>
          </div>
        ))}

      </div>
      <BottomNav/>
    </div>
  );
}
