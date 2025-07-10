"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const HomePage = () => {
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess: () => {
      toast.success("Background Job Started Successfully!");
    }
  }))
  return (
    <div className="p-4 max-2-7xl mx-auto">
      <Button onClick={() => invoke.mutate({ text: "VibeCraft" })}>Invoke Background Job</Button>
    </div>
  )
}

export default HomePage