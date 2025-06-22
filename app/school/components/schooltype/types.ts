import { LucideIcon } from 'lucide-react'

export interface Class {
  name: string
  age?: string | number
  description?: string
}

export interface Level {
  level: string
  classes: Class[]
  description?: string
}

export interface SchoolType {
  id: string
  icon: LucideIcon
  title: string
  description: string
  emoji?: string
  menu: string[]
  levels: Level[]
}
