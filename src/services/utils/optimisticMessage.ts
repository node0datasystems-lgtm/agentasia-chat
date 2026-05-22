export const isOptimisticMessageId = (id?: string | null) => id?.startsWith('tmp_') ?? false;

export const omitOptimisticParentId = <T extends { parentId?: string | null }>(message: T): T => {
  if (!isOptimisticMessageId(message.parentId)) return message;

  return { ...message, parentId: undefined };
};
