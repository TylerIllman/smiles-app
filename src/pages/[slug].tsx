import Head from "next/head";

import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingSpinner } from "~/components/loading";
dayjs.extend(relativeTime);

import { createServerSideHelpers } from "@trpc/react-query/server";
// import { createContext } from "~/server/context";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import superjson from "superjson";
import type { GetStaticProps, NextPage } from "next";
import { PageLayout } from "~/components/layout";
import Image from "next/image";

type PageProps = NextPage<{ username: string }>;
const ProfilePage: PageProps = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) return <LoadingSpinner />;

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
        <meta name="description" content={`${data.username}'s account`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${data.username ?? ""}'s profile picture`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${
          data.username ?? ""
        }`}</div>
        <div className="w-full border-b border-slate-400"></div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, currentUser: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("no slug");
  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username: username });

  return {
    props: {
      trpcsState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
