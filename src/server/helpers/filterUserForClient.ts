import type { User } from "@clerk/nextjs/server";

export const filterUserForClient = (user: User) => {
    return{
        id: user.id,
        username: user.username,
        profileImageUrl: user.imageUrl,
    };
};
