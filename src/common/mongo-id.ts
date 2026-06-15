import { Model } from 'mongoose';

export async function nextNumericId(
  model: Model<{ id: number }>,
): Promise<number> {
  const last = await model.findOne().sort({ id: -1 }).select('id').lean();
  return (last?.id ?? 0) + 1;
}
