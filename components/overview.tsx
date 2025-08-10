"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Jan",
    total: 1200,
    attempts: 2400,
  },
  {
    name: "Feb",
    total: 1900,
    attempts: 3200,
  },
  {
    name: "Mar",
    total: 2100,
    attempts: 3800,
  },
  {
    name: "Apr",
    total: 1800,
    attempts: 3400,
  },
  {
    name: "May",
    total: 2400,
    attempts: 4200,
  },
  {
    name: "Jun",
    total: 2800,
    attempts: 4800,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} name="New Users" />
        <Bar dataKey="attempts" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Test Attempts" />
      </BarChart>
    </ResponsiveContainer>
  )
}
