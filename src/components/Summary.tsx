import { format } from "date-fns"
import { useState, useRef, useEffect } from "react"
import { Controller, useFieldArray } from "react-hook-form"
import { ImageIcon, FileText, Check, XCircle, User, ScanFace, Camera, X, Trash2 } from "lucide-react"
import { useStepForm } from "./FormContext"
import type { WhyNode } from "./FormContext"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (d?: Date) => (d ? format(d, "dd/MM/yyyy") : "—")

// cambiar cuando se tenga acceso a los servicios

const PLANTA_LABELS: Record<string, string> = { "planta-1": "Planta 1", "planta-2": "Planta 2" }
const AREA_LABELS: Record<string, string> = { "área-1": "Área 1", "área-2": "Área 2" }
const LINEA_LABELS: Record<string, string> = { "línea-1": "Línea 1", "línea-2": "Línea 2" }
const ESTADO_LABELS: Record<string, string> = { "en-proceso": "En proceso", "completado": "Completado" }
const ITEM_LABELS: Record<string, string> = {
    lup: "LUP", poev: "POEV", "capacitación": "CAPACITACIÓN",
    "check-list DOC. SGI": "CHECK LIST", "doc-sgi": "DOC. SGI",
    rdm: "RDM", "plan-de-mantenimiento": "PLAN DE MANTENIMIENTO",
}
const lbl = (map: Record<string, string>, v: string) => map[v] ?? v

// ─── why layout helpers ───────────────────────────────────────────────────

const WHY_CELL_W = 200
const WHY_CELL_H = 190
const WHY_CARD_W = 176
const WHY_CARD_H = 150

const whyMaxCol = (nodes: WhyNode[]) =>
    nodes.filter(n => n.kind === 'why').reduce((m, n) => Math.max(m, n.col), 0)

const whyRootCol = (nodes: WhyNode[]) => whyMaxCol(nodes) + 1

const buildWhyLabel = (nodes: WhyNode[], node: WhyNode): string => {
    const parent = node.parentId ? nodes.find(n => n.id === node.parentId) : null
    if (!parent || parent.kind === 'cv') {
        const branches = nodes
            .filter(n => n.kind === 'why' && n.parentId === (parent?.id ?? null))
            .sort((a, b) => a.row - b.row)
        return `${branches.indexOf(node) + 1}.1`
    }
    const parentLabel = buildWhyLabel(nodes, parent)
    if (node.row === parent.row) {
        const parts = parentLabel.split('.')
        return [...parts.slice(0, -1), parseInt(parts[parts.length - 1]) + 1].join('.')
    } else {
        const siblings = nodes
            .filter(n => n.kind === 'why' && n.parentId === parent.id && n.row !== parent.row)
            .sort((a, b) => a.row - b.row)
        return `${parentLabel}.${siblings.indexOf(node) + 1}`
    }
}

function WhySvgConnections({ nodes, cvRow, totalCols, totalRows }: {
    nodes: WhyNode[]
    cvRow: number
    totalCols: number
    totalRows: number
}) {
    const svgW = totalCols * WHY_CELL_W + WHY_CELL_W
    const svgH = (totalRows + 1) * WHY_CELL_H
    const cx = (col: number) => col * WHY_CELL_W + WHY_CARD_W / 2
    const cy = (row: number) => row * WHY_CELL_H + WHY_CARD_H / 2
    const paths: React.ReactNode[] = []

    nodes.forEach(node => {
        if (node.kind === 'cv') return

        if (node.kind === 'why') {
            const src = node.parentId
                ? nodes.find(n => n.id === node.parentId)
                : nodes.find(n => n.kind === 'cv')
            if (!src) return
            const x1 = cx(src.col)
            const y1 = src.kind === 'cv' ? cy(cvRow) : cy(src.row)
            const x2 = cx(node.col)
            const y2 = cy(node.row)
            const d = y1 === y2
                ? `M ${x1},${y1} L ${x2},${y2}`
                : `M ${x1},${y1} L ${x1},${y2} L ${x2},${y2}`
            paths.push(<path key={`${src.id}-${node.id}`} d={d} stroke="#D1D5DB" strokeWidth="2" fill="none" strokeLinecap="round" />)
        }

        if (node.kind === 'root') {
            const why = nodes.find(n => n.id === node.parentId)
            if (!why) return
            const x1 = cx(why.col), y1 = cy(why.row)
            const x2 = cx(node.col), y2 = cy(node.row)
            const d = y1 === y2
                ? `M ${x1},${y1} L ${x2},${y2}`
                : `M ${x1},${y1} L ${x2},${y1} L ${x2},${y2}`
            paths.push(<path key={`root-${node.id}`} d={d} stroke="#D1D5DB" strokeWidth="2" fill="none" strokeLinecap="round" />)
        }
    })

    return (
        <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
            width={svgW} height={svgH} overflow="visible">
            {paths}
        </svg>
    )
}

// ─── sub-components ──────────────────────────────────────────────────────────

const SectionCard = ({ number, title, children }: {
    number: number
    title: string
    children: React.ReactNode
}) => (
    <div className="card px-6 py-5 flex flex-col gap-5">
        <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-primary-100)] text-white font-bold text-sm flex-shrink-0">
                {number}
            </div>
            <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        </div>
        {children}
    </div>
)

const Field = ({ label, value }: { label: string; value?: string | React.ReactNode }) => (
    <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
        <div className="text-sm font-semibold text-gray-800 break-words">{value || "—"}</div>
    </div>
)

const CVCard = ({ text }: { text: string }) => (
    <div className="w-44 h-[150px] p-3 rounded-xl border-2 border-red-300 bg-red-50 flex flex-col gap-2 flex-shrink-0 overflow-y-auto">
        <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold self-start whitespace-nowrap">
            Causa validada
        </span>
        <p className="text-xs text-gray-800 leading-relaxed">{text}</p>
    </div>
)

const WhyCard = ({ label, text, isRootCause }: { label: string; text: string; isRootCause: boolean }) => {
    if (isRootCause) {
        return (
            <div className="w-44 h-[150px] p-3 rounded-xl border-2 border-red-300 bg-red-50 flex flex-col gap-2 flex-shrink-0 overflow-y-auto">
                <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-full self-start">
                    <Check className="w-3 h-3 flex-shrink-0" />
                    <span className="text-[10px] font-semibold whitespace-nowrap">Causa Raíz</span>
                </div>
                <p className="text-xs text-gray-800 leading-relaxed">{text}</p>
            </div>
        )
    }
    return (
        <div className="w-44 h-[150px] p-3 rounded-xl border border-red-200 bg-white flex flex-col gap-2 flex-shrink-0 overflow-y-auto">
            <div className="w-6 h-6 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {label}
            </div>
            <p className="text-xs text-gray-800 leading-relaxed">{text}</p>
        </div>
    )
}

// ─── facial recognition modal ────────────────────────────────────────────────

const FaceRecognitionModal = ({ onCapture, onClose }: {
    onCapture: (photoUrl: string) => void
    onClose: () => void
}) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const [captured, setCaptured] = useState<string | null>(null)
    const [cameraError, setCameraError] = useState(false)
    const [scanning, setScanning] = useState(false)

    useEffect(() => {
        startCamera()
        return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
    }, [])

    const startCamera = async () => {
        setCameraError(false)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
            streamRef.current = stream
            if (videoRef.current) videoRef.current.srcObject = stream
        } catch {
            setCameraError(true)
        }
    }

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return
        setScanning(true)
        setTimeout(() => {
            const video = videoRef.current!
            const canvas = canvasRef.current!
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            canvas.getContext("2d")?.drawImage(video, 0, 0)
            setCaptured(canvas.toDataURL("image/jpeg", 0.8))
            streamRef.current?.getTracks().forEach(t => t.stop())
            setScanning(false)
        }, 800)
    }

    const handleRetry = () => { setCaptured(null); startCamera() }

    const handleClose = () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[420px] flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ScanFace className="w-5 h-5 text-[var(--color-primary-100)]" />
                        <span className="font-bold text-gray-800">Reconocimiento Facial</span>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
                    {cameraError ? (
                        <div className="flex flex-col items-center gap-2 text-gray-400 p-6 text-center">
                            <ScanFace className="w-14 h-14" />
                            <p className="text-sm">No se pudo acceder a la cámara</p>
                        </div>
                    ) : captured ? (
                        <img src={captured} alt="foto capturada" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 420 236">
                                <ellipse cx="210" cy="118" rx="90" ry="108" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 4" opacity="0.7" />
                            </svg>
                            {scanning ? (
                                <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                                    <span className="text-white text-sm animate-pulse">Escaneando...</span>
                                </div>
                            ) : (
                                <span className="absolute bottom-3 left-0 right-0 text-center text-white/70 text-xs">
                                    Posicione su rostro dentro del óvalo
                                </span>
                            )}
                        </>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex justify-end gap-3">
                    {captured ? (
                        <>
                            <button onClick={handleRetry} className="btn btn-secondary">Reintentar</button>
                            <button onClick={() => { onCapture(captured!); handleClose() }} className="btn btn-primary">Confirmar</button>
                        </>
                    ) : (
                        !cameraError && (
                            <button onClick={handleCapture} disabled={scanning}
                                className="btn btn-primary flex items-center gap-2 disabled:opacity-60">
                                <Camera className="w-4 h-4" />
                                Capturar
                            </button>
                        )
                    )}
                    <button onClick={handleClose} className="btn btn-secondary">Cancelar</button>
                </div>
            </div>
        </div>
    )
}

// ─── main ────────────────────────────────────────────────────────────────────

export const Summary = () => {
    const f1 = useStepForm(1).watch()
    const f2 = useStepForm(2).watch()
    const f3 = useStepForm(3).watch()
    const f4 = useStepForm(4).watch()
    const f5 = useStepForm(5).watch()
    const f6 = useStepForm(6).watch()
    const f7 = useStepForm(7).watch()

    // ── Step 8: Aprobación ────────────────────────────────────────────────────
    const form8 = useStepForm(8)
    const { control: ctrl8 } = form8
    const { fields: aprobFields, append: aprobAppend, remove: aprobRemove } = useFieldArray({ control: ctrl8, name: "participantes" })
    const [scanIdx, setScanIdx] = useState<number | null>(null)

    return (
        <div className="flex flex-col px-10 pb-4 gap-5">
                <h3 className="font-bold text-gray-900 text-base text-center"> Resumen & Aprobación </h3>


            {/* ── 1. Antecedentes Generales ──────────────────────────────── */}
            <SectionCard number={1} title="Antecedentes Generales">
                <div className="flex gap-8">
                    {/* bloque izquierda */}
                    <div className="flex flex-col gap-4 flex-1 min-w-0">
                        {/* fila 1 */}
                        <div className="flex gap-6 flex-wrap">
                            <Field label="Planta/TDR" value={lbl(PLANTA_LABELS, f1.plantaTDR)} />
                            <Field label="Área" value={lbl(AREA_LABELS, f1.area)} />
                            <Field label="Línea" value={lbl(LINEA_LABELS, f1.linea)} />
                            <Field label="Equipo (CC)" value={f1.equipoCC} />
                            <Field label="Código" value={f1.codigo} />
                        </div>

                        {/* fila 2 */}
                        <div className="flex gap-6 flex-wrap">
                            <Field label="Nº Desvío" value={f1.nroDesvio} />
                            <Field label="Nº.ST" value={f1.nroST} />
                            <Field label="Nº.OM /OB" value={f1.nroOmOb} />
                            <Field label="Nº Casos (SO)" value={f1.nroCasosSO} />
                            <Field label="Fecha" value={fmt(f1.fecha)} />
                        </div>

                        {/* Práctica */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-[var(--color-text-muted)]">Práctica</span>
                            {f1.practica.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {f1.practica.map(p => (
                                        <span key={p} className="bg-red-100 text-red-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            ) : <span className="text-sm font-semibold text-gray-800">—</span>}
                        </div>

                        {/* Modo de falla */}
                        {f1.modoDeFalla.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs text-[var(--color-text-muted)]">Modo de falla</span>
                                <div className="flex flex-col gap-1">
                                    {f1.modoDeFalla.map(m => (
                                        <span key={m} className="text-sm font-semibold text-gray-800">{m}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Evidencia del problema */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-[var(--color-text-muted)]">Evidencia del problema</span>
                            {f1.evidencias.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {f1.evidencias.map((img, i) => (
                                        <div key={i} className="flex items-center gap-1.5 border border-red-200 rounded-md px-2 py-1 bg-red-50">
                                            <ImageIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            <span className="text-xs text-gray-600 max-w-[120px] truncate">{img.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <span className="text-sm font-semibold text-gray-800">—</span>}
                        </div>
                    </div>

                    {/* Acciones inmediatas */}
                    <div className="flex flex-col flex-1 gap-2 min-w-[260px]">
                        <span className="text-xs text-[var(--color-text-muted)]">Acciones inmediatas</span>
                        <div className="flex flex-col gap-2.5">
                            {f1.accionesInmediatas.map((accion, i) =>
                                accion ? (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <span className="flex items-center justify-center min-w-6 h-6 rounded-md bg-red-100 text-red-500 text-xs font-semibold flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-gray-800">{accion}</span>
                                    </div>
                                ) : null
                            )}
                        </div>
                    </div>
                </div>
            </SectionCard>

            {/* ── 2. Definición problemas (5W+1H) ───────────────────────── */}
            <SectionCard number={2} title="Definición problemas (5W+1H)">
                <div className="flex gap-10">
                    {/* campos 5W+1H  */}
                    <div className="flex flex-col gap-3 flex-1">
                        <Field label="¿Qué problema es?" value={f2.queProblema} />
                        <Field label="¿Dónde ocurrió?" value={f2.dondeOcurrio} />
                        <Field label="¿A quién le ocurrió?" value={f2.aQuienOcurrio} />
                        <Field label="¿Cuándo ocurrió?" value={f2.cuandoOcurrio} />
                        <Field label="¿Cuál es la tendencia?" value={f2.cualTendencia} />
                        <Field label="¿Cuán grande es?" value={f2.cuanGrande} />
                    </div>

                    {/* descripción */}
                    <div className="flex flex-col flex-1 gap-1.5 w-72">
                        <span className="text-xs text-[var(--color-text-muted)]">Descripción del problema</span>
                        <div className="border border-gray-200 rounded-lg p-3 text-sm text-gray-800 min-h-[90px] bg-gray-50 leading-relaxed">
                            {f2.descripcion || "—"}
                        </div>
                    </div>
                </div>
            </SectionCard>

            {/* ── 3. Posibles causas ─────────────────────────────────────── */}
            <SectionCard number={3} title="Posibles causas (lluvia de ideas)">
                {f3.causas.some(c => c.descripcion) ? (
                    <div className="flex flex-col gap-1.5">
                        {/* Header */}
                        <div className="grid grid-cols-[40px_1fr_180px_80px] gap-3 text-xs text-[var(--color-text-muted)] px-2 pb-1">
                            <div className="text-center">#</div>
                            <div>Causa</div>
                            <div>Clasificación</div>
                            <div className="text-center">Verificada</div>
                        </div>
                        {/* Filas */}
                        {f3.causas.map((causa, i) => causa.descripcion ? (
                            <div key={i} className="grid grid-cols-[40px_1fr_180px_80px] gap-3 items-center bg-gray-50 rounded-lg px-2 py-2.5">
                                <div className="flex justify-center">
                                    <div className="w-7 h-7 rounded-full bg-red-100 text-red-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                        {i + 1}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-800">{causa.descripcion}</span>
                                <div>
                                    {causa.clasificacion ? (
                                        <span className="text-xs font-semibold bg-red-100 text-red-500 px-2.5 py-1 rounded-full">
                                            {causa.clasificacion}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-400">—</span>
                                    )}
                                </div>
                                <div className="flex justify-center">
                                    {causa.verificado ? (
                                        <Check className="w-5 h-5 text-gray-600" strokeWidth={2.5} />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-400" />
                                    )}
                                </div>
                            </div>
                        ) : null)}
                    </div>
                ) : <span className="text-sm text-gray-400">—</span>}
            </SectionCard>

            {/* ── 4. 5 Por qué ──────────────────────────────────────────── */}
            <SectionCard number={4} title="5 por qué">
                {f4.sections.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        {f4.sections.map(section => {
                            const nodes = section.nodes
                            const maxRow = Math.max(...nodes.map(n => n.row))
                            const totalCols = whyRootCol(nodes) + 2
                            const totalRows = maxRow + 1
                            const svgH = (totalRows + 1) * WHY_CELL_H
                            const svgW = totalCols * WHY_CELL_W + 40
                            const cv = nodes.find(n => n.kind === 'cv')
                            const cvScreenRow = Math.floor(maxRow / 2)

                            return (
                                <div key={section.id} className="flex flex-col gap-2">
                                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md self-start">
                                        {section.causaValidada}
                                    </span>
                                    <div className="overflow-auto">
                                        <div style={{ position: 'relative', width: svgW, height: svgH, minWidth: '100%' }}>
                                            <WhySvgConnections
                                                nodes={nodes}
                                                cvRow={cvScreenRow}
                                                totalCols={totalCols}
                                                totalRows={totalRows}
                                            />

                                            {/* CV Card */}
                                            {cv && (
                                                <div style={{ position: 'absolute', left: cv.col * WHY_CELL_W, top: cvScreenRow * WHY_CELL_H }}>
                                                    <CVCard text={section.causaValidada} />
                                                </div>
                                            )}

                                            {/* Why Cards */}
                                            {nodes.filter(n => n.kind === 'why' && n.text).map(node => (
                                                <div key={node.id} style={{ position: 'absolute', left: node.col * WHY_CELL_W, top: node.row * WHY_CELL_H }}>
                                                    <WhyCard
                                                        label={buildWhyLabel(nodes, node)}
                                                        text={node.text}
                                                        isRootCause={node.isRootCause}
                                                    />
                                                </div>
                                            ))}

                                            {/* Causa Raíz Cards */}
                                            {nodes.filter(n => n.kind === 'root').map(node => {
                                                const whyParent = nodes.find(n => n.id === node.parentId)
                                                return (
                                                    <div key={node.id} style={{ position: 'absolute', left: node.col * WHY_CELL_W, top: node.row * WHY_CELL_H }}>
                                                        <WhyCard
                                                            label=""
                                                            text={whyParent?.text ?? node.text}
                                                            isRootCause={true}
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : <span className="text-sm text-gray-400">—</span>}
            </SectionCard>

            {/* ── 5. Árbol causal ───────────────────────────────────────── */}
            <SectionCard number={5} title="Árbol causal">
                <div className="flex gap-6">
                    {/* Hechos */}
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <span className="text-xs text-[var(--color-text-muted)]">Hechos</span>
                        {f5.hechos.some(h => h.value) ? (
                            <div className="flex flex-col gap-2">
                                {f5.hechos.filter(h => h.value).map((h, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-red-100 text-red-500 text-[10px] font-semibold flex-shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-gray-800 leading-snug">{h.value}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm text-gray-400">—</span>
                        )}
                    </div>

                    {/* Diagrama */}
                    <div className="flex-1 min-w-0">
                        {f5.diagrama ? (
                            f5.diagrama.type.startsWith("image/") ? (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={f5.diagrama.src}
                                        alt={f5.diagrama.name}
                                        className="w-full object-contain max-h-80"
                                    />
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-xs text-gray-600 truncate">{f5.diagrama.name}</span>
                                    </div>
                                    <iframe
                                        src={f5.diagrama.src}
                                        title={f5.diagrama.name}
                                        className="w-full h-80"
                                    />
                                </div>
                            )
                        ) : (
                            <div className="border border-gray-200 rounded-lg flex items-center justify-center h-32 text-sm text-gray-400 bg-gray-50">
                                Sin diagrama
                            </div>
                        )}
                    </div>
                </div>
            </SectionCard>

            {/* ── 6. Planes de acción ───────────────────────────────────── */}
            <SectionCard number={6} title="Planes de acción">
                {f6.acciones.some(a => a.Que || a.Como) ? (
                    <div className="flex flex-col gap-3">
                        {f6.acciones.filter(a => a.Que || a.Como).map((accion, i) => (
                            <div key={i} className="border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-3">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                                        Acción {i + 1}
                                    </span>
                                    {accion.Estado && (
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${accion.Estado === 'completado'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-red-100 text-red-500'
                                            }`}>
                                            {lbl(ESTADO_LABELS, accion.Estado)}
                                        </span>
                                    )}
                                </div>

                                {/* ¿Qué? */}
                                {accion.Que && (
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-[var(--color-text-muted)]">¿Qué? (Causa Raíz)</span>
                                        <span className="text-sm text-gray-800">{accion.Que}</span>
                                    </div>
                                )}

                                {/* ¿Cómo? */}
                                {accion.Como && (
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-[var(--color-text-muted)]">¿Cómo? (Acción Correctiva)</span>
                                        <span className="text-sm text-gray-800">{accion.Como}</span>
                                    </div>
                                )}

                                {/* Footer */}
                                {(accion.Quien || accion.Cuando) && (
                                    <div className="flex items-center gap-5 pt-1 border-t border-gray-100 text-sm text-gray-800">
                                        {accion.Quien && (
                                            <span>
                                                <span className="text-xs text-[var(--color-text-muted)] mr-1">¿Quién?</span>
                                                {accion.Quien}
                                            </span>
                                        )}
                                        {accion.Cuando && (
                                            <span>
                                                <span className="text-xs text-[var(--color-text-muted)] mr-1">¿Cuándo?</span>
                                                {fmt(accion.Cuando)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : <span className="text-sm text-gray-400">—</span>}
            </SectionCard>

            {/* ── 7. Estandarización de mejoras ────────────────────────── */}
            <SectionCard number={7} title="Estandarización de mejoras">
                {f7.items.some(it => it.Item || it.Contenido) ? (
                    <div className="flex flex-col gap-1.5">
                        {/* Header */}
                        <div className="grid grid-cols-[40px_160px_100px_1fr_130px_100px_130px_90px] gap-3 text-xs text-[var(--color-text-muted)] px-2 pb-1">
                            <div className="text-center">#</div>
                            <div>Ítem</div>
                            <div>Código</div>
                            <div>Contenido</div>
                            <div>Responsable</div>
                            <div>Fecha</div>
                            <div>Estado</div>
                            <div className="text-center">Verificada</div>
                        </div>
                        {/* Filas */}
                        {f7.items.filter(it => it.Item || it.Contenido).map((item, i) => (
                            <div key={i} className="grid grid-cols-[40px_160px_100px_1fr_130px_100px_130px_90px] gap-3 items-center bg-gray-50 rounded-lg px-2 py-2.5">
                                {/* # */}
                                <div className="flex justify-center">
                                    <div className="w-7 h-7 rounded-full bg-red-100 text-red-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                        {i + 1}
                                    </div>
                                </div>
                                {/* Ítem */}
                                <div>
                                    {item.Item ? (
                                        <span className="text-xs font-semibold bg-red-100 text-red-500 px-2.5 py-1 rounded-full">
                                            {lbl(ITEM_LABELS, item.Item)}
                                        </span>
                                    ) : <span className="text-sm text-gray-400">—</span>}
                                </div>
                                {/* Código */}
                                <span className="text-sm text-gray-800 truncate">{item.Codigo || "—"}</span>
                                {/* Contenido */}
                                <span className="text-sm text-gray-800">{item.Contenido || "—"}</span>
                                {/* Responsable */}
                                <span className="text-sm text-gray-800 truncate">{item.Responsable || "—"}</span>
                                {/* Fecha */}
                                <span className="text-sm text-gray-800">{fmt(item.Cuando)}</span>
                                {/* Estado */}
                                <div>
                                    {item.Estado ? (
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${item.Estado === 'completado'
                                                ? 'border-green-300 bg-green-50 text-green-600'
                                                : 'border-red-300 bg-red-50 text-red-500'
                                            }`}>
                                            {lbl(ESTADO_LABELS, item.Estado)}
                                        </span>
                                    ) : <span className="text-sm text-gray-400">—</span>}
                                </div>
                                {/* Verificada (Expansible) */}
                                <div className="flex justify-center">
                                    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50">
                                        {item.Expansible
                                            ? <><Check className="w-3 h-3 text-gray-600" strokeWidth={2.5} /><span className="text-gray-700">Sí</span></>
                                            : <><XCircle className="w-3 h-3 text-red-400" /><span className="text-gray-500">NO</span></>
                                        }
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <span className="text-sm text-gray-400">—</span>}
            </SectionCard>

            {/* ── 8. Aprobación ─────────────────────────────────────────── */}
            <SectionCard number={8} title="Aprobación">
                <div className="flex flex-col gap-2">
                    {/* Header */}
                    <div className="grid grid-cols-[56px_1fr_1fr_168px_100px_48px] gap-4 text-xs text-[var(--color-text-muted)] px-2 pb-1 border-b border-gray-100">
                        <div className="text-center">Foto</div>
                        <div>Nombre</div>
                        <div>Rol</div>
                        <div className="text-center">Reconocimiento</div>
                        <div className="text-center">Participa</div>
                        <div />
                    </div>

                    {/* Filas */}
                    {aprobFields.map((field, index) => {
                        const fotoBD = form8.watch(`participantes.${index}.fotoBD`)
                        const fotoEscaneada = form8.watch(`participantes.${index}.fotoEscaneada`)
                        return (
                            <div key={field.id} className="grid grid-cols-[56px_1fr_1fr_168px_100px_48px] gap-4 items-center px-2 py-2 border-b border-gray-50 last:border-0">

                                {/* Foto */}
                                <div className="flex justify-center">
                                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        {fotoBD
                                            ? <img src={fotoBD} alt="foto BD" className="w-full h-full object-cover" />
                                            : <User className="w-5 h-5 text-gray-400" />
                                        }
                                        {/* Indicador: escaneo confirmado */}
                                        {fotoEscaneada && (
                                            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                                                <Check className="w-2 h-2 text-white" strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Nombre */}
                                <Controller name={`participantes.${index}.nombre`} control={ctrl8}
                                    render={({ field: f }) => (
                                        <input {...f} placeholder="Nombre"
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                                    )} />

                                {/* Rol */}
                                <Controller name={`participantes.${index}.rol`} control={ctrl8}
                                    render={({ field: f }) => (
                                        <input {...f} placeholder="Rol"
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                                    )} />

                                {/* Botón Reconocimiento Facial */}
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setScanIdx(index)}
                                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${fotoEscaneada
                                                ? "border-green-300 text-green-600 bg-green-50 hover:bg-green-100"
                                                : "border-[var(--color-primary-100)] text-[var(--color-primary-100)] hover:bg-red-50"
                                            }`}
                                    >
                                        <ScanFace className="w-4 h-4 flex-shrink-0" />
                                        {fotoEscaneada ? "Verificado" : "Escanear"}
                                    </button>
                                </div>

                                {/* Participa */}
                                <div className="flex justify-center">
                                    <Controller name={`participantes.${index}.participa`} control={ctrl8}
                                        render={({ field: f }) => (
                                            <Switch checked={f.value} onCheckedChange={f.onChange}
                                                className="data-[state=checked]:bg-red-500" />
                                        )} />
                                </div>

                                {/* Eliminar */}
                                <div className="flex justify-center">
                                    <button onClick={() => aprobRemove(index)}
                                        className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}

                    <Button variant="outline" size="sm"
                        className="self-start text-[var(--color-primary-100)] border-gray-300 rounded-xl hover:text-[var(--color-primary-100)] mt-2"
                        onClick={() => aprobAppend({ fotoBD: null, fotoEscaneada: null, nombre: "", rol: "", participa: true })}>
                        Agregar Participante
                    </Button>
                </div>
            </SectionCard>

            {/* Modal reconocimiento facial */}
            {scanIdx !== null && (
                <FaceRecognitionModal
                    onCapture={(url) => form8.setValue(`participantes.${scanIdx}.fotoEscaneada`, url)}
                    onClose={() => setScanIdx(null)}
                />
            )}

        </div>
    )
}
