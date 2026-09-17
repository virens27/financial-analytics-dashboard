export function buildTransactionFilter(query: any) {
  const { search, category, status, userId, dateFrom, dateTo, amountMin, amountMax } = query;

  const filter: any = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (userId) filter.userId = { $regex: userId as string, $options: "i" };

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom as string);
    if (dateTo) filter.date.$lte = new Date(dateTo as string);
  }

  if (amountMin || amountMax) {
    filter.amount = {};
    if (amountMin) filter.amount.$gte = Number(amountMin);
    if (amountMax) filter.amount.$lte = Number(amountMax);
  }

  if (search) {
    const searchRegex = { $regex: search as string, $options: "i" };
    filter.$or = [{ userId: searchRegex }, { category: searchRegex }, { status: searchRegex }];
  }

  return filter;
}