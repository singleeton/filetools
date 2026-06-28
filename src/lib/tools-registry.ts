import type { Tool } from '@/types/tool'

export const tools: Tool[] = [
  { id: 'pdf-merge', name: 'PDF Merge', description: 'Combine multiple PDF files into one document', href: '/pdf-merge', category: 'pdf', icon: 'Merge' },
  { id: 'pdf-split', name: 'PDF Split', description: 'Split a PDF file into separate pages or sections', href: '/pdf-split', category: 'pdf', icon: 'Scissors' },
  { id: 'pdf-compress', name: 'PDF Compress', description: 'Reduce PDF file size by compressing images', href: '/pdf-compress', category: 'pdf', icon: 'FileDown' },
  { id: 'pdf-rotate', name: 'PDF Rotate', description: 'Rotate PDF pages by any angle', href: '/pdf-rotate', category: 'pdf', icon: 'RotateCw' },
  { id: 'word-to-pdf', name: 'Word to PDF', description: 'Convert DOCX files to PDF format', href: '/word-to-pdf', category: 'convert', icon: 'FileText' },
  { id: 'pdf-to-word', name: 'PDF to Word', description: 'Convert PDF files to editable DOCX format', href: '/pdf-to-word', category: 'convert', icon: 'FileOutput' },
  { id: 'pdf-to-excel', name: 'PDF to Excel', description: 'Convert PDF to Excel spreadsheet', href: '/pdf-to-excel', category: 'convert', icon: 'Sheet' },
  { id: 'jpg-to-png', name: 'JPG to PNG', description: 'Convert JPEG images to PNG format', href: '/jpg-to-png', category: 'image', icon: 'Image' },
  { id: 'png-to-jpg', name: 'PNG to JPG', description: 'Convert PNG images to JPEG format', href: '/png-to-jpg', category: 'image', icon: 'Image' },
  { id: 'image-resize', name: 'Image Resize', description: 'Resize images to any dimension', href: '/image-resize', category: 'image', icon: 'Maximize' },
  { id: 'remove-bg', name: 'Remove Background', description: 'Remove background with interactive editor', href: '/remove-bg', category: 'image', icon: 'Eraser' },
]

export function getToolById(id: string): Tool | undefined {
  return tools.find((tool) => tool.id === id)
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((tool) => tool.category === category)
}
