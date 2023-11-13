import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

const filterUserForClient = (user: User) => {
    return{
        id: user.id,
        // CURRENTLY PULLING FIRST NAME becuase no username in Google account. Need to add a setup wizard 
        username: user.firstName,
        profileImageUrl: user.imageUrl,
    };
};


export const postsRouter = createTRPCRouter({
    getAll: publicProcedure
    .query(async ({ ctx }) => {
        const posts = await ctx.db.post.findMany({
            take: 100,
        });

        const users = (
            await clerkClient.users.getUserList({
                userId: posts.map((post) => post.authorId),
                limit: 100,
            })
        ).map(filterUserForClient)

        console.log(users)

        return posts.map((post) => {
            const author = users.find((user) => user.id === post.authorId);

            if (!author || !author.username) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Author for post not found"});

            return {
                post, 
                author: {
                    ...author,
                    username: author.username,
                },
            };
        });
    }),

    create: privateProcedure
        .input(
            z.object({
                content: z.string().emoji().min(1).max(255),
            })
        )
        .mutation(async ({ ctx, input }) => {
        const authorId = ctx.currentUser;

        const post = await ctx.db.post.create({
            data: {
                authorId,
                content: input.content,
            }
        })

        return post;

    }),

});

