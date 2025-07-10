"use client";

import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from '@/components/ui/button'

const Client = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.createAi.queryOptions({ text: "From Vibe Craft" }))
  return (
    <div>
      <Button variant={"default"}>{data?.greeting}</Button>
    </div>
  )
}

export default Client;