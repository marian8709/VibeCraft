"use client";

"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const HomePage = () => {
  const [value, setValue] = useState("");
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess: () => {
      toast.success("Background Job Started Successfully!");
    }
  }))
  return (
    <div className="p-4 max-2-7xl mx-auto">
      <Input value={value} onChange={(e) => setValue(e.target.value)}/>
      <Button disabled={invoke.isPending} onClick={() => invoke.mutate({ value })}>Invoke Background Job</Button>
    </div>
  )
}

export default HomePage