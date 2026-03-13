import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/** Remove uma imagem da galeria. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.galleryImage.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir imagem da galeria:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir imagem' },
      { status: 500 }
    )
  }
}
