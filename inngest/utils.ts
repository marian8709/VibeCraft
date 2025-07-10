import { Sandbox } from 'e2b'

export const getSandbox = async (sandboxId: Promise<string>) => {
  const getSandboxId = await sandboxId;
  const sandbox = await Sandbox.connect(getSandboxId);
  return sandbox;
}