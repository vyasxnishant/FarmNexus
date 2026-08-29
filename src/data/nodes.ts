export interface NodeData {
  id: number
  position: [number, number, number]
  label: string
  region: string
}

// Positions approximate major agricultural hubs across India
// Mapped to a coordinate space where India spans roughly x:[-3,3], y:[-4.5,4.5]
export const nodeData: NodeData[] = [
  { id: 0, position: [-1.0, 3.8, 0], label: 'Amritsar', region: 'Punjab' },
  { id: 1, position: [-0.2, 3.4, 0], label: 'Karnal', region: 'Haryana' },
  { id: 2, position: [0.5, 3.0, 0], label: 'Lucknow', region: 'UP' },
  { id: 3, position: [-2.0, 2.5, 0], label: 'Jodhpur', region: 'Rajasthan' },
  { id: 4, position: [-0.8, 2.2, 0], label: 'Jaipur', region: 'Rajasthan' },
  { id: 5, position: [0.2, 2.0, 0], label: 'Kanpur', region: 'UP' },
  { id: 6, position: [1.5, 2.5, 0], label: 'Patna', region: 'Bihar' },
  { id: 7, position: [2.5, 2.8, 0], label: 'Guwahati', region: 'Assam' },
  { id: 8, position: [-1.5, 1.2, 0], label: 'Ahmedabad', region: 'Gujarat' },
  { id: 9, position: [-0.5, 1.0, 0], label: 'Indore', region: 'MP' },
  { id: 10, position: [0.5, 1.2, 0], label: 'Bhopal', region: 'MP' },
  { id: 11, position: [1.5, 1.5, 0], label: 'Raipur', region: 'Chhattisgarh' },
  { id: 12, position: [2.0, 1.8, 0], label: 'Kolkata', region: 'WB' },
  { id: 13, position: [-2.0, 0.0, 0], label: 'Mumbai', region: 'Maharashtra' },
  { id: 14, position: [-0.8, -0.2, 0], label: 'Pune', region: 'Maharashtra' },
  { id: 15, position: [0.0, -0.5, 0], label: 'Nagpur', region: 'Maharashtra' },
  { id: 16, position: [1.2, 0.0, 0], label: 'Vizag', region: 'AP' },
  { id: 17, position: [-1.0, -1.5, 0], label: 'Hubli', region: 'Karnataka' },
  { id: 18, position: [0.5, -1.5, 0], label: 'Hyderabad', region: 'Telangana' },
  { id: 19, position: [1.5, -1.0, 0], label: 'Vijayawada', region: 'AP' },
  { id: 20, position: [-1.2, -2.5, 0], label: 'Bangalore', region: 'Karnataka' },
  { id: 21, position: [0.0, -2.8, 0], label: 'Chennai', region: 'TN' },
  { id: 22, position: [-0.8, -3.5, 0], label: 'Coimbatore', region: 'TN' },
  { id: 23, position: [-1.8, -2.0, 0], label: 'Mangalore', region: 'Karnataka' },
  { id: 24, position: [-0.2, -4.0, 0], label: 'Madurai', region: 'TN' },
  { id: 25, position: [0.3, 3.6, 0], label: 'Dehradun', region: 'Uttarakhand' },
  { id: 26, position: [-2.5, 0.5, 0], label: 'Surat', region: 'Gujarat' },
  { id: 27, position: [0.8, -0.3, 0], label: 'Warangal', region: 'Telangana' },
  { id: 28, position: [-0.3, -1.0, 0], label: 'Solapur', region: 'Maharashtra' },
  { id: 29, position: [1.0, -2.5, 0], label: 'Tirupati', region: 'AP' },
]

// Pre-computed connections: pairs of node IDs that should connect as scroll progresses.
// Connections form in waves: early (0-0.3), mid (0.3-0.6), late (0.6-1.0).
export interface ConnectionData {
  from: number
  to: number
  wave: number // 0 = early, 1 = mid, 2 = late
}

export const connectionData: ConnectionData[] = [
  // Wave 0 — nearby agricultural corridors
  { from: 0, to: 1, wave: 0 },
  { from: 1, to: 2, wave: 0 },
  { from: 3, to: 4, wave: 0 },
  { from: 4, to: 5, wave: 0 },
  { from: 6, to: 7, wave: 0 },
  { from: 8, to: 9, wave: 0 },
  { from: 9, to: 10, wave: 0 },
  { from: 13, to: 14, wave: 0 },
  { from: 17, to: 20, wave: 0 },
  { from: 21, to: 22, wave: 0 },
  // Wave 1 — regional links
  { from: 2, to: 5, wave: 1 },
  { from: 5, to: 6, wave: 1 },
  { from: 10, to: 11, wave: 1 },
  { from: 11, to: 12, wave: 1 },
  { from: 14, to: 15, wave: 1 },
  { from: 15, to: 18, wave: 1 },
  { from: 16, to: 19, wave: 1 },
  { from: 18, to: 19, wave: 1 },
  { from: 20, to: 21, wave: 1 },
  { from: 22, to: 24, wave: 1 },
  { from: 8, to: 26, wave: 1 },
  { from: 25, to: 2, wave: 1 },
  // Wave 2 — long-haul national connections
  { from: 0, to: 4, wave: 2 },
  { from: 4, to: 9, wave: 2 },
  { from: 9, to: 15, wave: 2 },
  { from: 15, to: 18, wave: 2 },
  { from: 13, to: 17, wave: 2 },
  { from: 6, to: 12, wave: 2 },
  { from: 12, to: 16, wave: 2 },
  { from: 18, to: 21, wave: 2 },
  { from: 20, to: 23, wave: 2 },
  { from: 21, to: 29, wave: 2 },
  { from: 27, to: 28, wave: 2 },
  { from: 26, to: 13, wave: 2 },
]
