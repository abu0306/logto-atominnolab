import { z } from 'zod';

export const wechatBridgeConnectorConfigGuard = z.object({
  wechatUrl: z.string(),
  wechatConfirmPrompt: z.string().optional(),
  wechatConfirmPromptEn: z.string().optional(),
  wechatConfirmPromptZhCn: z.string().optional(),
});
