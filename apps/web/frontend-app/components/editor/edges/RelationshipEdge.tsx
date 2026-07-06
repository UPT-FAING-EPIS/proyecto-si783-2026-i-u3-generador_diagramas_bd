'use client'

import { BaseEdge, EdgeLabelRenderer, getBezierPath, getSmoothStepPath, type EdgeProps } from '@xyflow/react'

export function RelationshipEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  label,
  data,
}: EdgeProps) {
  if (
    typeof sourceX !== 'number' ||
    typeof sourceY !== 'number' ||
    typeof targetX !== 'number' ||
    typeof targetY !== 'number' ||
    Number.isNaN(sourceX) ||
    Number.isNaN(targetX)
  ) {
    return null
  }

  let [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  if (data?.pathType === 'step') {
    const [stepPath, stepLabelX, stepLabelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 0,
    })
    edgePath = stepPath
    labelX = stepLabelX
    labelY = stepLabelY
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="absolute text-[10px] font-semibold text-[#1A6CF6] bg-card px-1 rounded pointer-events-none border border-border"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
