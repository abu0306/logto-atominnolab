import { z } from 'zod';

export const wechatBridgeConnectorConfigGuard = z.object({
  wechatUrl: z.string(),
  wechatConfirmPrompt: z.string().optional(),
  wechatConfirmPromptEn: z.string().optional(),
  wechatConfirmPromptZhCn: z.string().optional(),
  wechatConfirmButtonText: z.string().optional(),
  wechatConfirmButtonTextEn: z.string().optional(),
  wechatConfirmButtonTextZhCn: z.string().optional(),
  wechatCancelButtonText: z.string().optional(),
  wechatCancelButtonTextEn: z.string().optional(),
  wechatCancelButtonTextZhCn: z.string().optional(),
});
