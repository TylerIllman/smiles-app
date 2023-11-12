import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const postsRouter = createTRPCRouter({
    getAll: publicProcedure
    .query(({ ctx }) => {
        return ctx.db.post.findMany();
    })
});