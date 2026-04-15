import { Prisma } from '@prisma/client'

type WhereInput = Prisma.ProjectWhereInput

export const buildSearch = <W extends WhereInput>(
  searchParams?: Record<string, string | undefined>,
  fields: readonly string[] = []
): Partial<W> => {
  const search = searchParams?.search

  if (!search || fields.length === 0) {
    return {}
  }

  const OR: WhereInput[] = fields.map((field) => {
    const parts = field.split('.')

    const leaf = {
      contains: search,
      mode: 'insensitive',
    } satisfies Prisma.StringFilter

    return parts.reduceRight((acc, key) => {
      return {
        [key]: acc,
      } as WhereInput
    }, leaf as any)
  })

  return {
    OR,
  } as Partial<W>
}
