export const formatCurrency = (amount, currency = 'EGP', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (dateString, locale = 'en-US') => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatTime = (timeString, locale = 'en-US') => {
  if (!timeString) return '-';
  try {
    const date = new Date(timeString);
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return timeString;
  }
};
