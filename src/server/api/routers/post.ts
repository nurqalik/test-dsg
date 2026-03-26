import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const kendaraanRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ merk: z.string(), jenis: z.string(), stock: z.number(), harga: z.number(), keterangan: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.kendaraan.create({
        data: {
          merk: input.merk,
          jenis: input.jenis,
          stock: input.stock,
          harga: input.harga,
          keterangan: input.keterangan,
        },
      });
    }),

  getAllKendaraan: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        searchQuery: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const where = input.searchQuery
        ? {
            OR: [
              { merk: { contains: input.searchQuery, mode: "insensitive" as const } },
              { jenis: { contains: input.searchQuery, mode: "insensitive" as const } },
              { keterangan: { contains: input.searchQuery, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [items, total] = await Promise.all([
        ctx.db.kendaraan.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: input.limit,
        }),
        ctx.db.kendaraan.count({ where }),
      ]);

      return {
        items,
        total,
      };
    }),

  updateKendaraan: publicProcedure
    .input(z.object({ id: z.number(), merk: z.string(), jenis: z.string(), stock: z.number(), harga: z.number(), keterangan: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.kendaraan.update({
        where: { id: input.id },
        data: {
          merk: input.merk,
          jenis: input.jenis,
          stock: input.stock,
          harga: input.harga,
          keterangan: input.keterangan,
        },
      });
    }),

  deleteKendaraan: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.kendaraan.delete({
        where: { id: input.id },
      });
    }),
});
