import type React from "react"

export const Area = () => (
  <div style={{ width: "100%", height: "100%", border: "1px solid black" }}>Area Chart Placeholder</div>
)
export const Bar = () => (
  <div style={{ width: "100%", height: "100%", border: "1px solid black" }}>Bar Chart Placeholder</div>
)
export const CartesianGrid = () => (
  <div style={{ width: "100%", height: "100%", border: "1px solid black" }}>Cartesian Grid Placeholder</div>
)
export const ComposedChart = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: "100%", height: "100%", border: "1px solid black" }}>Composed Chart Placeholder{children}</div>
)
export const Legend = () => (
  <div style={{ width: "100%", height: "100%", border: "1px solid black" }}>Legend Placeholder</div>
)
export const Line = () => (
  <div style={{ width: "100%", height: "100%", border: "1px solid black" }}>Line Chart Placeholder</div>
)
export const ResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: "100%", height: "100%", border: "1px solid black" }}>
    Responsive Container Placeholder{children}
  </div>
)
export const Tooltip = () => (
  <div style={{ width: "100%", height: "100%", border: "1px solid black" }}>Tooltip Placeholder</div>
)
export const XAxis = () => (
  <div style={{ width: "100%", height: "100%", border: "1px solid black" }}>XAxis Placeholder</div>
)
export const YAxis = () => (
  <div style={{ width: "100%", height: "100%", border: "1px solid black" }}>YAxis Placeholder</div>
)

