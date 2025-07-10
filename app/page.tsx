import { Suspense } from 'react';
import { trpc, getQueryClient } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import Client from './client';

const HomePage = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.createAi.queryOptions({ text: "From Vibe Craft" }))
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <Client />
      </Suspense>
    </HydrationBoundary>

  )
}

export default HomePage