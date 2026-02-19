import { useState, useEffect, useRef } from 'react'
import { ArrowRight, ChevronDown, Check, X } from 'lucide-react'
import { useStepForm, useFormActions } from './FormContext'

const CELL_W = 200   // px por columna
const CELL_H = 190   // px por fila
const CARD_W = 176   // ancho visual de la card
const CARD_H = 150   // alto aproximado de la card 
const CV_COL  = 0    // columna de la Causa Validada
const WHY_COL = 1    // primera columna de "Por qués"

let _c = 0
const uid = () => `wy${++_c}`

/**
 * Cada nodo ocupa una celda (col, row) en la cuadrícula.
 * - col 0 → Causa Validada
 * - col 1..N → Por qués
 * - col N+1 → Causa Raíz
 */
type NodeKind = 'cv' | 'why' | 'root'

type GridNode = {
    id: string
    kind: NodeKind
    col: number   // columna 
    row: number   // fila 
    text: string
    isRootCause: boolean
    parentId: string | null  // id del nodo del que desciende (null para CV y primeros whys)
}

type Section = {
    id: string
    name: string
    nodes: GridNode[]
}


/**
 * Etiqueta visible de un why: "1.1", "1.2", "2.1", "1.1.1", …
 *
 * Reglas:
 * - Hijo directo de CV          → N.1  (N = posición de la rama entre hijos de CV)
 * - Hijo en la misma fila (→)   → mismo prefijo, último número +1  (ej: 1.1 → 1.2)
 * - Hijo en distinta fila (↓)   → label del padre + ".N"           (ej: 1.1 → 1.1.1)
 */
const buildLabel = (nodes: GridNode[], node: GridNode): string => {
    const parent = node.parentId ? nodes.find(n => n.id === node.parentId) : null

    if (!parent || parent.kind === 'cv') {
        // Rama directa desde CV: N.1
        const branches = nodes
            .filter(n => n.kind === 'why' && n.parentId === (parent?.id ?? null))
            .sort((a, b) => a.row - b.row)
        const branchIdx = branches.indexOf(node) + 1
        return `${branchIdx}.1`
    }

    const parentLabel = buildLabel(nodes, parent)

    if (node.row === parent.row) {
        // Mismo row → agregado a la derecha → incrementa último componente
        const parts = parentLabel.split('.')
        const lastPart = parseInt(parts[parts.length - 1]) + 1
        return [...parts.slice(0, -1), lastPart].join('.')
    } else {
        // Distinto row → agregado abajo → nuevo subnivel
        const verticalChildren = nodes
            .filter(n => n.kind === 'why' && n.parentId === parent.id && n.row !== parent.row)
            .sort((a, b) => a.row - b.row)
        const subIdx = verticalChildren.indexOf(node) + 1
        return `${parentLabel}.${subIdx}`
    }
}

/** Devuelve el máximo de columna "why" ocupada en una sección */
const maxWhyCol = (nodes: GridNode[]) =>
    nodes.filter(n => n.kind === 'why').reduce((m, n) => Math.max(m, n.col), WHY_COL - 1)

/** Columna donde aparece la Causa Raíz */
const rootCol = (nodes: GridNode[]) => maxWhyCol(nodes) + 1

function CausaValidadaCard({ name, onAddDown }: { name: string; onAddDown: () => void }) {
    return (
        <div className="flex flex-col bg-red-50 border border-red-200 rounded-xl w-44 p-3 gap-2">
            <span className="bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full self-start whitespace-nowrap">
                Causa validada
            </span>
            <p className="text-sm text-gray-800 leading-snug min-h-[3rem]">{name}</p>
            <button
                type="button"
                onClick={onAddDown}
                title="Agregar cadena de por qués abajo"
                className="self-center w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-400 transition-colors"
            >
                <ChevronDown className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}

function RootCauseCard({ text }: { text: string }) {
    return (
        <div className="flex flex-col bg-red-50 border border-red-300 rounded-xl w-44 p-3 gap-2">
            <span className="bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full self-start flex items-center gap-1 whitespace-nowrap">
                <Check className="w-2.5 h-2.5" />
                Causa Raíz
            </span>
            <p className="text-sm text-gray-800 leading-snug min-h-[3rem]">{text}</p>
        </div>
    )
}

type WhyCardProps = {
    label: string
    node: GridNode
    canAddRight: boolean
    canAddDown: boolean
    hasRightChild: boolean
    onText: (t: string) => void
    onAddRight: () => void
    onAddDown: () => void
    onToggleRoot: () => void
    onDelete: () => void
}

function WhyCard({
    label, node, canAddRight, canAddDown, hasRightChild,
    onText, onAddRight, onAddDown, onToggleRoot, onDelete,
}: WhyCardProps) {
    const empty = node.text.trim() === ''
    return (
        <div className={`flex flex-col rounded-xl w-44 p-3 gap-2 shadow-sm border bg-white ${node.isRootCause ? 'border-red-400' : 'border-gray-200'}`}>
            {/* Header */}
            <div className="flex items-center justify-between gap-1">
                <span className="min-w-[2rem] h-8 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center flex-shrink-0 px-1 text-center leading-tight">
                    {label}
                </span>
                <span className="text-[10px] text-gray-400 font-medium flex-1 text-center">¿Por qué?</span>
                <button type="button" onClick={onDelete} title="Eliminar"
                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Textarea */}
            <textarea
                value={node.text}
                onChange={e => onText(e.target.value)}
                placeholder="Escriba aquí..."
                rows={2}
                className="flex-1 text-xs resize-none outline-none text-gray-700 placeholder:text-gray-300 bg-transparent leading-relaxed"
            />

            {/* Botones */}
            <div className="flex items-center justify-around pt-1 border-t border-gray-100">
                {/* ↓ */}
                <button type="button" disabled={empty || !canAddDown} onClick={onAddDown}
                    title="Agregar por qué abajo"
                    className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronDown className="w-3 h-3" />
                </button>
                {/* → */}
                <button type="button" disabled={empty || !canAddRight || node.isRootCause} onClick={onAddRight}
                    title="Agregar por qué a la derecha"
                    className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <ArrowRight className="w-3 h-3" />
                </button>
                {/* ✓ */}
                <button type="button" disabled={empty || hasRightChild} onClick={onToggleRoot}
                    title={node.isRootCause ? 'Quitar causa raíz' : 'Marcar como causa raíz'}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                        node.isRootCause
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-400'
                    }`}>
                    <Check className="w-3 h-3" />
                </button>
            </div>
        </div>
    )
}

// ── SVG Connections ────────────────────────────────────────────────────────────

/**
 * Dibuja líneas en "L" entre nodos.
 * El punto de conexión de cada card es su centro vertical (CARD_H/2) y
 * mitad horizontal (CARD_W/2).
 */
function SvgConnections({ nodes, cvRow, totalCols, totalRows }: {
    nodes: GridNode[]
    cvRow: number
    totalCols: number
    totalRows: number
}) {
    const svgW = totalCols * CELL_W + CELL_W  // un poco de margen derecho
    const svgH = (totalRows + 1) * CELL_H

    // Centro de una celda
    const cx = (col: number) => col * CELL_W + CARD_W / 2
    const cy = (row: number) => row * CELL_H + CARD_H / 2

    const paths: React.ReactNode[] = []

    nodes.forEach(node => {
        if (node.kind === 'cv') return

        if (node.kind === 'why') {
            // Busca el nodo origen (padre o CV)
            let src: GridNode | undefined
            if (node.parentId) {
                src = nodes.find(n => n.id === node.parentId)
            } else {
                // Es un "top why" (col=1): conecta desde la CV en la misma fila
                // Si no hay CV explícita en esa fila, conecta desde la CV principal
                src = nodes.find(n => n.kind === 'cv')
            }
            if (!src) return

            const x1 = cx(src.col)
            const y1 = src.kind === 'cv' ? cy(cvRow) : cy(src.row)
            const x2 = cx(node.col)
            const y2 = cy(node.row)

            let d: string
            if (y1 === y2) {
                // misma fila → línea recta
                d = `M ${x1},${y1} L ${x2},${y2}`
            } else {
                // distinta fila → "L" shape: baja primero, luego va a la derecha
                d = `M ${x1},${y1} L ${x1},${y2} L ${x2},${y2}`
            }

            paths.push(
                <path key={`${src.id}-${node.id}`} d={d}
                    stroke="#D1D5DB" strokeWidth="2" fill="none" strokeLinecap="round" />
            )
        }

        if (node.kind === 'root') {
            // Conecta desde el "why" que lo originó
            const why = nodes.find(n => n.id === node.parentId)
            if (!why) return
            const x1 = cx(why.col)
            const y1 = cy(why.row)
            const x2 = cx(node.col)
            const y2 = cy(node.row)
            const d = `M ${x1},${y1} L ${x2},${y1} L ${x2},${y2}`
            // Si están en la misma fila, línea recta
            const dStraight = `M ${x1},${y1} L ${x2},${y2}`
            paths.push(
                <path key={`root-${node.id}`} d={y1 === y2 ? dStraight : d}
                    stroke="#D1D5DB" strokeWidth="2" fill="none" strokeLinecap="round" />
            )
        }
    })

    return (
        <svg
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
            width={svgW}
            height={svgH}
            overflow="visible"
        >
            {paths}
        </svg>
    )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export const Whys = () => {
    const form3 = useStepForm(3)
    const form4 = useStepForm(4)
    const { registerStepSubmit } = useFormActions()

    const [sections, setSections] = useState<Section[]>([])
    const sectionsRef = useRef<Section[]>([])
    sectionsRef.current = sections

    // ── Sync desde PossibleCauses ──────────────────────────────────────────────

    const syncFromCausas = (causas: { descripcion: string; clasificacion: string; verificado: boolean }[]) => {
        const verified = causas.filter(c => c?.verificado && c?.descripcion?.trim())
        setSections(prev => {
            const base: Section[] = prev.length > 0 ? prev : form4.getValues('sections').map(s => ({
                id: s.id,
                name: s.causaValidada,
                nodes: s.nodes as GridNode[],
            }))
            return verified.map(c => {
                const existing = base.find(s => s.name === c.descripcion)
                if (existing) return existing

                // Crear sección nueva con un solo why en (col=1, row=0)
                const cvId = uid()
                const why1Id = uid()
                return {
                    id: uid(),
                    name: c.descripcion,
                    nodes: [
                        {
                            id: cvId,
                            kind: 'cv' as NodeKind,
                            col: CV_COL,
                            row: 0,
                            text: c.descripcion,
                            isRootCause: false,
                            parentId: null,
                        },
                        {
                            id: why1Id,
                            kind: 'why' as NodeKind,
                            col: WHY_COL,
                            row: 0,
                            text: '',
                            isRootCause: false,
                            parentId: cvId,
                        },
                    ],
                }
            })
        })
    }

    useEffect(() => { syncFromCausas(form3.getValues('causas')) }, [])
    useEffect(() => {
        const sub = form3.watch(v => syncFromCausas((v.causas ?? []) as any))
        return () => sub.unsubscribe()
    }, [])

    // Sincroniza el estado local de secciones hacia form4 cada vez que cambia
    useEffect(() => {
        form4.setValue('sections', sections.map(s => ({
            id: s.id,
            causaValidada: s.name,
            nodes: s.nodes,
        })))
    }, [sections])

    useEffect(() => {
        registerStepSubmit(4, () => {
            const data = sectionsRef.current.map(s => ({
                id: s.id,
                causaValidada: s.name,
                nodes: s.nodes,
            }))
            form4.setValue('sections', data)
            console.log('[Step 4] Por qués:', data)
        })
    }, [])

    // ── Mutations ──────────────────────────────────────────────────────────────

    const updateSection = (sid: string, fn: (s: Section) => Section) =>
        setSections(prev => prev.map(s => s.id === sid ? fn(s) : s))

    const updateNode = (sid: string, nid: string, fn: (n: GridNode) => GridNode) =>
        updateSection(sid, s => ({ ...s, nodes: s.nodes.map(n => n.id === nid ? fn(n) : n) }))

    /** Agrega un "why" a la derecha del nodo dado */
    const addRight = (sid: string, node: GridNode) => {
        const section = sections.find(s => s.id === sid)!
        const newCol = node.col + 1
        const newId = uid()
        // Si hay un rootCause en esa fila, desplazarlo
        const newNodes = section.nodes.map(n => {
            if (n.kind === 'root' && n.row === node.row) {
                return { ...n, col: n.col + 1 }
            }
            return n
        })
        newNodes.push({
            id: newId,
            kind: 'why',
            col: newCol,
            row: node.row,
            text: '',
            isRootCause: false,
            parentId: node.id,
        })
        updateSection(sid, s => ({ ...s, nodes: newNodes }))
    }

    /** Agrega un "why" abajo del nodo dado (hijo directo del nodo, añade un nivel al label) */
    const addDown = (sid: string, sourceNode: GridNode) => {
        const insertRow = sourceNode.row + 1
        const newId = uid()

        updateSection(sid, s => ({
            ...s,
            nodes: [
                // Desplaza hacia abajo todos los nodos que estén en insertRow o más abajo
                ...s.nodes.map(n => n.row >= insertRow ? { ...n, row: n.row + 1 } : n),
                {
                    id: newId,
                    kind: 'why',
                    col: sourceNode.col,
                    row: insertRow,
                    text: '',
                    isRootCause: false,
                    parentId: sourceNode.id,
                },
            ],
        }))
    }

    /** Agrega una cadena nueva desde la Causa Validada (CV) */
    const addFromCV = (sid: string) => {
        const section = sections.find(s => s.id === sid)!
        const cv = section.nodes.find(n => n.kind === 'cv')!
        const maxRow = Math.max(...section.nodes.map(n => n.row))
        const newId = uid()
        updateSection(sid, s => ({
            ...s,
            nodes: [
                ...s.nodes,
                {
                    id: newId,
                    kind: 'why',
                    col: WHY_COL,
                    row: maxRow + 1,
                    text: '',
                    isRootCause: false,
                    parentId: cv.id,
                },
            ],
        }))
    }

    /** Marca / desmarca un why como causa raíz y gestiona el nodo root */
    const toggleRoot = (sid: string, node: GridNode) => {
        const section = sections.find(s => s.id === sid)!
        const isNowRoot = !node.isRootCause
        const rcCol = rootCol(section.nodes) + (isNowRoot ? 1 : 0)

        if (isNowRoot) {
            // Quitar cualquier root previo en esa fila
            const withoutOldRoot = section.nodes.filter(
                n => !(n.kind === 'root' && n.row === node.row)
            )
            const newRootId = uid()
            updateSection(sid, s => ({
                ...s,
                nodes: [
                    ...withoutOldRoot.map(n => n.id === node.id ? { ...n, isRootCause: true } : n),
                    {
                        id: newRootId,
                        kind: 'root',
                        col: rootCol(withoutOldRoot) + 1,
                        row: node.row,
                        text: node.text,
                        isRootCause: false,
                        parentId: node.id,
                    },
                ],
            }))
        } else {
            updateSection(sid, s => ({
                ...s,
                nodes: s.nodes
                    .map(n => n.id === node.id ? { ...n, isRootCause: false } : n)
                    .filter(n => !(n.kind === 'root' && n.parentId === node.id)),
            }))
        }
    }

    /** Elimina un nodo y todos sus descendientes */
    const deleteNode = (sid: string, nodeId: string) => {
        updateSection(sid, s => {
            const collectDescendants = (ids: string[]): string[] => {
                const children = s.nodes.filter(n => n.parentId && ids.includes(n.parentId))
                if (children.length === 0) return []
                return [...children.map(n => n.id), ...collectDescendants(children.map(n => n.id))]
            }
            const toRemove = new Set([nodeId, ...collectDescendants([nodeId])])
            let newNodes = s.nodes.filter(n => !toRemove.has(n.id))

            // Garantiza al menos un why top-level
            const cv = newNodes.find(n => n.kind === 'cv')
            if (cv && !newNodes.some(n => n.kind === 'why' && n.parentId === cv.id)) {
                newNodes = [
                    ...newNodes,
                    { id: uid(), kind: 'why', col: WHY_COL, row: 0, text: '', isRootCause: false, parentId: cv.id },
                ]
            }

            // Compacta los rows: elimina huecos reindexando de forma consecutiva
            const usedRows = [...new Set(newNodes.map(n => n.row))].sort((a, b) => a - b)
            const rowMap = new Map(usedRows.map((r, i) => [r, i]))
            newNodes = newNodes.map(n => ({ ...n, row: rowMap.get(n.row) ?? n.row }))

            return { ...s, nodes: newNodes }
        })
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    if (sections.length === 0) {
        return (
            <div className="flex flex-col px-10">
                <div className="card flex items-center justify-center h-32 text-sm text-gray-400">
                    No hay causas verificadas. Ve al paso anterior y activa al menos una causa.
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col px-10 gap-6">
            {sections.map((section, idx) => {
                const nodes = section.nodes
                const maxRow = Math.max(...nodes.map(n => n.row))
                const totalCols = rootCol(nodes) + 2
                const totalRows = maxRow + 1
                const svgH = (totalRows + 1) * CELL_H
                const svgW = totalCols * CELL_W + 40

                // CV siempre centrada verticalmente
                const cv = nodes.find(n => n.kind === 'cv')!
                const cvScreenRow = Math.floor(maxRow / 2) // centrar visualmente si hay múltiples rows

                return (
                    <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                        {/* Header */}
                        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 rounded-t-xl">
                            <span className="text-sm font-semibold text-gray-600">{section.name}</span>
                        </div>

                        {/* Canvas scrollable */}
                        <div className="overflow-auto p-4">
                            <div
                                style={{
                                    position: 'relative',
                                    width: svgW,
                                    height: svgH,
                                    minWidth: '100%',
                                }}
                            >
                                {/* SVG connections */}
                                <SvgConnections
                                    nodes={nodes}
                                    cvRow={cvScreenRow}
                                    totalCols={totalCols}
                                    totalRows={totalRows}
                                />

                                {/* CV Card */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: cv.col * CELL_W,
                                        top: cvScreenRow * CELL_H,
                                    }}
                                >
                                    <CausaValidadaCard
                                        name={section.name}
                                        onAddDown={() => addFromCV(section.id)}
                                    />
                                </div>

                                {/* Why Cards */}
                                {nodes.filter(n => n.kind === 'why').map(node => {
                                    const label = buildLabel(nodes, node)
                                    // ¿Ya hay un hijo a la derecha? (mismo row, parentId = este nodo)
                                    const rightNeighbor = nodes.find(
                                        n => n.kind === 'why' && n.parentId === node.id && n.row === node.row
                                    )
                                    // Límite horizontal: el último número del label no puede superar 5
                                    const lastNum = parseInt(label.split('.').pop() || '0')
                                    const canAddRight = !rightNeighbor && !node.isRootCause && lastNum < 5
                                    // ¿Ya hay un hijo abajo? (distinto row, parentId = este nodo)
                                    const belowChild = nodes.find(
                                        n => n.kind === 'why' && n.parentId === node.id && n.row !== node.row
                                    )
                                    const canAddDown = !belowChild && !node.isRootCause

                                    return (
                                        <div
                                            key={node.id}
                                            style={{
                                                position: 'absolute',
                                                left: node.col * CELL_W,
                                                top: node.row * CELL_H,
                                            }}
                                        >
                                            <WhyCard
                                                label={label}
                                                node={node}
                                                canAddRight={canAddRight}
                                                canAddDown={canAddDown}
                                                hasRightChild={!!rightNeighbor}
                                                onText={t => updateNode(section.id, node.id, n => ({ ...n, text: t }))}
                                                onAddRight={() => addRight(section.id, node)}
                                                onAddDown={() => addDown(section.id, node)}
                                                onToggleRoot={() => toggleRoot(section.id, node)}
                                                onDelete={() => deleteNode(section.id, node.id)}
                                            />
                                        </div>
                                    )
                                })}

                                {/* Root Cause Cards */}
                                {nodes.filter(n => n.kind === 'root').map(node => {
                                    // Sincronizar texto con el why que lo origina
                                    const whyParent = nodes.find(n => n.id === node.parentId)
                                    return (
                                        <div
                                            key={node.id}
                                            style={{
                                                position: 'absolute',
                                                left: node.col * CELL_W,
                                                top: node.row * CELL_H,
                                            }}
                                        >
                                            <RootCauseCard text={whyParent?.text ?? node.text} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
